/** GET/PUT /api/french/reminder — see features/learn/server/handlers.ts. */
import { FRENCH } from "@/features/learn/domain/languages";
import { reminderHandlers } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
const handlers = reminderHandlers(FRENCH);
export const GET = handlers.GET;
export const PUT = handlers.PUT;
