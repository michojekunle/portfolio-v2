import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SPEAKING_GATE_COOKIE,
  verifySpeakingGateToken,
} from "@/lib/speaking/gate-token";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must not run any other logic between createServerClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow login / unlock pages through always
  if (pathname === "/admin/login" || pathname === "/speaking/unlock") {
    return supabaseResponse;
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Protect all /speaking routes — require either owner Supabase session or valid password-gate cookie
  if (pathname.startsWith("/speaking")) {
    const adminEmail = process.env.CONTACT_TO_EMAIL || "info@michaelojekunle.dev";
    const isAdminUser = Boolean(user && user.email === adminEmail);
    const gateToken = request.cookies.get(SPEAKING_GATE_COOKIE)?.value;
    const hasGateCookie = await verifySpeakingGateToken(gateToken);

    if (!isAdminUser && !hasGateCookie) {
      const unlockUrl = request.nextUrl.clone();
      unlockUrl.pathname = "/speaking/unlock";
      unlockUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(unlockUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/speaking/:path*"],
};
