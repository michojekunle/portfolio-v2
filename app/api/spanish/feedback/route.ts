/** POST /api/spanish/feedback — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { feedbackHandler } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
export const POST = feedbackHandler(SPANISH);
