import { NextResponse } from "next/server";
import { getPublicBooks } from "@/lib/supabase/reading";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const books = await getPublicBooks();
    
    // Count books that are completed
    const completed = books.filter(b => b.status === "completed").length;
    
    // Goal is typically fixed per year, e.g., 12
    const goal = 12;

    return NextResponse.json({
      goal,
      completed,
      percentage: Math.round((completed / goal) * 100)
    });
  } catch (error) {
    console.error("[ReadingStats] Error fetching stats:", error);
    return NextResponse.json(
      { goal: 12, completed: 0, percentage: 0 },
      { status: 500 }
    );
  }
}
