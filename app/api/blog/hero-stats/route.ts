import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    
    // 1. Fetch categories for trending tags
    const { data: publishedPosts } = await supabase
      .from("blog_posts")
      .select("category")
      .eq("published", true);
      
    let trendingTags: { name: string; count: number }[] = [];
    if (publishedPosts) {
      const counts: Record<string, number> = {};
      publishedPosts.forEach(post => {
        if (post.category) {
          counts[post.category] = (counts[post.category] || 0) + 1;
        }
      });
      
      trendingTags = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    }
    
    // 2. Fetch the next draft pipeline
    const { data: pipelinePost } = await supabase
      .from("blog_posts")
      .select("title, excerpt")
      .eq("published", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      trendingTags,
      pipelineTitle: pipelinePost?.title || "Drafting in progress...",
      pipelineExcerpt: pipelinePost?.excerpt || "Currently putting together thoughts and structure for the next piece.",
    });
  } catch (error) {
    console.error("[BlogHeroStats] Error fetching stats:", error);
    return NextResponse.json({ trendingTags: [], pipelineTitle: "", pipelineExcerpt: "" }, { status: 500 });
  }
}
