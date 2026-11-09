import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { CURATED_BOOKS } from "@/lib/chapterly/curated";
import type { RecommendedBookPlanItem } from "@/lib/chapterly/types";
import { toolOnboardingNotificationEmail } from "@/lib/email/templates";

const OnboardingSchema = z.object({
  daily_minutes: z.number().int().min(5).max(120),
  annual_books: z.number().int().min(1).max(100),
  interests: z.array(z.string()),
  goals: z.array(z.string()),
  reading_level: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { daily_minutes, annual_books, interests } = parsed.data;

  // Filter recommendations based on interests. If user has no specific interests, recommend everything.
  const recommended: RecommendedBookPlanItem[] = CURATED_BOOKS.filter((b) =>
    interests.length === 0 || interests.some((interest) =>
      b.category.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(b.category.toLowerCase())
    )
  ).map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    description: b.description,
    cover_url: b.cover_url,
    category: b.category,
    read_time_minutes: b.read_time_minutes,
    is_added: false,
  }));

  // Fallback to recommending atomic habits if nothing matches
  if (recommended.length === 0 && CURATED_BOOKS.length > 0) {
    const defaultBook = CURATED_BOOKS[0];
    recommended.push({
      id: defaultBook.id,
      title: defaultBook.title,
      author: defaultBook.author,
      description: defaultBook.description,
      cover_url: defaultBook.cover_url,
      category: defaultBook.category,
      read_time_minutes: defaultBook.read_time_minutes,
      is_added: false,
    });
  }

  // Update goals table
  const { error } = await supabase
    .from("ch_goals")
    .upsert({
      user_id: user.id,
      daily_minutes,
      annual_books,
      onboarded: true,
      learning_plan: recommended,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("[onboarding] database error:", error);
    return NextResponse.json({ error: "Failed to save goals" }, { status: 500 });
  }

  // Best-effort notification to Michael
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "Michael Ojekunle <no-reply@michaelojekunle.dev>";

  if (resendKey && toEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `[Chapterly] New reader onboarded: ${daily_minutes}m/day`,
        html: toolOnboardingNotificationEmail({
          tool: "Chapterly",
          userIdentifier: user.email ?? user.id,
          details: {
            daily_minutes: `${daily_minutes} mins`,
            annual_books: `${annual_books} books`,
            reading_level: parsed.data.reading_level,
            interests: interests.join(", ") || "General",
          },
        }),
      });
    } catch (emailErr) {
      console.error("[chapterly/onboarding] Notification email failed:", emailErr);
    }
  }

  return NextResponse.json({ success: true });
}
