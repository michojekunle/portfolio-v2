/** PUT /api/spanish/profile — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { profileHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const PUT = profileHandler(SPANISH);
