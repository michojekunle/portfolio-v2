import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getObjectivesWithMilestones, getRecentEntries } from "@/lib/journal/queries";

const DEFAULT_MODEL_CHAIN = [
  "google:gemini-2.5-flash",
  "google:gemini-2.5-flash-lite",
  "groq:llama-3.1-8b-instant",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DraftObjective {
  title: string;
  description?: string | null;
  target_date?: string | null;
  priority?: "high" | "medium" | "low";
}

interface DraftMilestone {
  objective_id: string;
  title: string;
  due_date?: string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = auth;

  const rl = checkRateLimit(`journal:assistant:${user.id}`, { limit: 60, windowMs: 60_000 });
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
  const hasLoggedToday = recentEntries.some((e) => e.date === today);

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
    ? objectives.map((o) => `- "${o.title}" (id: ${o.id}, status: ${o.status}, ${o.milestones.length} milestone(s), ${o.milestones.filter((m) => m.is_done).length} done)`).join("\n")
    : "The user has no objectives yet.";

  const systemPrompt = `You are the Vela Guide, a warm and concise onboarding assistant for Vela — a personal journal app for tracking objectives, milestones, and daily logs.

Your job:
1. Answer "how do I…" questions about Vela's features (objectives = long-running goals, milestones = checkpoints under an objective, daily log = a short reflection entry with priorities/accomplishments/energy level).
2. If the user seems unsure what to do (e.g. "I don't know where to start", "what should I do"), ask ONE short directed question to narrow down what they want (e.g. "What's one thing you'd like to make progress on this month?"). Do not ask more than one question per turn.
3. Once you have a clear idea (title, and optionally a target date/priority), propose a draft — you NEVER create anything yourself, you only draft it for the user to confirm with a button in the UI.

User context:
- Logged an entry today: ${hasLoggedToday ? "yes" : "no"}
- Current daily streak: ${streak} day(s)
- Existing objectives:
${objectivesCtx}

You must respond in valid JSON only, matching this schema:
{
  "reply": "conversational reply or follow-up question, 1-3 sentences",
  "draft": null | {
    "type": "objective",
    "title": "string",
    "description": "string or null",
    "target_date": "YYYY-MM-DD or null",
    "priority": "high" | "medium" | "low"
  } | {
    "type": "milestone",
    "objective_id": "uuid of an EXISTING objective from the list above",
    "title": "string",
    "due_date": "YYYY-MM-DD or null"
  }
}
Only set "draft" once you have enough information to propose something concrete. Otherwise set it to null.`;

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
            { role: "model", parts: [{ text: "Understood. I will act as the Vela Guide and output only JSON matching the schema." }] },
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
      draft: null,
    });
  }

  try {
    const clean = rawResponse.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
    const result = JSON.parse(clean) as {
      reply: string;
      draft: (DraftObjective & { type: "objective" }) | (DraftMilestone & { type: "milestone" }) | null;
    };

    // Guard against the model hallucinating a milestone under an objective the user doesn't own
    const draft = result.draft;
    const safeDraft = draft?.type === "milestone" && !objectives.some((o) => o.id === draft.objective_id)
      ? null
      : draft;

    return NextResponse.json({ reply: result.reply, draft: safeDraft ?? null });
  } catch (err) {
    console.error("[journal/assistant] parse error:", err, "rawResponse:", rawResponse);
    return NextResponse.json({
      reply: "Sorry, I had trouble formatting that. Could you rephrase?",
      draft: null,
    });
  }
}
