import { NextResponse } from "next/server";
import { getPublicBooks } from "@/lib/supabase/reading";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const books = await getPublicBooks();
    
    // Count books that are completed
    const completed = books.filter(b => b.status === "completed").length;
    
    // Calculate simple streak (mocked for now, as true streak requires reading logs)
    // We can say if they are currently reading a book, streak is active
    const isReading = books.some(b => b.status === "reading");
    const currentStreak = isReading ? 18 : 0; // Using 18 as the default active streak
    
    // Goal is typically fixed per year, e.g., 12
    const goal = 12;

    return NextResponse.json({
      goal,
      completed,
      currentStreak,
      percentage: Math.round((completed / goal) * 100)
    });
  } catch (error) {
    console.error("[ReadingStats] Error fetching stats:", error);
    return NextResponse.json(
      { goal: 12, completed: 0, currentStreak: 0, percentage: 0 },
      { status: 500 }
    );
  }
}
