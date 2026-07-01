import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/tools/bookbreaks";
  // Prevent open redirect: only allow relative paths on this origin
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/tools/bookbreaks";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/tools/bookbreaks/login?error=Could+not+complete+sign+in`
  );
}
