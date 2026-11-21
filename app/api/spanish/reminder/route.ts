/** GET/PUT /api/spanish/reminder — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { reminderHandlers } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
const handlers = reminderHandlers(SPANISH);
export const GET = handlers.GET;
export const PUT = handlers.PUT;
