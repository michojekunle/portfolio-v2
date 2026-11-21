/**
 * POST /api/billing/checkout — start a Plus subscription (Stripe Checkout).
 * Body: { app: "/french" | "/spanish" } — where to return afterwards.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { FRENCH } from "@/features/learn/domain/languages";
import { BillingUnavailableError, createCheckout } from "@/features/learn/server/billing";
import { getLearnContext, rateLimited, readJson, toErrorResponse, unauthorized } from "@/features/learn/server/context";

export const dynamic = "force-dynamic";

const BodySchema = z.object({ app: z.enum(["/french", "/spanish"]) });

export async function POST(request: Request): Promise<Response> {
  try {
    const { user } = await getLearnContext(FRENCH);
    if (!user) return unauthorized();
    const limited = await rateLimited(`billing:checkout:${user.id}`, 5);
    if (limited) return limited;
    const { app } = BodySchema.parse(await readJson(request));
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    return NextResponse.json({ url: await createCheckout(user.id, user.email ?? undefined, `${origin}${app}`) });
  } catch (error) {
    if (error instanceof BillingUnavailableError) {
      console.warn("[billing/checkout]", error.message);
      return NextResponse.json({ error: "Plus isn't available yet. Check back soon." }, { status: 503 });
    }
    return toErrorResponse(error, "billing/checkout");
  }
}
