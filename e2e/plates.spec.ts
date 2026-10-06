/**
 * T14: a scene uses its baked plate when one fits the viewport and falls back
 * to the painter when the plate is missing, in the stage and the static view.
 */
import { expect, test } from "@playwright/test";

for (const path of ["./#/ch/prologue/p-pore", "./?static=1#/ch/prologue/p-pore"]) {
  test(`${path}: baked plate when present`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 120_000 });
    await expect(page.locator(".world")).toHaveAttribute("data-plate", "baked");
  });

  test(`${path}: painter when the plate is missing`, async ({ page }) => {
    await page.route("**/plates/**/*.avif", (r) => r.fulfill({ status: 404 }));
    await page.goto(path);
    await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 120_000 });
    await expect(page.locator(".world")).toHaveAttribute("data-plate", "painted");
  });
}
