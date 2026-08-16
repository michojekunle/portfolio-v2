/**
 * GET /api/french/vocab
 * Returns all vocabulary entries, newest first (Public).
 *
 * POST /api/french/vocab
 * Adds a new vocabulary entry (Authentication Required).
 * Body: { entry_type: "word"|"sentence", french_text, english_meaning, notes? }
 *
 * DELETE /api/french/vocab
 * Deletes a vocabulary entry (Authentication Required).
 * Body: { id }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("french_vocabulary")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[french/vocab] GET error:", error);
      return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
    }

    return NextResponse.json({ entries: data });
  } catch (err) {
    console.error("[french/vocab] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to add vocabulary entries." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      entry_type: "word" | "sentence";
      french_text: string;
      english_meaning: string;
      notes?: string;
    };

    const { entry_type, french_text, english_meaning, notes } = body;

    if (!entry_type || !french_text?.trim() || !english_meaning?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("french_vocabulary")
      .insert({
        entry_type,
        french_text: french_text.trim(),
        english_meaning: english_meaning.trim(),
        notes: notes?.trim() ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[french/vocab] POST error:", error);
      return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
    }

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (err) {
    console.error("[french/vocab] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to delete vocabulary entries." },
        { status: 401 }
      );
    }

    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("french_vocabulary")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[french/vocab] DELETE error:", error);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[french/vocab] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
