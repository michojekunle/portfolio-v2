/**
 * POST /api/billing/checkout — start a Plus subscription (Stripe Checkout).
 * Body: { app: "/french" | "/spanish" } — where to return afterwards.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { FRENCH } from "@/features/learn/domain/languages";
import { AlreadySubscribedError, BillingUnavailableError, createCheckout, readEntitlement } from "@/features/learn/server/billing";
import { getLearnContext, rateLimited, readJson, toErrorResponse, unauthorized } from "@/features/learn/server/context";

export const dynamic = "force-dynamic";

const BodySchema = z.object({ app: z.enum(["/french", "/spanish"]) });

export async function POST(request: Request): Promise<Response> {
  try {
    const { db, user } = await getLearnContext(FRENCH);
    if (!user) return unauthorized();
    const limited = await rateLimited(`billing:checkout:${user.id}`, 5);
    if (limited) return limited;
    const { app } = BodySchema.parse(await readJson(request));
    // Fails closed: if we can't tell whether they already pay, don't risk a second subscription.
    if (await readEntitlement(db, user.id)) throw new AlreadySubscribedError("Already subscribed to Plus.");
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    return NextResponse.json({ url: await createCheckout(user.id, user.email ?? undefined, `${origin}${app}`) });
  } catch (error) {
    if (error instanceof AlreadySubscribedError) {
      return NextResponse.json({ error: "You already have Plus. Reload the page to use it." }, { status: 409 });
    }
    if (error instanceof BillingUnavailableError) {
      console.warn("[billing/checkout]", error.message);
      return NextResponse.json({ error: "Plus isn't available yet. Check back soon." }, { status: 503 });
    }
    return toErrorResponse(error, "billing/checkout");
  }
}
