/**
 * POST /api/learn/reminders — the hourly reminder job for French and Spanish Daily.
 * Called by .github/workflows/learn-reminders.yml with a shared secret.
 * Sends push and/or email at each learner's own local time when today's page
 * isn't done. Logic and tests: features/learn/server/reminders.ts.
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminClient } from "@/features/learn/server/admin";
import { createReminderSenders } from "@/features/learn/server/reminder-senders";
import { runDigestJob, supabaseDigestDeps } from "@/features/learn/server/digests";
import { recordEvent } from "@/features/learn/server/events";
import { learnerEmail, runReminderJob, supabaseReminderDeps } from "@/features/learn/server/reminders";

export const dynamic = "force-dynamic";
/** Sequential sends: give a big Sunday hour room to finish. */
export const maxDuration = 300;

async function logRun(admin: NonNullable<ReturnType<typeof adminClient>>, reminders: Awaited<ReturnType<typeof runReminderJob>>, digests: Awaited<ReturnType<typeof runDigestJob>> | null): Promise<void> {
  try {
    await recordEvent(admin, { name: "reminder_run", props: { checked: reminders.checked, sent: reminders.sent, failed: reminders.failed } }, null);
    if (digests && (digests.weekly.due > 0 || digests.weekly.failed > 0)) await recordEvent(admin, { name: "weekly_summary_run", props: { ...digests.weekly } }, null);
    if (digests && (digests.nudges.due > 0 || digests.nudges.failed > 0)) await recordEvent(admin, { name: "group_nudge_run", props: { ...digests.nudges } }, null);
  } catch (error) {
    console.error("[learn/reminders] could not log the run", error instanceof Error ? error.message : error);
  }
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.LEARN_CRON_SECRET ?? process.env.FRENCH_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = adminClient();
  if (!admin) {
    console.error("[learn/reminders] SUPABASE_URL and a service-role key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY) are required");
    return NextResponse.json({ error: "Reminders are not configured." }, { status: 500 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const senders = createReminderSenders({
    vapid: vapidPublic && vapidPrivate ? { publicKey: vapidPublic, privateKey: vapidPrivate, contact: process.env.REMINDER_CONTACT_EMAIL ?? "noreply@michaelojekunle.dev" } : null,
    resend: process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null,
    // Reuse the site's verified sender when no reminder-specific one is set.
    from: process.env.REMINDER_FROM_EMAIL ?? process.env.CONTACT_FROM_EMAIL ?? "Daily pages <onboarding@resend.dev>",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin,
    emailFor: (userId) => learnerEmail(admin, userId),
  });

  try {
    const base = supabaseReminderDeps(admin, senders);
    // Read the learners once and share it: the reminder and digest jobs look at the same rows.
    const rows = await base.listActive();
    const reminderDeps = {
      ...base,
      listActive: async () => rows,
      // Keep the shared snapshot current, so the digest job sees a reminder sent moments ago and doesn't double up.
      markSent: async (userId: string, language: (typeof rows)[number]["language"], localDate: string): Promise<void> => {
        await base.markSent(userId, language, localDate);
        const row = rows.find((r) => r.user_id === userId && r.language === language);
        if (row) row.last_sent_on = localDate;
      },
    };
    const reminders = await runReminderJob(reminderDeps);
    let digests: Awaited<ReturnType<typeof runDigestJob>> | null = null;
    let digestFailed = false;
    try {
      digests = await runDigestJob(supabaseDigestDeps(admin, reminderDeps));
    } catch (error) {
      digestFailed = true;
      console.error("[learn/reminders] digest job failed", error);
    }
    await logRun(admin, reminders, digests);
    // Reminders went out either way, but a failed digest job must be visible to the scheduler (the workflow fails and emails you).
    return NextResponse.json({ ...reminders, digests, digestFailed }, { status: digestFailed ? 500 : 200 });
  } catch (error) {
    console.error("[learn/reminders] job failed", error);
    return NextResponse.json({ error: "Reminder job failed." }, { status: 500 });
  }
}
