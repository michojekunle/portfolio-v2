import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const guestbookSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name too long")
    .trim(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be under 500 characters")
    .trim(),
});

export async function GET(): Promise<Response> {
  const { data, error } = await getSupabase()
    .from("guestbook")
    .select("id, name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[guestbook] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load entries" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const result = guestbookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, message } = result.data;

    const { data, error } = await getSupabase()
      .from("guestbook")
      .insert({ name, message })
      .select("id, name, message, created_at")
      .single();

    if (error) {
      console.error("[guestbook] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to save entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error("[guestbook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
