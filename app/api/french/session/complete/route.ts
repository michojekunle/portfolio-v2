/** POST /api/french/session/complete — see features/learn/server/handlers.ts. */
import { FRENCH } from "@/features/learn/domain/languages";
import { completeHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const POST = completeHandler(FRENCH);
