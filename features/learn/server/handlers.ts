/**
 * Route handlers shared by every language. Each app/api/<language>/… route is
 * a one-line binding of one of these to its language pack, so French and
 * Spanish can never drift apart in validation, auth, rate limits or errors.
 */
import { NextResponse } from "next/server";
import { withVariant, type LanguagePack } from "../domain/language";
import {
  FeedbackRequestSchema,
  ProfileUpdateSchema,
  RoleplayRequestSchema,
  SessionCompleteSchema,
  TimeZoneSchema,
  WordActionSchema,
  WordsPostSchema,
  ReminderUpdateSchema,
  GroupActionSchema,
} from "../domain/schemas";
import { debriefRoleplay, gradeSentence, runRoleplayTurn, translateGoalPhrase } from "./ai";
import { clientIp, getLearnContext, rateLimited, readJson, toErrorResponse, unauthorized } from "./context";
import { AiUnavailableError } from "./errors";
import { adminClient } from "./admin";
import { readEntitlement } from "./billing";
import { applyGroupAction, getMyGroup } from "./groups";
import { TtsUnavailableError, naturalVoiceUrl } from "./tts";
import { getReminder, saveReminder } from "./reminders";
import {
  addCustomPhrase,
  completeUserSession,
  listWords,
  loadGuestSession,
  loadUserSession,
  saveDirectWord,
  saveUserProfile,
  seedTrackStarterKit,
  updateWord,
} from "./service";

type Handler = (request: Request) => Promise<Response>;

/** GET …/session?tz=<IANA zone> — the home screen payload. Guests get a self-contained session. */
export function sessionHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user, deps, db } = await getLearnContext(pack);
      const limited = await rateLimited(`${pack.id}:session:${user?.id ?? clientIp(request)}`, 30);
      if (limited) return limited;

      const tzParam = new URL(request.url).searchParams.get("tz");
      const parsedTz = tzParam ? TimeZoneSchema.safeParse(tzParam) : null;
      const timezone = parsedTz?.success ? parsedTz.data : null;

      // Guests choose variant/track/focus per device; signed-in learners have them on their profile.
      const searchParams = new URL(request.url).searchParams;
      const variant = searchParams.get("variant");
      const track = searchParams.get("track");
      const focus = searchParams.get("focus");
      const payload = user
        ? await loadUserSession(deps, user.id, timezone)
        : loadGuestSession(pack, deps.now(), timezone, variant, track, focus);
      // Plus is optional infrastructure: if its table isn't there yet, everyone is simply on the free plan.
      const plus = user ? await readEntitlement(db, user.id).catch((error: unknown) => {
        console.warn(`[learn/${pack.id}] entitlement check failed`, error instanceof Error ? error.message : error);
        return false;
      }) : false;
      return NextResponse.json({ ...payload, plus });
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

      const result = await saveUserProfile(deps, user.id, ProfileUpdateSchema.parse(await readJson(request)));
      return NextResponse.json({ ok: true, ...result });
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

/** GET …/words — the learner's deck. PATCH …/words — "known" / "again". POST …/words — starter kit, custom phrase, or direct save. */
export function wordsHandlers(pack: LanguagePack): { readonly GET: Handler; readonly PATCH: Handler; readonly POST: Handler } {
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
    POST: async (request) => {
      try {
        const { user, deps } = await getLearnContext(pack);
        if (!user) return unauthorized();
        const input = WordsPostSchema.parse(await readJson(request));
        if (input.kind === "starter") {
          const limited = await rateLimited(`${pack.id}:words-starter:${user.id}`, 10);
          if (limited) return limited;
          return NextResponse.json(await seedTrackStarterKit(deps, user.id, input.track));
        }
        if (input.kind === "save") {
          const limited = await rateLimited(`${pack.id}:words-save:${user.id}`, 30);
          if (limited) return limited;
          const word = await saveDirectWord(deps, user.id, input);
          return NextResponse.json({ word });
        }
        const limited = await rateLimited(`${pack.id}:words-custom:${user.id}`, 10);
        if (limited) return limited;
        try {
          const res = await addCustomPhrase(deps, user.id, translateGoalPhrase, input);
          return NextResponse.json({ available: true, ...res });
        } catch (error) {
          if (!(error instanceof AiUnavailableError)) throw error;
          console.warn(`[learn/${pack.id}/words-custom] AI unavailable:`, error.message);
          return NextResponse.json({ available: false });
        }
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/words`);
      }
    },
  };
}

/** POST …/roleplay — focused 4-6 turn live scenario practice or Red Pen debrief. */
export function roleplayHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user, deps } = await getLearnContext(pack);
      if (!user) return unauthorized();
      const limited = await rateLimited(`${pack.id}:roleplay:${user.id}`, 24);
      if (limited) return limited;

      const input = RoleplayRequestSchema.parse(await readJson(request));
      const profile = await deps.repo.getProfile(user.id);
      const effectivePack = withVariant(pack, profile?.variant);

      try {
        if (input.action === "debrief") {
          return NextResponse.json({ available: true, debrief: await debriefRoleplay(effectivePack, input) });
        }
        return NextResponse.json({ available: true, turn: await runRoleplayTurn(effectivePack, input) });
      } catch (error) {
        if (!(error instanceof AiUnavailableError)) throw error;
        console.warn(`[learn/${pack.id}/roleplay] AI unavailable:`, error.message);
        return NextResponse.json({ available: false });
      }
    } catch (error) {
      return toErrorResponse(error, `${pack.id}/roleplay`);
    }
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

/** GET …/group?tz= — my group for this language (or null). POST …/group — create / join / leave / post a voice note. */
export function groupHandlers(pack: LanguagePack): { readonly GET: Handler; readonly POST: Handler } {
  return {
    GET: async (request) => {
      try {
        const { user, db } = await getLearnContext(pack);
        if (!user) return unauthorized();
        const tz = TimeZoneSchema.safeParse(new URL(request.url).searchParams.get("tz") ?? "");
        return NextResponse.json({ group: await getMyGroup(db, user.id, pack, tz.success ? tz.data : "UTC") });
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/group`);
      }
    },
    POST: async (request) => {
      try {
        const { user, db } = await getLearnContext(pack);
        if (!user) return unauthorized();
        const limited = await rateLimited(`${pack.id}:group:${user.id}`, 20);
        if (limited) return limited;
        return NextResponse.json({ group: await applyGroupAction(db, user.id, pack, GroupActionSchema.parse(await readJson(request))) });
      } catch (error) {
        return toErrorResponse(error, `${pack.id}/group`);
      }
    },
  };
}


/**
 * GET …/tts?text=&rate=&locale= — a signed URL to a natural (neural) voice
 * recording of one line. Plus only; synthesised once per line and cached.
 */
export function ttsHandler(pack: LanguagePack): Handler {
  return async (request) => {
    try {
      const { user, db } = await getLearnContext(pack);
      if (!user) return unauthorized();
      if (!(await readEntitlement(db, user.id))) return NextResponse.json({ error: "Natural voices are part of Plus." }, { status: 402 });
      const limited = await rateLimited(`${pack.id}:tts:${user.id}`, 120);
      if (limited) return limited;

      const params = new URL(request.url).searchParams;
      const text = (params.get("text") ?? "").trim();
      const rate = Number(params.get("rate") ?? "0.9");
      const locale = params.get("locale") ?? pack.speechLocale;
      const allowedLocales = [pack.speechLocale, ...(pack.variants ?? []).map((v) => v.speechLocale)];
      if (!text || text.length > 300 || !Number.isFinite(rate) || rate < 0.5 || rate > 1.5 || !allowedLocales.includes(locale)) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }
      const admin = adminClient();
      if (!admin) return NextResponse.json({ error: "Natural voices aren't configured." }, { status: 503 });
      return NextResponse.json({ url: await naturalVoiceUrl(admin, text, locale, rate) });
    } catch (error) {
      if (error instanceof TtsUnavailableError) {
        console.warn(`[learn/${pack.id}/tts]`, error.message);
        return NextResponse.json({ error: "Natural voices are unavailable right now." }, { status: 503 });
      }
      return toErrorResponse(error, `${pack.id}/tts`);
    }
  };
}
