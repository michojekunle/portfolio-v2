import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_BOOKS, SEED_CONTENT } from "@/lib/bookbreaks/seed-data";

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already has books — avoid double-seeding
  const { count } = await supabase
    .from("bb_books")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ message: "Already seeded" });
  }

  // Insert books
  const { data: insertedBooks, error: booksError } = await supabase
    .from("bb_books")
    .insert(
      SEED_BOOKS.map((b) => ({
        user_id: user.id,
        title: b.title,
        author: b.author,
        cover_url: b.cover_url,
        theme: b.theme,
        genres: b.genres,
        rating: b.rating,
        read_date: b.read_date,
        notes: b.notes,
        insights: b.insights,
      }))
    )
    .select("id, title");

  if (booksError) {
    console.error("[seed] books error:", booksError.message);
    return NextResponse.json({ error: booksError.message }, { status: 500 });
  }

  if (!insertedBooks || insertedBooks.length === 0) {
    return NextResponse.json({ error: "No books inserted" }, { status: 500 });
  }

  // Insert content linked to the correct books by index
  const contentRows = SEED_CONTENT.map((c) => {
    const book = insertedBooks[c.book_index];
    if (!book) return null;
    return {
      user_id: user.id,
      book_id: book.id as string,
      content_type: c.content_type,
      platform: c.platform,
      title: c.title,
      content: c.content,
      metadata: c.metadata,
      status: "draft",
    };
  }).filter((c): c is NonNullable<typeof c> => c !== null);

  const { error: contentError } = await supabase
    .from("bb_generated_content")
    .insert(contentRows);

  if (contentError) {
    console.error("[seed] content error:", contentError.message);
    return NextResponse.json({ error: contentError.message }, { status: 500 });
  }

  // Create default settings
  await supabase.from("bb_settings").upsert({
    user_id: user.id,
    website_url: "www.michaelojekunle.dev",
    default_theme: "custom",
    default_platforms: ["blog", "x", "instagram"],
    ai_provider: "auto",
    default_tone: "educational",
    default_word_count: 1500,
    seo_keywords: [],
    newsletter_cta: "",
  });

  return NextResponse.json({
    message: "Seeded successfully",
    books: insertedBooks.length,
    content: contentRows.length,
  });
}
