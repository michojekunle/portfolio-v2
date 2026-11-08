import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { z } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getObjectivesWithMilestones, getRecentEntries } from "@/lib/journal/queries";
import type { JoEntry, JoObjectiveWithMilestones } from "@/lib/journal/types";

const DEFAULT_MODEL_CHAIN = [
  "google:gemini-2.5-flash",
  "google:gemini-2.5-flash-lite",
  "groq:llama-3.1-8b-instant",
];

const MAX_DAILY_PRIORITIES = 3;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Actions the model may emit — each is validated then executed server-side ──

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("set_priorities"),
    date: DateStr.optional(),
    priorities: z.array(z.string().min(1).max(500)).min(1).max(MAX_DAILY_PRIORITIES),
  }),
  z.object({
    type: z.literal("log_accomplishments"),
    date: DateStr.optional(),
    items: z.array(z.string().min(1).max(500)).min(1).max(10),
  }),
  z.object({
    type: z.literal("log_note"),
    date: DateStr.optional(),
    note: z.string().min(1).max(4000),
  }),
  z.object({
    type: z.literal("set_blockers"),
    date: DateStr.optional(),
    blockers: z.string().min(1).max(2000),
  }),
  z.object({
    type: z.literal("set_energy"),
    date: DateStr.optional(),
    level: z.number().int().min(1).max(5),
  }),
  z.object({
    type: z.literal("create_objective"),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).nullable().optional(),
    target_date: DateStr.nullable().optional(),
    priority: z.enum(["high", "medium", "low"]).optional(),
  }),
  z.object({
    type: z.literal("create_milestone"),
    objective_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    due_date: DateStr.nullable().optional(),
  }),
  z.object({
    type: z.literal("complete_milestone"),
    milestone_id: z.string().uuid(),
  }),
  z.object({
    type: z.literal("update_objective_status"),
    objective_id: z.string().uuid(),
    status: z.enum(["active", "completed", "paused", "dropped"]),
  }),
]);

type AssistantAction = z.infer<typeof ActionSchema>;

interface ExecutedAction {
  type: AssistantAction["type"];
  summary: string;
  ok: boolean;
}

// ── Entry merge helpers ───────────────────────────────────────────────────────

async function getEntry(supabase: SupabaseClient, userId: string, date: string): Promise<JoEntry | null> {
  const { data } = await supabase
    .from("jo_entries")
    .select("*")
    .eq("date", date)
    .eq("user_id", userId)
    .single();
  return (data ?? null) as JoEntry | null;
}

async function upsertEntry(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  patch: Partial<Pick<JoEntry, "top_priorities" | "accomplished" | "blockers" | "notes" | "energy_level">>
): Promise<boolean> {
  const existing = await getEntry(supabase, userId, date);
  const { error } = await supabase.from("jo_entries").upsert(
    {
      user_id: userId,
      date,
      top_priorities: patch.top_priorities ?? existing?.top_priorities ?? [],
      accomplished: patch.accomplished ?? existing?.accomplished ?? [],
      blockers: patch.blockers !== undefined ? patch.blockers : existing?.blockers ?? null,
      notes: patch.notes !== undefined ? patch.notes : existing?.notes ?? null,
      energy_level: patch.energy_level !== undefined ? patch.energy_level : existing?.energy_level ?? null,
      objective_ids: existing?.objective_ids ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );
  if (error) console.error("[journal/assistant] entry upsert error:", error);
  return !error;
}

// ── Action executor — every mutation is scoped to the authed user ────────────

async function executeAction(
  supabase: SupabaseClient,
  user: User,
  action: AssistantAction,
  objectives: JoObjectiveWithMilestones[],
  today: string
): Promise<ExecutedAction> {
  const date = "date" in action && action.date ? action.date : today;

  switch (action.type) {
    case "set_priorities": {
      const priorities = action.priorities.slice(0, MAX_DAILY_PRIORITIES);
      const ok = await upsertEntry(supabase, user.id, date, { top_priorities: priorities });
      return {
        type: action.type,
        summary: `Set ${priorities.length} ${priorities.length === 1 ? "priority" : "priorities"} for ${date === today ? "today" : date}`,
        ok,
      };
    }
    case "log_accomplishments": {
      const existing = await getEntry(supabase, user.id, date);
      const merged = [...(existing?.accomplished ?? []), ...action.items].slice(0, 10);
      const ok = await upsertEntry(supabase, user.id, date, { accomplished: merged });
      return { type: action.type, summary: `Logged ${action.items.length} accomplishment(s)`, ok };
    }
    case "log_note": {
      const existing = await getEntry(supabase, user.id, date);
      const merged = existing?.notes ? `${existing.notes}\n\n${action.note}` : action.note;
      const ok = await upsertEntry(supabase, user.id, date, { notes: merged.slice(0, 5000) });
      return { type: action.type, summary: "Added a note to your log", ok };
    }
    case "set_blockers": {
      const ok = await upsertEntry(supabase, user.id, date, { blockers: action.blockers });
      return { type: action.type, summary: "Recorded blockers", ok };
    }
    case "set_energy": {
      const ok = await upsertEntry(supabase, user.id, date, { energy_level: action.level });
      return { type: action.type, summary: `Set energy level to ${action.level}/5`, ok };
    }
    case "create_objective": {
      const { error } = await supabase.from("jo_objectives").insert({
        user_id: user.id,
        title: action.title,
        description: action.description ?? null,
        target_date: action.target_date ?? null,
        priority: action.priority ?? "medium",
        status: "active",
      });
      if (error) console.error("[journal/assistant] create_objective error:", error);
      return { type: action.type, summary: `Created objective "${action.title}"`, ok: !error };
    }
    case "create_milestone": {
      if (!objectives.some((o) => o.id === action.objective_id)) {
        return { type: action.type, summary: "Skipped milestone — unknown objective", ok: false };
      }
      const { error } = await supabase.from("jo_milestones").insert({
        user_id: user.id,
        objective_id: action.objective_id,
        title: action.title,
        due_date: action.due_date ?? null,
        is_done: false,
      });
      if (error) console.error("[journal/assistant] create_milestone error:", error);
      return { type: action.type, summary: `Added milestone "${action.title}"`, ok: !error };
    }
    case "complete_milestone": {
      const owned = objectives.some((o) => o.milestones.some((m) => m.id === action.milestone_id));
      if (!owned) return { type: action.type, summary: "Skipped — unknown milestone", ok: false };
      const { error } = await supabase
        .from("jo_milestones")
        .update({ is_done: true })
        .eq("id", action.milestone_id)
        .eq("user_id", user.id);
      if (error) console.error("[journal/assistant] complete_milestone error:", error);
      return { type: action.type, summary: "Marked milestone as done", ok: !error };
    }
    case "update_objective_status": {
      if (!objectives.some((o) => o.id === action.objective_id)) {
        return { type: action.type, summary: "Skipped — unknown objective", ok: false };
      }
      const { error } = await supabase
        .from("jo_objectives")
        .update({ status: action.status, updated_at: new Date().toISOString() })
        .eq("id", action.objective_id)
        .eq("user_id", user.id);
      if (error) console.error("[journal/assistant] update_objective_status error:", error);
      const obj = objectives.find((o) => o.id === action.objective_id);
      return { type: action.type, summary: `Marked "${obj?.title ?? "objective"}" as ${action.status}`, ok: !error };
    }
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:assistant:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let body: { messages: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const [objectives, recentEntries] = await Promise.all([
    getObjectivesWithMilestones(),
    getRecentEntries(60),
  ]);

  const today = new Date().toLocaleDateString("en-CA");
  const todayEntry = recentEntries.find((e) => e.date === today) ?? null;

  const streak = (() => {
    let count = 0;
    const cursor = new Date();
    const doneSet = new Set(recentEntries.map((e) => e.date));
    while (true) {
      const d = cursor.toLocaleDateString("en-CA");
      if (!doneSet.has(d)) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  const objectivesCtx = objectives.length > 0
    ? objectives
        .map((o) => {
          const ms = o.milestones
            .map((m) => `    - [${m.is_done ? "x" : " "}] "${m.title}" (id: ${m.id}${m.due_date ? `, due ${m.due_date}` : ""})`)
            .join("\n");
          return `- "${o.title}" (id: ${o.id}, status: ${o.status}, priority: ${o.priority})${ms ? `\n${ms}` : ""}`;
        })
        .join("\n")
    : "The user has no objectives yet.";

  const todayCtx = todayEntry
    ? `Today's log so far:
- Priorities: ${todayEntry.top_priorities.length > 0 ? todayEntry.top_priorities.map((p) => `"${p}"`).join(", ") : "none set"}
- Accomplished: ${todayEntry.accomplished.length > 0 ? todayEntry.accomplished.map((a) => `"${a}"`).join(", ") : "nothing logged"}
- Blockers: ${todayEntry.blockers ?? "none"}
- Energy: ${todayEntry.energy_level ?? "not set"}/5`
    : "The user has not logged anything today yet.";

  const recentCtx = recentEntries
    .slice(0, 7)
    .map((e) => `- ${e.date}: ${e.top_priorities.length} priorities, ${e.accomplished.length} accomplished, energy ${e.energy_level ?? "?"}/5`)
    .join("\n");

  const systemPrompt = `You are the Vela Guide — a sharp, warm personal productivity coach inside Vela, a journal app for objectives, milestones, and daily logs. Today is ${today}.

You can DIRECTLY take actions on the user's behalf by including them in the "actions" array. Actions are executed immediately — use them whenever the user asks you to log, set, plan, create, or complete anything. Don't ask for confirmation on straightforward requests; just do it and confirm in your reply.

COACHING RULES (these are core to your personality):
1. A day has AT MOST ${MAX_DAILY_PRIORITIES} priorities. If the user lists more, push back: tell them honestly they're overcommitting, help them pick the ${MAX_DAILY_PRIORITIES} that matter most (ask what's deadline-driven vs. deferrable if unclear), and park the rest as milestones or tomorrow's candidates.
2. When you set priorities, follow with a short, concrete working plan: suggested order, rough time blocks, and ONE focus tip tailored to their situation (e.g. hardest thing first, phone in another room, 90-minute deep block before messages).
3. Plans are adjustable — if the user wants to swap or reorder, just re-set the priorities without friction.
4. When the user tells you about their day ("I did X", "struggled with Y", "feeling drained"), log it intelligently: accomplishments → log_accomplishments, obstacles → set_blockers, mood/energy → set_energy, everything else worth remembering → log_note. You can emit several actions in one turn.
5. For bigger goals, create an objective with 2-5 milestones as the outline. Suggest the outline, create it, and tell them what you created.
6. Reference their real data (streak, energy trends, unfinished priorities from recent days) when coaching. Keep replies to 2-5 sentences plus the plan when relevant — no fluff.

USER CONTEXT:
- Daily streak: ${streak} day(s)
- ${todayCtx}
- Last 7 days:
${recentCtx || "- no recent entries"}
- Objectives and milestones:
${objectivesCtx}

Respond in valid JSON ONLY, matching:
{
  "reply": "your conversational reply (markdown allowed: **bold**, lists)",
  "actions": [
    { "type": "set_priorities", "date": "YYYY-MM-DD (optional, defaults to today)", "priorities": ["max ${MAX_DAILY_PRIORITIES} strings"] },
    { "type": "log_accomplishments", "items": ["..."] },
    { "type": "log_note", "note": "..." },
    { "type": "set_blockers", "blockers": "..." },
    { "type": "set_energy", "level": 1-5 },
    { "type": "create_objective", "title": "...", "description": "... or null", "target_date": "YYYY-MM-DD or null", "priority": "high|medium|low" },
    { "type": "create_milestone", "objective_id": "uuid from the list above", "title": "...", "due_date": "YYYY-MM-DD or null" },
    { "type": "complete_milestone", "milestone_id": "uuid from the list above" },
    { "type": "update_objective_status", "objective_id": "uuid", "status": "active|completed|paused|dropped" }
  ]
}
"actions" may be empty ([]) for purely conversational turns. Never invent UUIDs — only use ids from the context above.`;

  let rawResponse = "";

  for (const modelStr of DEFAULT_MODEL_CHAIN) {
    try {
      const [provider, modelName] = modelStr.split(":");
      if (provider === "google") {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) continue;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I will act as the Vela Guide, execute actions when asked, enforce the 3-priority cap, and output only JSON matching the schema." }] },
            ...messages.slice(0, -1).map((m) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.content }],
            })),
          ],
        });

        const lastMsg = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMsg);
        rawResponse = result.response.text().trim();
        break;
      } else if (provider === "groq") {
        if (!process.env.GROQ_API_KEY) continue;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        rawResponse = completion.choices[0]?.message?.content?.trim() ?? "";
        break;
      }
    } catch (err) {
      console.warn(`[journal/assistant] model ${modelStr} failed:`, err);
    }
  }

  if (!rawResponse) {
    return NextResponse.json({
      reply: "I'm having trouble connecting right now — please try again in a moment.",
      executed: [],
    });
  }

  try {
    const clean = rawResponse.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean) as { reply?: string; actions?: unknown[] };

    const reply = typeof parsed.reply === "string" && parsed.reply.trim()
      ? parsed.reply
      : "Done.";

    // Validate each action independently — one malformed action shouldn't
    // discard the rest of an otherwise good turn.
    const validActions: AssistantAction[] = [];
    for (const raw of Array.isArray(parsed.actions) ? parsed.actions : []) {
      const result = ActionSchema.safeParse(raw);
      if (result.success) validActions.push(result.data);
      else console.warn("[journal/assistant] dropped invalid action:", raw);
    }

    const executed: ExecutedAction[] = [];
    for (const action of validActions.slice(0, 8)) {
      executed.push(await executeAction(supabase, user, action, objectives, today));
    }

    // Persist this turn server-side — the client only ever sends the running
    // conversation for prompting context, never writes to jo_chats directly,
    // so history stays consistent even if the client is offline right after
    // this response lands (the reply itself still made it to the DB).
    const lastUserMsg = messages[messages.length - 1];
    const { error: chatError } = await supabase.from("jo_chats").insert([
      { user_id: user.id, role: "user", content: lastUserMsg.content, executed: null },
      { user_id: user.id, role: "assistant", content: reply, executed: executed.length > 0 ? executed : null },
    ]);
    if (chatError) console.error("[journal/assistant] chat persistence error:", chatError);

    return NextResponse.json({ reply, executed });
  } catch (err) {
    console.error("[journal/assistant] parse error:", err, "rawResponse:", rawResponse);
    return NextResponse.json({
      reply: "Sorry, I had trouble formatting that. Could you rephrase?",
      executed: [],
    });
  }
}
