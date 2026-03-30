import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = getSupabase();
  try {
    const body = (await request.json()) as { slug: string };
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    // Increment view count using RPC or direct update
    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, views")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newViews = ((post.views as number) ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ views: newViews })
      .eq("id", post.id);

    if (updateError) {
      console.error("[views] Update failed:", updateError);
      return NextResponse.json(
        { error: "Failed to update views" },
        { status: 500 }
      );
    }

    return NextResponse.json({ views: newViews });
  } catch (error: unknown) {
    console.error("[views] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  const supabase = getSupabase();
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("views")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return NextResponse.json({ views: (post?.views as number) ?? 0 });
}
