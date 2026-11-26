import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  SPEAKING_GATE_COOKIE,
  signSpeakingGateToken,
  verifySpeakingPassword,
} from "@/lib/speaking/gate-token";

export const dynamic = "force-dynamic";

const UnlockSchema = z.object({
  password: z.string().min(1, "Password is required").max(200),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const rl = await checkRateLimit(`speaking-unlock:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many unlock attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UnlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Password gate is not configured. Use Admin login instead." },
      { status: 503 }
    );
  }

  if (!verifySpeakingPassword(parsed.data.password)) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const token = await signSpeakingGateToken();
  if (!token) {
    return NextResponse.json(
      { error: "Gate signing secret is not configured." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SPEAKING_GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SPEAKING_GATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
