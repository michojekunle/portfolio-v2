/** GET/POST /api/spanish/group — see features/learn/server/handlers.ts. */
import { SPANISH } from "@/features/learn/domain/languages";
import { groupHandlers } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
const handlers = groupHandlers(SPANISH);
export const GET = handlers.GET;
export const POST = handlers.POST;
