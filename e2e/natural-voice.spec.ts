import { expect, test } from "@playwright/test";

/**
 * Downloads the real voice (about 95 MB, mostly from Hugging Face), so it only
 * runs on request:  E2E_VOICE=1 pnpm e2e natural-voice
 */
test.skip(!process.env.E2E_VOICE, "set E2E_VOICE=1 to download and test the real voice");
test.setTimeout(10 * 60_000);

test("turning on the natural voice downloads it, plays it, and loads nothing from third-party CDNs", async ({ page }) => {
  const hosts = new Set<string>();
  page.on("request", (request) => hosts.add(new URL(request.url()).host));
  await page.addInitScript(() => {
    const played: string[] = [];
    (window as unknown as { __played: string[] }).__played = played;
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
      played.push(this.src.startsWith("blob:") ? "blob" : this.src);
      return original.call(this);
    };
  });

  await page.goto("/french");
  await page.getByRole("button", { name: /Réglages/ }).click();
  await page.getByRole("button", { name: /Turn on \(free, about 95 MB once\)/ }).first().click();

  await expect(page.getByText(/Downloading the voice/).first()).toBeVisible();
  await expect(page.getByText(/MB of \d+ MB/).first()).toBeVisible();
  await expect(page.getByText("On — runs on this device.").first()).toBeVisible({ timeout: 8 * 60_000 });

  // The sample line is spoken with the downloaded voice, not the device's.
  await expect.poll(() => page.evaluate(() => (window as unknown as { __played: string[] }).__played)).toContain("blob");

  const external = [...hosts].filter((host) => !host.startsWith("localhost") && !host.endsWith("huggingface.co") && !host.endsWith("hf.co"));
  expect(external.filter((host) => /jsdelivr|cdnjs|unpkg/.test(host))).toEqual([]);
});
