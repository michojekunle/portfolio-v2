/** GET/PATCH/POST /api/french/words — see features/learn/server/handlers.ts. */
import { FRENCH } from "@/features/learn/domain/languages";
import { wordsHandlers } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
const handlers = wordsHandlers(FRENCH);
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const POST = handlers.POST;
