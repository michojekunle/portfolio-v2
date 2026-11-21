/** GET/POST /api/french/group — see features/learn/server/handlers.ts. */
import { FRENCH } from "@/features/learn/domain/languages";
import { groupHandlers } from "@/features/learn/server/handlers";

export const dynamic = "force-dynamic";
const handlers = groupHandlers(FRENCH);
export const GET = handlers.GET;
export const POST = handlers.POST;
