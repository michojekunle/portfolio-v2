import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLACEHOLDERS = [
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Welcome to My Creative Studio — Michael Ojekunle",
    description: "An introductory walkthrough of who I am, the projects I build, and what to expect on this channel.",
    section: "intro",
    display_order: 0,
    is_published: true,
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Building Chapterly: A complete Headway Clone in 24 Hours",
    description: "Watch me build a full Headway Clone with AI book summaries, flashcards, streaks, and an interactive quiz.",
    section: "featured",
    display_order: 0,
    is_published: true,
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "How I Designed and Coded BookBreaks Creative Suite",
    description: "A deep dive into BookBreaks, connecting the reading habits to content creation tools like thread builders and carousel designers.",
    section: "featured",
    display_order: 1,
    is_published: true,
  },
  {
    platform: "instagram",
    url: "https://www.instagram.com/reel/C8mK15yvK8a/",
    title: "Quick Showcase: Glassmorphism Design System",
    description: "Building responsive, modern, translucent user interfaces with CSS backdrop-filter.",
    section: "highlight",
    display_order: 0,
    is_published: true,
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/shorts/3d6H2o0fRsw",
    title: "Spaced Repetition SM-2 Algorithmic Implementation",
    description: "Explaining the mathematics and logic behind card schedules and intervals.",
    section: "highlight",
    display_order: 1,
    is_published: true,
  },
  {
    platform: "tiktok",
    url: "https://www.tiktok.com/@devvvmichaell/video/7378901234567890123",
    title: "Inside my multi-agent AI coding workflow",
    description: "How I orchestrate multiple LLM subagents to audit, edit, and verify code.",
    section: "highlight",
    display_order: 2,
    is_published: true,
  },
];

export async function POST(): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.CONTACT_TO_EMAIL || "info@michaelojekunle.dev";

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Delete existing
    await supabase.from("site_videos").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert new placeholders
    const { data, error } = await supabase.from("site_videos").insert(PLACEHOLDERS).select();
    
    if (error) {
      throw new Error(`Seeding database failed: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      seededCount: data.length,
    });
  } catch (error: unknown) {
    console.error("[seed-videos] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seeding failed" },
      { status: 500 }
    );
  }
}
