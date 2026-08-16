/**
 * POST /api/french/trigger
 * Called by the GitHub Action every day at 10 PM.
 * 1. Generates today's challenge via Groq (falls back to static rotation if API fails)
 * 2. Saves it to the database
 * 3. Sends a Web Push notification to all subscribed devices
 *
 * Protected by FRENCH_CRON_SECRET in Authorization header.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// ── Groq LLM prompt ──────────────────────────────────────────────────────────
const CHALLENGE_TYPES = ["speaking", "writing", "reading"] as const;
type ChallengeType = (typeof CHALLENGE_TYPES)[number];

function getTodayType(): ChallengeType {
  // Rotate day of year mod 3: speaking → writing → reading
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return CHALLENGE_TYPES[dayOfYear % 3];
}

const SPEAKING_PROMPTS = [
  "Record yourself introducing yourself in French. Include your name, where you're from, and one thing you love.",
  "Record yourself describing what you did today — in French. Use at least 5 sentences.",
  "Read this sentence out loud 3 times until it flows naturally: 'Je fais des efforts chaque jour pour m'améliorer.'",
  "Record a 60-second French rant or opinion about any topic — sports, food, tech, anything.",
  "Describe your room or workspace in French. Record yourself for at least 45 seconds.",
];

const WRITING_PROMPTS = [
  "Write 3 sentences about your day in French and post it as your Twitter/X status.",
  "Write a short journal entry in French: What was the best part of today?",
  "Translate your thoughts from the last 10 minutes into French sentences. Write at least 4.",
  "Write a mini review of the last thing you watched, read, or listened to — in French.",
  "Write 5 French sentences using the passé composé (past tense). Describe something that happened this week.",
];

const READING_PROMPTS = [
  "Read this paragraph out loud until you can say it without hesitation: 'Apprendre une nouvelle langue, c'est comme ouvrir une nouvelle fenêtre sur le monde. Chaque mot appris est un pas de plus vers la maîtrise.'",
  "Go to r/france or a French news site. Pick any article and read the first 3 paragraphs out loud.",
  "Read the lyrics of any French song out loud while it plays. Focus on matching the rhythm.",
  "Read these 5 common French expressions out loud and say their English meaning after each: 'C'est la vie', 'Savoir-faire', 'Joie de vivre', 'Comme ci comme ça', 'Coup de grâce'.",
  "Open a French Wikipedia article on any topic you find interesting and read the intro section out loud.",
];

async function generateChallengeWithGroq(type: ChallengeType): Promise<{ prompt_text: string; example_text: string }> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("No GROQ_API_KEY");

  const systemPrompt = `You are a French language learning coach. Generate a single, clear daily micro-challenge for a French learner. 
The challenge type is: ${type}.
Return a JSON object with:
- "prompt_text": a 1-sentence instruction telling the user exactly what to do (max 20 words)
- "example_text": the specific French sentence/passage/material to use (1-2 sentences for speaking/reading, 1 topic prompt for writing)
Keep it achievable in under 5 minutes. Be specific and actionable. No fluff.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: systemPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.9,
    }),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return JSON.parse(data.choices[0].message.content) as { prompt_text: string; example_text: string };
}

function getStaticChallenge(type: ChallengeType): { prompt_text: string; example_text: string } {
  const day = new Date().getDay();
  const map: Record<ChallengeType, string[]> = {
    speaking: SPEAKING_PROMPTS,
    writing: WRITING_PROMPTS,
    reading: READING_PROMPTS,
  };
  const prompts = map[type];
  return {
    prompt_text: prompts[day % prompts.length],
    example_text: "",
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request): Promise<Response> {
  // Verify secret
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.FRENCH_CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  const today = new Date().toISOString().split("T")[0];

  // 1. Check if challenge already exists for today
  const { data: existing } = await supabase
    .from("french_challenges")
    .select("id, type, prompt_text")
    .eq("challenge_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let challenge: { id: string; type: string; prompt_text: string } | null = existing;

  if (!challenge) {
    // 2. Generate challenge
    const type = getTodayType();
    let content: { prompt_text: string; example_text: string };

    try {
      content = await generateChallengeWithGroq(type);
    } catch (err) {
      console.warn("[french/trigger] Groq failed, using static fallback:", err);
      content = getStaticChallenge(type);
    }

    // 3. Save to DB
    const { data: inserted, error: insertError } = await supabase
      .from("french_challenges")
      .insert({
        challenge_date: today,
        type,
        prompt_text: content.prompt_text,
        example_text: content.example_text || null,
      })
      .select("id, type, prompt_text")
      .single();

    if (insertError || !inserted) {
      console.error("[french/trigger] Insert error:", insertError);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    challenge = inserted;
  }

  // TypeScript narrowing: after the if-block above, challenge is guaranteed non-null
  const safeChallenge = challenge!;

  // 4. Load push subscriptions (match current WAT hour or all if manual)
  // Calculate current West Africa Time (UTC+1) hour in "HH:00" format
  const nowWAT = new Date(Date.now() + 3600000);
  const currentWatHour = `${String(nowWAT.getUTCHours()).padStart(2, "0")}:00`;

  const { data: subs } = await supabase.from("french_subscriptions").select("*");
  if (!subs || subs.length === 0) {
    console.log("[french/trigger] No push subscriptions found.");
    return NextResponse.json({ ok: true, pushed: 0, challenge });
  }

  // Target subscriptions matching the current hour or default 22:00
  const targetSubs = subs.filter((s) => {
    if (!s.reminder_time) return currentWatHour === "22:00";
    return s.reminder_time === currentWatHour || currentWatHour === "22:00";
  });

  // 5. Configure web-push VAPID
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY!;
  if (!vapidPublic || !vapidPrivate) {
    console.error("[french/trigger] VAPID keys missing");
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  webpush.setVapidDetails(
    `mailto:${process.env.CONTACT_TO_EMAIL ?? "michojekunle1@gmail.com"}`,
    vapidPublic,
    vapidPrivate
  );

  const typeEmoji: Record<string, string> = {
    speaking: "🗣️",
    writing: "✍️",
    reading: "📖",
  };

  const payload = JSON.stringify({
    title: `${typeEmoji[safeChallenge.type] ?? "🇫🇷"} French Challenge — ${safeChallenge.type}`,
    body: safeChallenge.prompt_text,
    url: "/french",
  });

  // 6. Send push to all subscriptions (remove expired ones)
  let pushed = 0;
  const expiredEndpoints: string[] = [];

  await Promise.allSettled(
    targetSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        pushed++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.error("[french/trigger] Push error:", err);
        }
      }
    })
  );

  // Clean up expired endpoints
  if (expiredEndpoints.length > 0) {
    await supabase
      .from("french_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return NextResponse.json({ ok: true, pushed, challenge });
}
