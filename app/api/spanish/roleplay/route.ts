/** POST /api/spanish/roleplay — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { roleplayHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const POST = roleplayHandler(SPANISH);
