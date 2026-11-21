/** GET /api/spanish/session — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { sessionHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const GET = sessionHandler(SPANISH);
