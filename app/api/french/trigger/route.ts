/**
 * POST /api/french/trigger
 * Called by the GitHub Action/cron job every hour.
 * 
 * 1. Generates today's challenge via Groq (seeds automatically if not exists)
 * 2. Fetches all users and filters those who HAVE NOT completed their challenge today.
 * 3. Sends custom Push notifications and Emails using Resend at:
 *    - Custom user-selected reminder times
 *    - Noon (12:00) check-in
 *    - Evening (18:00) check-in
 *    - 4 hours before day end (20:00)
 *    - 2 hours before day end (22:00)
 *    - 1 hour final countdown (23:00)
 * 
 * Protected by FRENCH_CRON_SECRET in Authorization header.
 */
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import webpush from "web-push";
import { Resend } from "resend";

const CHALLENGE_TYPES = ["speaking", "writing", "reading"] as const;
type ChallengeType = (typeof CHALLENGE_TYPES)[number];

function getTodayType(): ChallengeType {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return CHALLENGE_TYPES[dayOfYear % 3];
}

const STARTER_PROMPTS = [
  {
    type: "reading",
    prompt_text: "Lisez ce dialogue complet dans un café parisien à voix haute. Prêtez une attention particulière aux liaisons et à l'intonation naturelle.",
    example_text: `— Bonjour Antoine ! Ça fait plaisir de te voir ici. Tu m'attends depuis longtemps ?
— Pas du tout. Je viens tout juste d'arriver.`,
  },
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

export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.FRENCH_CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const today = new Date().toISOString().split("T")[0];

  // 1. Ensure daily challenge is loaded
  const { data: existing } = await supabase
    .from("french_challenges")
    .select("id, type, prompt_text")
    .eq("challenge_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let challenge = existing;

  if (!challenge) {
    const type = getTodayType();
    let content;
    try {
      content = await generateChallengeWithGroq(type);
    } catch {
      content = { prompt_text: STARTER_PROMPTS[0].prompt_text, example_text: STARTER_PROMPTS[0].example_text };
    }
    const { data: inserted } = await supabase
      .from("french_challenges")
      .insert({
        challenge_date: today,
        type,
        prompt_text: content.prompt_text,
        example_text: content.example_text || null,
      })
      .select("id, type, prompt_text")
      .single();
    challenge = inserted;
  }

  const safeChallenge = challenge!;

  // 2. Fetch all user subscriptions, streaks, and completion logs for today
  const { data: subs } = await supabase.from("french_subscriptions").select("*");
  const { data: streaks } = await supabase.from("french_user_streaks").select("*");
  
  // Get logs of challenge completed today (matching challenge dates)
  const { data: logs } = await supabase
    .from("french_logs")
    .select("user_id, created_at");

  // Fetch all users using admin DB client
  const { data: authData } = await supabase.auth.admin.listUsers();
  const allUsers = authData?.users ?? [];

  // Calculate current West Africa Time (UTC+1) hour
  const nowWAT = new Date(Date.now() + 3600000);
  const currentHour = nowWAT.getUTCHours(); // 0 to 23
  const currentWatHourStr = `${String(currentHour).padStart(2, "0")}:00`;

  // Find users who HAVE NOT completed today's challenge
  const completedUserIds = new Set();
  if (logs) {
    for (const log of logs) {
      const logDate = new Date(log.created_at).toISOString().split("T")[0];
      if (logDate === today) {
        completedUserIds.add(log.user_id);
      }
    }
  }
  const pendingUsers = allUsers.filter((u) => !completedUserIds.has(u.id));

  // Initialize Web Push
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY!;
  if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(
      `mailto:${process.env.CONTACT_TO_EMAIL ?? "michojekunle1@gmail.com"}`,
      vapidPublic,
      vapidPrivate
    );
  }

  let pushesSent = 0;
  let emailsSent = 0;

  for (const user of pendingUsers) {
    const userSub = subs?.find((s) => s.user_id === user.id);
    const userStreak = streaks?.find((s) => s.user_id === user.id);
    const streakCount = userStreak?.current_streak ?? 0;

    let triggerPush = false;
    let triggerEmail = false;

    let pushTitle = "🇫🇷 French Daily";
    let pushBody = "Practice your French today to save your streak!";
    let emailSubject = "Save your French streak today!";
    let emailBody = "Bonjour! Don't forget to practice French today and keep your streak active.";

    // ── Evaluator logic for trigger intervals ───────────────────────────────
    
    // Trigger 1: User Scheduled Reminder time
    if (userSub?.reminder_time === currentWatHourStr) {
      triggerPush = true;
      triggerEmail = true;
      pushTitle = "🇫🇷 Challenge Ready!";
      pushBody = `It's time! Start today's French challenge and keep your ${streakCount}-day streak alive!`;
      emailSubject = `Your Daily French Challenge is Ready! 🇫🇷`;
      emailBody = `<p>Bonjour!</p><p>It's time for your scheduled daily French drill. Spend just 5 minutes today to save your <strong>${streakCount}-day streak</strong>!</p>`;
    }
    // Trigger 2: Noon Check-in
    else if (currentHour === 12) {
      triggerPush = true;
      triggerEmail = true;
      pushTitle = "🥖 Noon Check-in";
      pushBody = `Bonjour! Don't forget to do your 5-minute French drill.`;
      emailSubject = `Noon French Check-in 🥖`;
      emailBody = `<p>Bonjour!</p><p>This is your midday reminder to keep your learning going. Fit in today's French drill during your lunch break to keep your streak active!</p>`;
    }
    // Trigger 3: Evening Check-in
    else if (currentHour === 18) {
      triggerPush = true;
      triggerEmail = true;
      pushTitle = "🍷 Evening Practice";
      pushBody = `Complete your drill now to secure your streak before the day ends.`;
      emailSubject = `Evening French Practice 🍷`;
      emailBody = `<p>Bonsoir!</p><p>The day is winding down. Don't go to bed without securing your French streak. Practice now!</p>`;
    }
    // Trigger 4: 4 Hours Left (20:00)
    else if (currentHour === 20) {
      triggerPush = true;
      triggerEmail = true;
      pushTitle = "🔥 4 Hours Left!";
      pushBody = `Quick! Save your ${streakCount}-day French streak before midnight.`;
      emailSubject = `Only 4 hours left to save your French streak! 🔥`;
      emailBody = `<p>Urgent Reminder:</p><p>You have only 4 hours remaining to complete today's French challenge and protect your <strong>${streakCount}-day streak</strong> from breaking!</p>`;
    }
    // Trigger 5: 2 Hours Left (22:00)
    else if (currentHour === 22) {
      triggerPush = true;
      triggerEmail = true;
      pushTitle = "⏰ 2 Hours Left!";
      pushBody = `Hurry! Complete today's French drill to protect your streak.`;
      emailSubject = `Hurry! 2 hours remaining for your French challenge ⏰`;
      emailBody = `<p>Action Required:</p><p>Your <strong>${streakCount}-day streak</strong> will break in just 2 hours. Tap in to complete your speaking/writing drill now!</p>`;
    }
    // Trigger 6: 1 Hour Final Countdown (23:00)
    else if (currentHour === 23) {
      triggerPush = true;
      pushTitle = "🚨 FINAL COUNTDOWN: 1 Hour Left!";
      pushBody = `Your French streak is about to break in 60 minutes. Open the app now!`;
    }

    // ── Dispatch notifications ─────────────────────────────────────────────
    if (triggerPush && userSub && vapidPublic && vapidPrivate) {
      try {
        const payload = JSON.stringify({
          title: pushTitle,
          body: pushBody,
          url: "/french",
        });
        await webpush.sendNotification(
          { endpoint: userSub.endpoint, keys: { p256dh: userSub.p256dh, auth: userSub.auth } },
          payload
        );
        pushesSent++;
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Clean expired subscriptions
          await supabase.from("french_subscriptions").delete().eq("id", userSub.id);
        }
      }
    }

    if (triggerEmail && resend && user.email) {
      try {
        await resend.emails.send({
          from: "French Daily <onboarding@resend.dev>", // Or custom domain when configured
          to: user.email,
          subject: emailSubject,
          html: emailBody + `<p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://michojekunle.com'}/french" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Open French Daily Studio</a></p>`,
        });
        emailsSent++;
      } catch (err) {
        console.error(`[french/trigger] Email send error for ${user.email}:`, err);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    hour: currentWatHourStr,
    usersChecked: pendingUsers.length,
    pushesSent,
    emailsSent,
  });
}
