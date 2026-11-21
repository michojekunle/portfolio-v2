/** GET /api/spanish/tts — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { ttsHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const GET = ttsHandler(SPANISH);
