import { expect, test, type Page } from "@playwright/test";
import { MISSIONS } from "../src/content";
import { C13_SATELLITE } from "../src/content/chapters/c13";
import { SAVE_KEY, freshSave } from "../src/save/schema";
import { STORM_MS } from "../src/ui/storm";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
  await page.waitForTimeout(700);
}

/** Phones fold the sheet for steps played in the world; unfold it to use the panel. */
async function panel(page: Page) {
  const toggle = page.locator(".mission-toggle");
  if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
  return page.locator(".mission");
}

async function go(page: Page, label: string, heading: string) {
  await page.getByRole("button", { name: `Go: ${label}` }).click();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await settled(page);
}

test("play chapter 13: splash, the storm, salt and the satellite", async ({ page }, info) => {
  test.setTimeout(180_000);
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done and the river glimpsed on the map: chapter 13 is open (WB§1).
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf", "c13"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    rumors: { "r-c13": "glimpsed" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await go(page, "The river", "The hill above the river");
  await shot(page, "c13-01-valley", p);

  // c13-m1: bare soil in intense rain, then a cover.
  await go(page, "Kneel by a bare strip", "Rain on bare and covered soil");
  let mission = await panel(page);
  await mission.getByRole("radio", { name: "The bare soil" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Let the storm fall" }).click();
  await expect(mission.locator(".observation").first()).toContainText("60 of 100");
  await mission.getByRole("radio", { name: "Full straw, 70 %" }).check();
  await mission.getByRole("button", { name: "Let the storm fall" }).click();
  await expect(mission.locator(".observation").first()).toContainText("18 of 100");
  await shot(page, "c13-02-splash", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /A thin sheet/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c13-m2: the storm darkens and clears, the soil reaches the river, and weeks later the bloom.
  await go(page, "Back to the hill above the river", "The hill above the river");
  mission = await panel(page);
  await mission.getByRole("button", { name: "Summon the storm" }).click();
  await page.waitForTimeout(3_500);
  await expect(mission.locator(".c13-storm .wash")).toHaveCSS("opacity", "0.5");
  await shot(page, "c13-03-storm", p);
  await page.waitForTimeout(STORM_MS - 3_500 + 500);
  await mission.getByRole("button", { name: "Weeks later" }).click();
  await expect(mission.locator(".observation").first()).toContainText("algae bloom");
  await shot(page, "c13-04-bloom", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "On eroded soil particles" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c13-m3: thirty years with and without drains.
  await go(page, "Over the ridge: the dry irrigated valley", "The dry irrigated valley");
  await shot(page, "c13-05-salt-scene", p);
  mission = await panel(page);
  await mission.getByRole("radio", { name: "Climb" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Irrigate for 30 years" }).click();
  await expect(mission.locator(".observation").first()).toContainText("(saline)");
  await mission.getByRole("radio", { name: "Drains", exact: true }).check();
  await mission.getByRole("radio", { name: "Extra water" }).check();
  await mission.getByRole("button", { name: "Irrigate for 30 years" }).click();
  await expect(mission.locator(".observation").first()).not.toContainText("(saline)");
  await shot(page, "c13-06-salt", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Only if the extra water can drain/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c13-m4: the satellite is labelled a reflectance measurement, beside the painted valley.
  await go(page, "Back to the hill above the river", "The hill above the river");
  mission = await panel(page);
  await expect(mission.locator(".c13-tag[data-kind='measured']")).toHaveText(C13_SATELLITE.label);
  await expect(mission.locator(".c13-inset").first()).toContainText(C13_SATELLITE.credit);
  for (const probe of C13_SATELLITE.probes)
    await mission.getByRole("button", { name: `Probe ${probe.id}` }).click();
  await expect(mission.locator(".observation").first()).toContainText("Green share");
  await shot(page, "c13-07-satellite", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /reflectance/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /I can't tell the cause from pixels/ }).click();
  await expect(mission.locator(".feedback")).toContainText("Defensible");
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("Chapter 13 · complete");
  expect(errors).toEqual([]);
});
