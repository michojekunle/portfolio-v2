import { createClient } from "@/lib/supabase/server";
import type {
  BBBook,
  BBContent,
  BBSettings,
  BBBookWithContent,
} from "./types";
import { DEFAULT_WEBSITE_URL, DEFAULT_WORD_COUNT, DEFAULT_TONE } from "./constants";

export async function getBBBooks(): Promise<BBBookWithContent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("bb_books")
    .select("*, bb_generated_content(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getBBBooks]", error.message);
    return [];
  }

  return (data ?? []).map((b) => ({
    ...(b as unknown as BBBook),
    content_count:
      (b.bb_generated_content as unknown as { count: number }[])?.[0]?.count ??
      0,
  }));
}

export async function getBBBook(id: string): Promise<BBBook | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("bb_books")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("[getBBBook]", error.message);
    return null;
  }

  return data as unknown as BBBook;
}

export async function getBBContent(filters?: {
  book_id?: string;
  content_type?: string;
  status?: string;
}): Promise<(BBContent & { book_title: string; book_author: string })[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("bb_generated_content")
    .select("*, bb_books(title, author)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.book_id) query = query.eq("book_id", filters.book_id);
  if (filters?.content_type) query = query.eq("content_type", filters.content_type);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;

  if (error) {
    console.error("[getBBContent]", error.message);
    return [];
  }

  return (data ?? []).map((c) => ({
    ...(c as unknown as BBContent),
    book_title: (c.bb_books as unknown as { title: string })?.title ?? "",
    book_author: (c.bb_books as unknown as { author: string })?.author ?? "",
  }));
}

export async function getBBSettings(): Promise<BBSettings | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("bb_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[getBBSettings]", error.message);
    return null;
  }

  if (!data) {
    // Return defaults if no settings row yet
    return {
      id: "",
      user_id: user.id,
      website_url: DEFAULT_WEBSITE_URL,
      default_theme: "custom",
      default_platforms: ["blog", "x", "instagram"],
      ai_provider: "auto",
      default_tone: DEFAULT_TONE,
      default_word_count: DEFAULT_WORD_COUNT,
      seo_keywords: [],
      newsletter_cta: "",
      created_at: "",
      updated_at: "",
    };
  }

  return data as unknown as BBSettings;
}

export async function getDashboardStats(): Promise<{
  book_count: number;
  content_count: number;
  this_month_count: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { book_count: 0, content_count: 0, this_month_count: 0 };

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ count: book_count }, { count: content_count }, { count: this_month_count }] =
    await Promise.all([
      supabase
        .from("bb_books")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("bb_generated_content")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("bb_generated_content")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString()),
    ]);

  return {
    book_count: book_count ?? 0,
    content_count: content_count ?? 0,
    this_month_count: this_month_count ?? 0,
  };
}
