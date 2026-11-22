import { expect, test } from "@playwright/test";

for (const { path, app, h1 } of [
  { path: "/learn/french", app: "/french", h1: /One French page a day/ },
  { path: "/learn/spanish", app: "/spanish", h1: /One Spanish page a day/ },
] as const) {
  test.describe(`landing ${path}`, () => {
    test("explains the page and links into the app", async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page.getByRole("heading", { name: "What a page looks like" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Questions" })).toBeVisible();
      const start = page.getByRole("link", { name: /Start today's page/ }).first();
      await expect(start).toHaveAttribute("href", app);
    });

    test("is indexable and has a canonical URL and a preview image", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    });
  });
}

test("the sitemap lists both landing pages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/learn/french");
  expect(xml).toContain("/learn/spanish");
});

for (const app of ["/french", "/spanish", "/learn/french", "/learn/spanish"]) {
  test(`${app} has a real social preview image`, async ({ page, request }) => {
    await page.goto(app);
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(image).toBeTruthy();
    const response = await request.get(new URL(image ?? "", page.url()).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
}
