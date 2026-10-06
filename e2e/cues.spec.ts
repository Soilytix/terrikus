import { expect, test, type Page } from "@playwright/test";

const outline = (page: Page) => page.locator(".scene-outline");

async function firstVisit(page: Page) {
  await page.goto("./#/ch/prologue/p-field-dawn");
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
}

test("labels show on a scene's first visit", async ({ page }) => {
  await firstVisit(page);
  await expect(page.locator('.hotspot[data-kind="scan"] .hotspot-label').first()).toBeVisible();
});

test("idle pulse waits 6 s and is off under reduced motion", async ({ page }) => {
  await firstVisit(page);
  await expect(outline(page)).toHaveAttribute("data-idle", "true", { timeout: 9_000 });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await firstVisit(page);
  await page.waitForTimeout(7_000);
  await expect(outline(page)).toHaveAttribute("data-idle", "false");
});
