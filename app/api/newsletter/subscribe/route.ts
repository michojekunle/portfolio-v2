import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  newsletterNotificationEmail,
  newsletterWelcomeEmail,
} from "@/lib/email/templates";

const subscribeSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(254, "Email is too long")
    .trim()
    .toLowerCase(),
});

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(url, key);
}

export async function POST(request: NextRequest): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const supabase = getSupabase();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("email_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: true, message: "You're already subscribed!" },
        { status: 200 }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from("email_subscribers")
      .insert([{ email }]);

    if (insertError) {
      // 23505 is PostgreSQL unique constraint violation
      if (insertError.code === "23505" || insertError.message.includes("duplicate")) {
        return NextResponse.json(
          { success: true, message: "You're already subscribed!" },
          { status: 200 }
        );
      }
      console.error("[newsletter/subscribe] Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Could not save your subscription. Please try again." },
        { status: 500 }
      );
    }

    // Dispatch background email notifications via Resend
    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail =
      process.env.NEWSLETTER_FROM_EMAIL ??
      process.env.CONTACT_FROM_EMAIL ??
      "Michael Ojekunle <no-reply@michaelojekunle.dev>";

    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const batchEmails = [];

        // 1. Alert to Michael
        if (toEmail) {
          batchEmails.push({
            from: fromEmail,
            to: toEmail,
            subject: `New newsletter subscriber: ${email}`,
            html: newsletterNotificationEmail(email),
          });
        }

        // 2. Welcome email to subscriber
        batchEmails.push({
          from: fromEmail,
          to: email,
          subject: "Welcome to Field Notes — Michael Ojekunle",
          html: newsletterWelcomeEmail(email),
        });

        await resend.batch.send(batchEmails);
      } catch (emailErr) {
        // Log but don't fail subscription since DB insert succeeded
        console.error("[newsletter/subscribe] Resend notification failed:", emailErr);
      }
    } else {
      console.warn("[newsletter/subscribe] RESEND_API_KEY missing — skipping email notifications.");
    }

    return NextResponse.json(
      { success: true, message: "You're subscribed! Welcome email sent." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[newsletter/subscribe] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
