/**
 * Plus subscriptions via Stripe, without the SDK: Checkout Sessions over the
 * REST API and a verified webhook that writes learn_entitlements (service role).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isPlusActive } from "../domain/plus";
import { FrenchDomainError, PersistenceError } from "./errors";

export class BillingUnavailableError extends FrenchDomainError {}

/** The learner already has an active Plus subscription; a second checkout would bill them twice. */
export class AlreadySubscribedError extends FrenchDomainError {}

async function stripe(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new BillingUnavailableError("Payments are not configured yet.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof data.error === "object" && data.error !== null && "message" in data.error ? String(data.error.message) : `HTTP ${response.status}`;
    throw new BillingUnavailableError(`Stripe request failed: ${message}`);
  }
  return data;
}

/** Starts a Plus subscription checkout and returns the Stripe-hosted URL. */
export async function createCheckout(userId: string, email: string | undefined, returnUrl: string): Promise<string> {
  const price = process.env.STRIPE_PRICE_PLUS;
  if (!price) throw new BillingUnavailableError("Payments are not configured yet.");
  const session = await stripe("checkout/sessions", {
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: userId,
    "subscription_data[metadata][user_id]": userId,
    ...(email ? { customer_email: email } : {}),
    success_url: `${returnUrl}?plus=welcome`,
    cancel_url: returnUrl,
    allow_promotion_codes: "true",
  });
  if (typeof session.url !== "string") throw new BillingUnavailableError("Stripe returned no checkout URL.");
  return session.url;
}

export async function readEntitlement(db: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await db
    .from("learn_entitlements")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle<{ status: string; current_period_end: string | null }>();
  if (error) throw new PersistenceError("readEntitlement", error);
  return isPlusActive(data ? { status: data.status, currentPeriodEnd: data.current_period_end } : null, new Date());
}

/** The parts of a Stripe subscription we use. Verified events are still parsed, never trusted blindly. */
const SubscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  customer: z.string(),
  current_period_end: z.number().optional(),
  items: z.object({ data: z.array(z.object({ current_period_end: z.number().optional() })).optional() }).optional(),
  metadata: z.object({ user_id: z.string().uuid().optional() }).optional(),
});

export interface EntitlementRow {
  readonly status: string;
  readonly current_period_end: string | null;
  readonly stripe_subscription_id: string | null;
}

export interface EntitlementWrite extends EntitlementRow {
  readonly user_id: string;
  readonly stripe_customer_id: string;
}

export interface BillingDeps {
  readonly now: () => Date;
  /** Current state of a subscription straight from Stripe, so late or replayed events can't apply stale state. */
  readonly fetchSubscription: (subscriptionId: string) => Promise<unknown>;
  readonly readRow: (userId: string) => Promise<EntitlementRow | null>;
  readonly writeRow: (row: EntitlementWrite) => Promise<void>;
}

const toEntitlement = (row: Pick<EntitlementRow, "status" | "current_period_end">) => ({ status: row.status, currentPeriodEnd: row.current_period_end });

/**
 * Applies a verified Stripe event. Only subscription lifecycle events matter; others are acknowledged and ignored.
 * Stripe delivers events out of order and retries them, so the event is only a hint: the subscription is
 * re-read from Stripe and that state is written. A non-active subscription never overwrites a different
 * subscription that is still active (e.g. a learner who somehow paid twice cancels one of them).
 */
export async function applySubscriptionEvent(deps: BillingDeps, event: { readonly type: string; readonly data: { readonly object: unknown } }): Promise<void> {
  if (!event.type.startsWith("customer.subscription.")) return;
  const hinted = z.object({ id: z.string() }).safeParse(event.data.object);
  if (!hinted.success) {
    console.warn("[billing] subscription event without an id");
    return;
  }
  const parsed = SubscriptionSchema.safeParse(await deps.fetchSubscription(hinted.data.id));
  if (!parsed.success) {
    console.warn("[billing] unexpected subscription payload", parsed.error.issues[0]?.message);
    return;
  }
  const sub = parsed.data;
  const userId = sub.metadata?.user_id;
  if (!userId) {
    console.warn("[billing] subscription without user_id metadata", sub.id);
    return;
  }
  // Newer Stripe API versions moved the period end onto subscription items.
  const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  const next: EntitlementWrite = {
    user_id: userId,
    status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
  };
  const now = deps.now();
  const existing = await deps.readRow(userId);
  if (existing && existing.stripe_subscription_id !== sub.id && isPlusActive(toEntitlement(existing), now) && !isPlusActive(toEntitlement(next), now)) {
    console.warn("[billing] ignoring inactive subscription while another one is active", sub.id);
    return;
  }
  await deps.writeRow(next);
}

async function stripeGet(path: string): Promise<unknown> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new BillingUnavailableError("Payments are not configured yet.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new BillingUnavailableError(`Stripe request failed: HTTP ${response.status}`);
  return response.json();
}

/** Wires the event handler to Stripe and Supabase (service role). */
export function supabaseBillingDeps(admin: SupabaseClient): BillingDeps {
  return {
    now: () => new Date(),
    fetchSubscription: (id) => stripeGet(`subscriptions/${encodeURIComponent(id)}`),
    readRow: async (userId) => {
      const { data, error } = await admin
        .from("learn_entitlements")
        .select("status, current_period_end, stripe_subscription_id")
        .eq("user_id", userId)
        .maybeSingle<EntitlementRow>();
      if (error) throw new PersistenceError("readEntitlementRow", error);
      return data;
    },
    writeRow: async (row) => {
      const { error } = await admin.from("learn_entitlements").upsert({ ...row, plan: "plus", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw new PersistenceError("writeEntitlement", error);
    },
  };
}
