/** Software GL is too slow for the moving world: the governor must end on the static plate. */
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
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "static", { timeout: 180_000 });
  await expect(page.locator(".world-plate")).toBeVisible();
  await expect(page.getByRole("button", { name: "Look at: Bacterium" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByText(/Still pictures were chosen/)).toBeVisible();
});
