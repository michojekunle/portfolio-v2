import { expect, test } from "@playwright/test";

test.describe("self-hosted voice engine", () => {
  for (const file of ["piper-tts-web.js", "piper.js", "ort.js", "voices.js", "piper_phonemize.wasm", "ort/ort-wasm-simd-threaded.wasm"]) {
    test(`serves ${file} from this site, cacheable`, async ({ request }) => {
      const response = await request.get(`/vendor/piper-v1/${file}`);
      expect(response.status(), "run `node scripts/vendor-piper.mjs` if a binary is missing").toBe(200);
      expect(response.headers()["cache-control"]).toContain("immutable");
    });
  }

  test("the page's content security policy no longer allows third-party CDNs for scripts", async ({ request }) => {
    const csp = (await request.get("/french")).headers()["content-security-policy"] ?? "";
    expect(csp).toContain("script-src");
    expect(csp).not.toContain("cdn.jsdelivr.net");
    expect(csp).not.toContain("cdnjs.cloudflare.com");
    expect(csp).toContain("huggingface.co"); // voice models still come from there
  });
});

test.describe("API boundaries", () => {
  test("events: rejects names that aren't on the list", async ({ request }) => {
    const response = await request.post("/api/learn/events", { data: { name: "drop_table" } });
    expect(response.status()).toBe(400);
  });

  test("events: rejects free-text properties that are too long", async ({ request }) => {
    const response = await request.post("/api/learn/events", { data: { name: "session_started", props: { note: "x".repeat(200) } } });
    expect(response.status()).toBe(400);
  });

  test("events: refuses names only the server's own jobs may write", async ({ request }) => {
    const response = await request.post("/api/learn/events", { data: { name: "reminder_run", props: { checked: 0, sent: 0, failed: 9999 } } });
    expect(response.status()).toBe(400);
  });

  test("events: accepts a valid event quietly", async ({ request }) => {
    const response = await request.post("/api/learn/events", { data: { name: "session_started", language: "fr", props: { first: true } } });
    expect(response.status()).toBe(204);
  });

  test("checkout requires a signed-in learner", async ({ request }) => {
    const response = await request.post("/api/billing/checkout", { data: { app: "/french" } });
    expect(response.status()).toBe(401);
  });

  test("the stripe webhook refuses unsigned requests", async ({ request }) => {
    const response = await request.post("/api/billing/webhook", { data: { type: "customer.subscription.updated" }, headers: { "stripe-signature": "t=1,v1=bad" } });
    expect([400, 500]).toContain(response.status());
  });

  test("the reminder job refuses requests without the shared secret", async ({ request }) => {
    expect((await request.post("/api/learn/reminders")).status()).toBe(401);
    expect((await request.post("/api/learn/reminders", { headers: { authorization: "Bearer wrong" } })).status()).toBe(401);
  });

  test("reminder settings need an account", async ({ request }) => {
    expect((await request.get("/api/french/reminder")).status()).toBe(401);
    expect((await request.put("/api/spanish/reminder", { data: {} })).status()).toBe(401);
  });

  test("groups need an account", async ({ request }) => {
    expect((await request.get("/api/french/group")).status()).toBe(401);
  });
});
