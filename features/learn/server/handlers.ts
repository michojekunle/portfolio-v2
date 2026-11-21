/**
 * Route handlers shared by every language. Each app/api/<language>/… route is
 * a one-line binding of one of these to its language pack, so French and
 * Spanish can never drift apart in validation, auth, rate limits or errors.
 */
import { NextResponse } from "next/server";
import type { LanguagePack } from "../domain/language";
import { FeedbackRequestSchema, ProfileUpdateSchema, SessionCompleteSchema, TimeZoneSchema, WordActionSchema, ReminderUpdateSchema } from "../domain/schemas";
import { gradeSentence } from "./ai";
import { clientIp, getLearnContext, rateLimited, readJson, toErrorResponse, unauthorized } from "./context";
import { AiUnavailableError } from "./errors";
import { getReminder, saveReminder } from "./reminders";
import { completeUserSession, listWords, loadGuestSession, loadUserSession, saveUserProfile, updateWord } from "./service";

type Handler = (request: Request) => Promise<Response>;

/** GET …/session?tz=<IANA zone> — the home screen payload. Guests get a self-contained session. */
export function sessionHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user, deps } = await getLearnContext(pack);
      const limited = await rateLimited(`${pack.id}:session:${user?.id ?? clientIp(request)}`, 30);
      if (limited) return limited;

      const tzParam = new URL(request.url).searchParams.get("tz");
      const parsedTz = tzParam ? TimeZoneSchema.safeParse(tzParam) : null;
      const timezone = parsedTz?.success ? parsedTz.data : null;

      // Guests choose a variant per device (?variant=); signed-in learners have it on their profile.
      const variant = new URL(request.url).searchParams.get("variant");
      const payload = user ? await loadUserSession(deps, user.id, timezone) : loadGuestSession(pack, deps.now(), timezone, variant);
      return NextResponse.json(payload);
    } catch (error) {
      return toErrorResponse(error, `${pack.id}/session`);
    }
  };
}

/** POST …/session/complete — grades cards, saves words, updates the streak. Idempotent on clientSessionId. */
export function completeHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user, deps } = await getLearnContext(pack);
      if (!user) return unauthorized();
      const limited = await rateLimited(`${pack.id}:complete:${user.id}`, 20);
      if (limited) return limited;

      const input = SessionCompleteSchema.parse(await readJson(request));
      return NextResponse.json(await completeUserSession(deps, user.id, input));
    } catch (error) {
      return toErrorResponse(error, `${pack.id}/complete`);
    }
  };
}

/** PUT …/profile — level, timezone (drives the streak day) and daily commitment. */
export function profileHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user, deps } = await getLearnContext(pack);
      if (!user) return unauthorized();
      const limited = await rateLimited(`${pack.id}:profile:${user.id}`, 20);
      if (limited) return limited;

      await saveUserProfile(deps, user.id, ProfileUpdateSchema.parse(await readJson(request)));
      return NextResponse.json({ ok: true });
    } catch (error) {
      return toErrorResponse(error, `${pack.id}/profile`);
    }
  };
}

/**
 * POST …/feedback — corrects one written sentence or spoken answer. AI-backed,
 * so sign-in gated and rate-limited; when the model is down the client gets
 * { available: false } and the step degrades gracefully.
 */
export function feedbackHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user } = await getLearnContext(pack);
      if (!user) return unauthorized();
      const limited = await rateLimited(`${pack.id}:feedback:${user.id}`, 12);
      if (limited) return limited;

      const input = FeedbackRequestSchema.parse(await readJson(request));
      try {
        return NextResponse.json({ available: true, feedback: await gradeSentence(pack, input) });
      } catch (error) {
        if (!(error instanceof AiUnavailableError)) throw error;
        console.warn(`[learn/${pack.id}/feedback] AI unavailable:`, error.message);
        return NextResponse.json({ available: false });
      }
    } catch (error) {
      return toErrorResponse(error, `${pack.id}/feedback`);
    }
  };
}

/** GET …/words — the learner's deck. PATCH …/words — "known" / "again" on one card they own. */
export function wordsHandlers(pack: LanguagePack): { readonly GET: Handler; readonly PATCH: Handler } {
  return {
    GET: async () => {
      try {
        const { user, deps } = await getLearnContext(pack);
        if (!user) return unauthorized();
        const limited = await rateLimited(`${pack.id}:words:${user.id}`, 30);
        if (limited) return limited;
        return NextResponse.json({ words: await listWords(deps, user.id) });
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/words`);
      }
    },
    PATCH: async (request) => {
      try {
        const { user, deps } = await getLearnContext(pack);
        if (!user) return unauthorized();
        const limited = await rateLimited(`${pack.id}:words-update:${user.id}`, 60);
        if (limited) return limited;
        const word = await updateWord(deps, user.id, WordActionSchema.parse(await readJson(request)));
        return word ? NextResponse.json({ word }) : NextResponse.json({ error: "Word not found." }, { status: 404 });
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/words`);
      }
    },
  };
}

/** GET/PUT …/reminder — the learner's daily reminder for this language (time, email, push subscription). */
export function reminderHandlers(pack: LanguagePack): { readonly GET: Handler; readonly PUT: Handler } {
  return {
    GET: async () => {
      try {
        const { user, db } = await getLearnContext(pack);
        if (!user) return unauthorized();
        return NextResponse.json(await getReminder(db, user.id, pack.id));
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/reminder`);
      }
    },
    PUT: async (request) => {
      try {
        const { user, db } = await getLearnContext(pack);
        if (!user) return unauthorized();
        const limited = await rateLimited(`${pack.id}:reminder:${user.id}`, 20);
        if (limited) return limited;
        return NextResponse.json(await saveReminder(db, user.id, pack.id, ReminderUpdateSchema.parse(await readJson(request))));
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/reminder`);
      }
    },
  };
}
