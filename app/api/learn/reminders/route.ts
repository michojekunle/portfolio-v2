/**
 * POST /api/learn/reminders — the hourly reminder job for French and Spanish Daily.
 * Called by .github/workflows/learn-reminders.yml with a shared secret.
 * Sends push and/or email at each learner's own local time when today's page
 * isn't done. Logic and tests: features/learn/server/reminders.ts.
 */
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import webpush from "web-push";
import { Resend } from "resend";
import { runReminderJob, supabaseReminderDeps, type ReminderMessage } from "@/features/learn/server/reminders";

export const dynamic = "force-dynamic";

function siteUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.LEARN_CRON_SECRET ?? process.env.FRENCH_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[learn/reminders] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    return NextResponse.json({ error: "Reminders are not configured." }, { status: 500 });
  }
  const admin = createSupabaseAdmin(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const pushReady = Boolean(vapidPublic && vapidPrivate);
  if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(`mailto:${process.env.REMINDER_CONTACT_EMAIL ?? "noreply@michaelojekunle.dev"}`, vapidPublic, vapidPrivate);
  }
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const from = process.env.REMINDER_FROM_EMAIL ?? "Daily pages <onboarding@resend.dev>";
  const base = siteUrl(request);

  try {
    const result = await runReminderJob(
      supabaseReminderDeps(admin, {
        sendPush: async (subscription, message: ReminderMessage) => {
          if (!pushReady) return "sent";
          try {
            await webpush.sendNotification(subscription, JSON.stringify({ title: message.title, body: message.body, url: message.url }));
            return "sent";
          } catch (error) {
            const status = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
            if (status === 404 || status === 410) return "gone";
            throw error;
          }
        },
        sendEmail: async (userId, message) => {
          if (!resend) return;
          const { data, error } = await admin.auth.admin.getUserById(userId);
          if (error || !data.user?.email) throw new Error(`No email for reminder: ${error?.message ?? "missing address"}`);
          const link = `${base}${message.url}`;
          const { error: sendError } = await resend.emails.send({
            from,
            to: data.user.email,
            subject: message.title,
            text: `${message.body}\n\n${link}`,
            html: `<p style="font-family:Georgia,serif;font-size:18px">${message.body}</p><p><a href="${link}">${message.language === "fr" ? "Commencer" : "Empezar"} →</a></p>`,
          });
          if (sendError) throw new Error(`Resend failed: ${sendError.message}`);
        },
      })
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[learn/reminders] job failed", error);
    return NextResponse.json({ error: "Reminder job failed." }, { status: 500 });
  }
}
