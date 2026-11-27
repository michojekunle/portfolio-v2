/** POST /api/french/roleplay — see features/learn/server/handlers.ts. */
import { FRENCH } from "@/features/learn/domain/languages";
import { roleplayHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const POST = roleplayHandler(FRENCH);
