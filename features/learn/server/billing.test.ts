import { describe, expect, it, vi } from "vitest";
import { applySubscriptionEvent, type BillingDeps, type EntitlementRow, type EntitlementWrite } from "./billing";

const NOW = new Date("2026-11-21T12:00:00Z");
const USER = "6f1d3c1e-2b9a-4c4e-9a2f-0d6f4a1b2c3d";
const future = Math.floor(new Date("2026-12-21T00:00:00Z").getTime() / 1000);

const subscription = (overrides: Record<string, unknown> = {}) => ({
  id: "sub_1",
  status: "active",
  customer: "cus_1",
  current_period_end: future,
  metadata: { user_id: USER },
  ...overrides,
});

function deps(stripeState: unknown, existing: EntitlementRow | null = null): BillingDeps & { writes: EntitlementWrite[]; fetchSubscription: ReturnType<typeof vi.fn> } {
  const writes: EntitlementWrite[] = [];
  return {
    writes,
    now: () => NOW,
    fetchSubscription: vi.fn(async () => stripeState),
    readRow: async () => existing,
    writeRow: async (row) => {
      writes.push(row);
    },
  };
}

const event = (type: string, object: unknown = { id: "sub_1" }) => ({ type, data: { object } });

describe("applySubscriptionEvent", () => {
  it("writes the subscription's current state from Stripe, not the event payload", async () => {
    const d = deps(subscription({ status: "canceled" }));
    // A stale "updated: active" event arriving after cancellation.
    await applySubscriptionEvent(d, event("customer.subscription.updated", subscription({ status: "active" })));
    expect(d.fetchSubscription).toHaveBeenCalledWith("sub_1");
    expect(d.writes).toHaveLength(1);
    expect(d.writes[0]).toMatchObject({ user_id: USER, status: "canceled", stripe_subscription_id: "sub_1" });
  });

  it("doesn't let a different, inactive subscription revoke an active one", async () => {
    const active: EntitlementRow = { status: "active", current_period_end: "2026-12-21T00:00:00.000Z", stripe_subscription_id: "sub_keep" };
    const d = deps(subscription({ id: "sub_other", status: "canceled" }), active);
    await applySubscriptionEvent(d, event("customer.subscription.deleted", { id: "sub_other" }));
    expect(d.writes).toEqual([]);
  });

  it("replaces a lapsed subscription with a new active one", async () => {
    const lapsed: EntitlementRow = { status: "canceled", current_period_end: "2026-10-01T00:00:00.000Z", stripe_subscription_id: "sub_old" };
    const d = deps(subscription({ id: "sub_new" }), lapsed);
    await applySubscriptionEvent(d, event("customer.subscription.created", { id: "sub_new" }));
    expect(d.writes[0]).toMatchObject({ status: "active", stripe_subscription_id: "sub_new" });
  });

  it("ignores events that aren't about subscriptions", async () => {
    const d = deps(subscription());
    await applySubscriptionEvent(d, event("invoice.paid"));
    expect(d.fetchSubscription).not.toHaveBeenCalled();
    expect(d.writes).toEqual([]);
  });

  it("ignores subscriptions without a learner id", async () => {
    const d = deps(subscription({ metadata: {} }));
    await applySubscriptionEvent(d, event("customer.subscription.updated"));
    expect(d.writes).toEqual([]);
  });
});
