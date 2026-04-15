import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
}

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = getSupabase();
  try {
    const body = (await request.json()) as { id: string };
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Increment click count using direct update
    // We select clicks first to ensure we have the current value
    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, clicks")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newClicks = ((post.clicks as number) ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ clicks: newClicks })
      .eq("id", post.id);

    if (updateError) {
      console.error("[clicks] Update failed:", updateError);
      return NextResponse.json(
        { error: "Failed to update clicks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clicks: newClicks });
  } catch (error: unknown) {
    console.error("[clicks] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
