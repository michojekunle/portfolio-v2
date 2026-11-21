import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateLesson } from "./ai";
import { FrenchDomainError, PersistenceError, SessionNotEligibleError } from "./errors";
import type { LanguagePack } from "../domain/language";
import { createRepository } from "./repository";
import type { ServiceDeps } from "./service";

export interface LearnContext {
  readonly user: User | null;
  readonly deps: ServiceDeps;
}

/** User-scoped Supabase client: RLS evaluates as the signed-in learner. */
export async function getLearnContext(pack: LanguagePack): Promise<LearnContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    deps: {
      pack,
      repo: createRepository(supabase, pack),
      now: () => new Date(),
      makeLesson: (request) => generateLesson(pack, request),
      onAiFallback: (error) => {
        console.warn(`[learn:${pack.id}] AI unavailable, serving fallback lesson:`, error instanceof Error ? error.message : "unknown");
      },
    },
  };
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
}

export async function rateLimited(key: string, limit: number): Promise<NextResponse | null> {
  const result = await checkRateLimit(key, { limit, windowMs: 60_000 });
  return result.allowed ? null : NextResponse.json({ error: "Too many requests. Slow down a little." }, { status: 429 });
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Maps known failures to safe responses; never leaks internals to the client. */
export function toErrorResponse(error: unknown, scope: string): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  if (error instanceof SessionNotEligibleError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  if (error instanceof PersistenceError) {
    console.error(`[learn/${scope}]`, error.message, error.cause);
    return NextResponse.json({ error: "Could not save your progress. Please try again." }, { status: 500 });
  }
  if (error instanceof FrenchDomainError) {
    console.error(`[learn/${scope}]`, error.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  console.error(`[learn/${scope}] unexpected`, error);
  return NextResponse.json({ error: "Internal server error." }, { status: 500 });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    // An unreadable body is a client error, handled by the schema as `undefined`.
    return undefined;
  }
}
