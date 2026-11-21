/**
 * POST /api/billing/webhook — Stripe subscription events → learn_entitlements.
 * Signature-verified (STRIPE_WEBHOOK_SECRET); configure in the Stripe dashboard
 * for customer.subscription.created / .updated / .deleted.
 */
import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/features/learn/domain/plus";
import { adminClient } from "@/features/learn/server/admin";
import { applySubscriptionEvent, supabaseBillingDeps } from "@/features/learn/server/billing";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const admin = adminClient();
  if (!secret || !admin) {
    console.error("[billing/webhook] STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY are required");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const payload = await request.text();
  if (!(await verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret, new Date()))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  try {
    const event = JSON.parse(payload) as { type: string; data: { object: unknown } };
    await applySubscriptionEvent(supabaseBillingDeps(admin), event);
    return NextResponse.json({ received: true });
  } catch (error) {
    // A 500 makes Stripe retry, which is what we want for a transient database error.
    console.error("[billing/webhook] failed to apply event", error);
    return NextResponse.json({ error: "Failed to apply event." }, { status: 500 });
  }
}
