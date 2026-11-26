import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";

export const dynamic = "force-dynamic";

const ExportArticleSchema = z.object({
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().min(1).max(200),
  excerpt: z.string().max(600).default(""),
  content: z.string().min(1).max(40000),
  category: z.string().max(80).default("Speaking & Ideas"),
});

function computeReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 230));
  return `${minutes} min`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ExportArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { title, slug, excerpt, content, category } = parsed.data;
  const normalizedSlug = slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Save as an unpublished draft in blog_posts so the owner can review before publishing.
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  const finalSlug = existing
    ? `${normalizedSlug}-${Date.now().toString().slice(-4)}`
    : normalizedSlug;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug: finalSlug,
      excerpt: excerpt || title,
      content,
      category,
      read_time: computeReadTime(content),
      published: false,
      updated_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("[speaking/export-article] POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create draft" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    postId: data.id,
    slug: data.slug,
    editorUrl: `/admin/blog/${data.id}`,
  });
}
