import { expect, test, type Page } from "@playwright/test";

const outline = (page: Page) => page.locator(".scene-outline");

async function firstVisit(page: Page, query = "") {
  await page.goto(`./${query}#/ch/prologue/p-field-dawn`);
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
}

test("labels show on a scene's first visit", async ({ page }) => {
  await firstVisit(page);
  await expect(page.locator('.hotspot[data-kind="scan"] .hotspot-label').first()).toBeVisible();
});

test("idle pulse waits 6 s and is off under reduced motion", async ({ page }) => {
  // A controlled clock: the 6 s timer fires on runFor, not on a loaded machine's wall time. The
  // static plate has no frame loop for the clock to drive; the cue lives in the DOM outline.
  await page.clock.install();
  await firstVisit(page, "?static=1");
  await page.clock.runFor(6_500);
  await expect(outline(page)).toHaveAttribute("data-idle", "true");

  // Same URL is a same-document hop; reload so the outline mounts under reduced motion.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
  await page.clock.runFor(7_000);
  await expect(outline(page)).toHaveAttribute("data-idle", "false");
});
