import { NextResponse } from "next/server";
import { z } from "zod";
import sgMail from "@sendgrid/mail";
import { createClient } from "@/lib/supabase/server";
import {
  blogPostEmail,
  digestEmail,
  customEmail,
  type DigestData,
} from "@/lib/email/templates";

const payloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("blog_post"),
    postId: z.string().uuid("Invalid post ID"),
  }),
  z.object({
    type: z.literal("digest"),
  }),
  z.object({
    type: z.literal("custom"),
    subject: z
      .string()
      .min(1, "Subject required")
      .max(200, "Subject too long"),
    body: z
      .string()
      .min(1, "Body required")
      .max(20000, "Body too long"),
  }),
]);

// Send to all subscribers in parallel chunks of 25 to stay within rate limits.
async function sendBatch(
  emails: Array<{ email: string; subject: string; html: string }>,
  fromEmail: string,
  fromName: string
): Promise<void> {
  const CHUNK = 25;
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK);
    await Promise.all(
      chunk.map(({ email, subject, html }) =>
        sgMail.send({
          to: email,
          from: { email: fromEmail, name: fromName },
          subject,
          html,
        })
      )
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sendgridKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const fromName = "Michael Ojekunle";

  if (!sendgridKey || !fromEmail) {
    return NextResponse.json(
      { error: "Email not configured — set SENDGRID_API_KEY and CONTACT_FROM_EMAIL" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Fetch all subscribers
  const { data: subscribers, error: subError } = await supabase
    .from("email_subscribers")
    .select("email");

  if (subError) {
    return NextResponse.json(
      { error: `Failed to fetch subscribers: ${subError.message}` },
      { status: 500 }
    );
  }

  if (!subscribers?.length) {
    return NextResponse.json({ error: "No subscribers to send to" }, { status: 400 });
  }

  sgMail.setApiKey(sendgridKey);

  const payload = parsed.data;

  try {
    let recipientEmails: Array<{ email: string; subject: string; html: string }>;

    if (payload.type === "blog_post") {
      const { data: post, error: postError } = await supabase
        .from("blog_posts")
        .select("title, slug, excerpt, category, read_time, published")
        .eq("id", payload.postId)
        .single();

      if (postError || !post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      if (!post.published) {
        return NextResponse.json(
          { error: "Cannot send a draft post — publish it first" },
          { status: 400 }
        );
      }

      recipientEmails = subscribers.map(({ email }) => {
        const { subject, html } = blogPostEmail(post, email);
        return { email, subject, html };
      });

    } else if (payload.type === "digest") {
      const [
        { data: posts },
        { data: books },
        { data: bookNotes },
        { data: learning },
        { data: building },
      ] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("title, slug, category, excerpt")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(3),
        supabase
          .from("books")
          .select("title, author, progress, status")
          .in("status", ["reading", "completed"])
          .order("sort_order"),
        supabase
          .from("book_notes")
          .select("book_id, type, content")
          .eq("type", "quote")
          .order("created_at", { ascending: false }),
        supabase
          .from("learning_items")
          .select("name, progress")
          .lt("progress", 100)
          .order("sort_order"),
        supabase
          .from("building_projects")
          .select("name, status, description")
          .in("status", ["In Progress", "Paused"])
          .order("sort_order"),
      ]);

      // Attach latest quote per book
      const latestQuoteByBook = new Map<string, string>();
      for (const note of bookNotes ?? []) {
        if (!latestQuoteByBook.has(note.book_id)) {
          latestQuoteByBook.set(note.book_id, note.content);
        }
      }

      const digestData: DigestData = {
        posts: posts ?? [],
        books: (books ?? []).map((b: { id?: string; title: string; author: string; progress: number; status: string }) => ({
          ...b,
          latestNote: latestQuoteByBook.get(b.id ?? "") ?? null,
        })),
        learning: learning ?? [],
        building: building ?? [],
      };

      recipientEmails = subscribers.map(({ email }) => {
        const { subject, html } = digestEmail(digestData, email);
        return { email, subject, html };
      });

    } else {
      // custom
      recipientEmails = subscribers.map(({ email }) => {
        const { subject, html } = customEmail(payload.subject, payload.body, email);
        return { email, subject, html };
      });
    }

    await sendBatch(recipientEmails, fromEmail, fromName);

    // Log the send
    await supabase.from("newsletter_sends").insert({
      subject: recipientEmails[0]?.subject ?? "Newsletter",
      type: payload.type,
      recipient_count: recipientEmails.length,
    });

    return NextResponse.json({
      success: true,
      sent: recipientEmails.length,
    });

  } catch (error: unknown) {
    console.error("[send-newsletter] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send newsletter",
      },
      { status: 500 }
    );
  }
}
