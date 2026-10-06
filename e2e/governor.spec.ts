/** Software GL is too slow for the moving world: the governor steps down the tiers and ends on the static plate. */
import { expect, test } from "@playwright/test";

test.use({
  launchOptions: {
    args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
  },
});

test("the quality governor falls back to static on software GL", async ({ page }) => {
  // Software GL on a loaded runner can draw under one frame a second.
  test.setTimeout(300_000);
  await page.goto("./#/ch/prologue/p-pore");
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "pixi");
  // Record every living-backdrop tier the governor passes through on the way down.
  await page.evaluate(() => {
    const w = document.querySelector(".world")!;
    const seen: (string | null)[] = [w.getAttribute("data-tier")];
    Object.assign(window, { tiers: seen });
    new MutationObserver(() => seen.push(w.getAttribute("data-tier"))).observe(w, {
      attributeFilter: ["data-tier"],
    });
  });
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "static", { timeout: 180_000 });
  const tiers = await page.evaluate(() => (window as unknown as { tiers: string[] }).tiers);
  expect(tiers).toEqual(expect.arrayContaining(["medium", "off"]));
  await expect(page.locator(".world-plate")).toBeVisible();
  await expect(page.getByRole("button", { name: "Look at: Bacterium" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByText(/Still pictures were chosen/)).toBeVisible();
});
