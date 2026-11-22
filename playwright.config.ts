import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end checks for French/Spanish Daily. They run against a local server
 * and need no accounts or API keys: a guest can load and start a page, and the
 * API checks only exercise validation and auth.
 *
 *   pnpm e2e                 starts `pnpm dev` (or reuses one already on :3000)
 *   E2E_BASE_URL=https://…   runs against a deployed site instead
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  // Pages are heavy to render; too many at once makes a laptop or a small CI box flaky.
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /learn-app\.spec\.ts/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "pnpm dev", url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
