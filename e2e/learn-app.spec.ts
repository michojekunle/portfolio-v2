import { expect, test } from "@playwright/test";

const APPS = [
  { route: "/french", name: "French Daily", start: /Commencer/, greeting: /Bonjour|Bonsoir/ },
  { route: "/spanish", name: "Spanish Daily", start: /Empezar/, greeting: /Buenos días|Buenas noches|Buenas tardes|Hola/ },
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
  });
}

test("the retired classic French page redirects to the app", async ({ page }) => {
  const response = await page.goto("/french/classic");
  expect(new URL(page.url()).pathname).toBe("/french");
  expect(response?.status()).toBe(200);
});
