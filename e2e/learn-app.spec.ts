import { expect, test } from "@playwright/test";

const APPS = [
  { route: "/french", name: "French Daily", langName: "French", myWords: /Mes mots/, start: /Commencer/, greeting: /Bonjour|Bonsoir/, sample: { text: "la boulangerie", english: "the bakery", text2: "sans", english2: "without" } },
  { route: "/spanish", name: "Spanish Daily", langName: "Spanish", myWords: /Mis palabras/, start: /Empezar/, greeting: /Buenos días|Buenas noches|Buenas tardes|Hola/, sample: { text: "el cambio", english: "the change", text2: "sin", english2: "without" } },
] as const;

for (const app of APPS) {
  test.describe(`${app.name} as a guest`, () => {
    test("home loads with a greeting, today's page and a start button", async ({ page }) => {
      await page.goto(app.route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(app.greeting);
      await expect(page.getByRole("button", { name: app.start })).toBeVisible();
    });

    test("settings offer the free natural voice, and guests have no reminder (no account)", async ({ page }) => {
      await page.goto(app.route);
      await page.getByRole("button", { name: /Réglages|Ajustes|Settings/ }).click();
      await expect(page.getByRole("button", { name: /Turn on \(free, about 95 MB once\)/ }).first()).toBeVisible();
      await expect(page.getByText("Daily reminder time")).toHaveCount(0);
    });

    test("is kept out of search engines", async ({ page }) => {
      await page.goto(app.route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });

    test("starting a page shows the first line to learn, and leaving asks first", async ({ page }) => {
      await page.goto(app.route);
      await page.getByRole("button", { name: app.start }).click();
      await expect(page.getByRole("button", { name: /Slowly|Lentement|Despacio/i }).first()).toBeVisible();
      page.once("dialog", (dialog) => void dialog.dismiss());
      await expect(page.getByRole("button", { name: /Leave|Quitter|Salir|Close|Fermer|Cerrar/i }).first()).toBeVisible();
    });

    test("the session endpoint serves a lesson to a guest", async ({ request }) => {
      const response = await request.get(`/api${app.route}/session?tz=Africa/Lagos`);
      expect(response.status()).toBe(200);
      const body = (await response.json()) as { guest: boolean; lesson: { sentences: unknown[] } };
      expect(body.guest).toBe(true);
      expect(body.lesson.sentences.length).toBeGreaterThan(0);
    });

    test("my words supports list and flashcard modes", async ({ page }) => {
      const words = [
        { id: "w1", text: app.sample.text, english: app.sample.english, notes: "Everyday noun", source: "lesson", strength: "learning", dueAt: "2026-11-25T00:00:00.000Z", intervalDays: 1 },
        { id: "w2", text: app.sample.text2, english: app.sample.english2, notes: null, source: "error", strength: "new", dueAt: "2026-11-25T00:00:00.000Z", intervalDays: 0 },
      ];

      await page.route(`**/api${app.route}/session**`, async (route) => {
        const res = await route.fetch();
        const json = (await res.json()) as Record<string, unknown> & { profile: Record<string, unknown> };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...json, guest: false, profile: { ...json.profile, isNew: false } }),
        });
      });

      await page.route(`**/api${app.route}/words`, async (route) => {
        if (route.request().method() === "PATCH") {
          const { cardId, action } = route.request().postDataJSON() as { cardId: string; action: "known" | "again" };
          const target = words.find((w) => w.id === cardId);
          if (target) target.strength = action === "known" ? "known" : "learning";
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ word: target }) });
          return;
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ words }) });
      });

      await page.goto(app.route);
      await page.getByRole("button", { name: app.myWords }).click();
      await expect(page.getByText(app.sample.text)).toBeVisible();

      await page.getByRole("radio", { name: "Flashcards" }).click();
      await expect(page.getByText("Card 1 of 2", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: `Show answer for ${app.sample.text}` }).click();
      await expect(page.getByRole("button", { name: `Show prompt for ${app.sample.english}` })).toBeVisible();

      await page.getByRole("button", { name: "Next card" }).click();
      await expect(page.getByText("Card 2 of 2", { exact: true })).toBeVisible();

      await page.getByRole("button", { name: /Switch front side/ }).click();
      await expect(page.getByRole("button", { name: `Show answer for ${app.sample.english2}` })).toBeVisible();
      await expect(page.getByText(`English → ${app.langName}`)).toBeVisible();

      await page.getByRole("button", { name: "I know this" }).click();
      await expect(page.getByRole("button", { name: "Practise again" })).toBeVisible();
    });
  });
}

test("the retired classic French page redirects to the app", async ({ page }) => {
  const response = await page.goto("/french/classic");
  expect(new URL(page.url()).pathname).toBe("/french");
  expect(response?.status()).toBe(200);
});
