import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setProfileStatus } from "@/lib/profile-status";

export async function POST(req: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    await setProfileStatus(data);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to update profile status" },
      { status: 500 }
    );
  }
}
