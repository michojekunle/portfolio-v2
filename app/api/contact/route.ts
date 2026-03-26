import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  contactNotificationEmail,
  contactConfirmationEmail,
} from "@/lib/email/templates";

class ContactError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = "ContactError";
  }
}

const contactSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .max(254, "Email is too long")
    .trim()
    .toLowerCase(),
  subject: z
    .string({ required_error: "Subject is required" })
    .min(2, "Subject must be at least 2 characters")
    .max(200, "Subject must be under 200 characters")
    .trim(),
  message: z
    .string({ required_error: "Message is required" })
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be under 1000 characters")
    .trim(),
});

type ContactInput = z.infer<typeof contactSchema>;

const injectionPattern =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\s+\w+\b)|(--)|(\b(ALTER|CREATE|DROP)\s+TABLE\b)/i;

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ContactError(
      `Missing environment variable: ${key}`,
      500,
      "Server configuration error. Please try again later."
    );
  }
  return value;
}

function hasInjectionPattern(input: ContactInput): boolean {
  return (
    injectionPattern.test(input.name) ||
    injectionPattern.test(input.subject) ||
    injectionPattern.test(input.message)
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input = result.data;

    if (hasInjectionPattern(input)) {
      console.warn("[contact] Suspicious input pattern detected");
      return NextResponse.json(
        { success: false, message: "Invalid input detected" },
        { status: 400 }
      );
    }

    const supabaseUrl = getEnvVar("SUPABASE_URL");
    const supabaseKey = getEnvVar("SUPABASE_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to DB first — this is the source of truth.
    const { error: dbError } = await supabase.from("messages").insert([
      {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
    ]);

    if (dbError) {
      console.error("[contact] Supabase insert error:", dbError);
      throw new ContactError(
        `Supabase error: ${dbError.message}`,
        500,
        "Failed to save your message. Please try again."
      );
    }

    // Email notifications are best-effort — a missing/invalid key must not
    // surface as a 500 to the user after the message is already saved to DB.
    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (resendKey && toEmail) {
      try {
        const resend = new Resend(resendKey);
        const notifyFrom =
          process.env.CONTACT_FROM_EMAIL ??
          "Michael Ojekunle <no-reply@michaelojekunle.dev>";
        const infoFrom =
          process.env.CONTACT_INFO_EMAIL ??
          "Michael Ojekunle <info@michaelojekunle.dev>";

        await resend.batch.send([
          // Notification to Michael — full design template
          {
            from: infoFrom,
            to: toEmail,
            subject: `New message: ${input.subject}`,
            html: contactNotificationEmail({
              name: input.name,
              email: input.email,
              subject: input.subject,
              message: input.message,
            }),
          },
          // Confirmation to the sender — branded template
          {
            from: notifyFrom,
            to: input.email,
            subject: "Got your message — I'll be in touch",
            html: contactConfirmationEmail(input.name),
          },
        ]);
      } catch (emailError: unknown) {
        // Log but do not rethrow — message is already in the DB and visible in /admin/messages.
        console.error("[contact] Email delivery failed (message saved to DB):", emailError);
      }
    } else {
      console.warn("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL not set — skipping email notifications.");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof ContactError) {
      console.error(`[contact] ${error.message}`);
      return NextResponse.json(
        { success: false, message: error.userMessage },
        { status: error.statusCode }
      );
    }
    console.error("[contact] Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
