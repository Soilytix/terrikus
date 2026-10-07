/**
 * R02: the world reacts to the experiment. "Separate the handful" and the
 * water/air slider change the canvas, not only the side panel; under reduced
 * motion the change lands in one step with no tween. The page runs on a fake
 * clock: software GL is slow enough in real time that the quality governor
 * would swap the canvas for the static plate mid-test.
 */
import { expect, test, type Page } from "@playwright/test";

async function settled(page: Page) {
  const busy = page.locator(".hotspots");
  for (let i = 0; i < 150 && (await busy.getAttribute("data-busy")) !== "false"; i++)
    await page.clock.runFor(200);
  await expect(busy).toHaveAttribute("data-busy", "false");
  await page.clock.runFor(300);
}

/** The canvas alone: the DOM above it (panel, hotspots, HUD) is hidden while the shot is taken. */
async function canvas(page: Page): Promise<Buffer> {
  const hide = await page.addStyleTag({
    content:
      ".app > :not(.world), .hotspots { opacity: 0 !important; transition: none !important; animation: none !important; }",
  });
  const shot = await page.locator(".world-canvas").screenshot();
  await hide.evaluate((el) => (el as Element).remove());
  return shot;
}

async function toSeparate(page: Page, query = "") {
  await page.goto(`./${query}#/ch/prologue/p-handful`);
  await expect(page.getByRole("heading", { name: "A handful", exact: true })).toBeVisible();
  await settled(page);
  const mission = page.locator(".mission");
  await mission.getByRole("button", { name: "Look closer" }).click();
  await mission.getByRole("slider").fill("70");
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  return mission;
}

test("separating the handful and moving the slider change the canvas, with no tween under reduced motion", async ({
  page,
}) => {
  test.setTimeout(300_000);
  // Paused: frames only advance under runFor, 16 ms apiece.
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const mission = await toSeparate(page);
  const world = page.locator(".world");
  await expect(world).toHaveAttribute("data-mode", "pixi");

  const before = await canvas(page);
  await mission.getByRole("button", { name: "Separate the handful" }).click();
  await page.clock.runFor(100);
  const first = await canvas(page);
  await page.clock.runFor(1200);
  const later = await canvas(page);
  expect(first.equals(before)).toBe(false);
  // Reduced motion jumps to the end state: nothing changes after the first frames.
  expect(later.equals(first)).toBe(true);

  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "Water and air, in the gaps" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("slider").fill("0");
  await page.clock.runFor(100);
  const dry = await canvas(page);
  await mission.getByRole("slider").fill("50");
  await page.clock.runFor(100);
  const wet = await canvas(page);
  expect(wet.equals(dry)).toBe(false);
  await expect(world).toHaveAttribute("data-mode", "pixi");
});

test("static mode shows the separated handful as a second plate", async ({ page }) => {
  const mission = await toSeparate(page, "?static=1");
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "static");
  await expect(page.locator(".world-plate")).toHaveCount(1);
  await mission.getByRole("button", { name: "Separate the handful" }).click();
  await expect(page.locator(".world-plate")).toHaveCount(2);
});
