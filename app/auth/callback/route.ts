import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/tools/bookbreaks";
  // Only allow relative paths to prevent open redirect
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/tools/bookbreaks";

  // Derive the login page for the tool that initiated this auth flow.
  // next is typically "/tools/<toolname>" so we can reconstruct the login URL.
  const pathParts = next.split("/").filter(Boolean); // ["tools", "flowise"]
  const loginPath =
    pathParts.length >= 2 && pathParts[0] === "tools"
      ? `/${pathParts[0]}/${pathParts[1]}/login`
      : "/tools/bookbreaks/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  return NextResponse.redirect(
    `${origin}${loginPath}?error=Could+not+complete+sign+in`,
  );
}
