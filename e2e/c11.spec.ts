import { expect, test, type Page } from "@playwright/test";
import { MISSIONS } from "../src/content";
import { loadChapters } from "../src/content/load";
import { c11Timelapse } from "../src/content/chapters/c11";
import { SAVE_KEY, freshSave } from "../src/save/schema";

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

test("play chapter 11: read the wall, watch it form, the catena and deep time", async ({ page }, info) => {
  test.setTimeout(120_000);
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done and the pit glimpsed on the map: chapter 11 is open (WB§1).
  await loadChapters(["prologue", "c1", "leaf"]);
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf", "c11"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    rumors: { "r-c11": "glimpsed" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await page.getByRole("button", { name: "Go: A soil pit on the slope" }).click();
  await expect(page.getByRole("heading", { name: "The woodland pit" })).toBeVisible();
  await settled(page);
  await shot(page, "c11-01-pit", p);

  // c11-m1: read every layer, guess, see the name and the evidence.
  let mission = await panel(page);
  const layers = mission.getByRole("button", { name: /^Layer at/ });
  const n = await layers.count();
  expect(n).toBe(5);
  for (let i = 0; i < n; i++) {
    await layers.nth(i).click();
    await mission.getByRole("button", { name: "E: bleached", exact: true }).click();
  }
  await expect(mission.locator(".observation").first()).toContainText("C: parent material");
  await shot(page, "c11-02-read-wall", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /No: many soils lack some/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c11-m2: the time-lapse keeps its compression label on screen the whole way through.
  mission = await panel(page);
  const label = mission.locator(".timelapse-label");
  await expect(label).toHaveText(c11Timelapse.compression);
  await mission.getByRole("button", { name: "Play" }).click();
  for (const at of [500, 3500, 6500, 9500]) {
    await page.waitForTimeout(at === 500 ? 500 : 3000);
    await expect(label).toBeVisible();
    await expect(label).toHaveText(c11Timelapse.compression);
  }
  await expect(mission.locator(".timelapse figcaption")).toHaveText("Year 10,000");
  await shot(page, "c11-03-timelapse", p);
  await mission.getByRole("button", { name: "Continue" }).click({ timeout: 10_000 });
  await mission.getByRole("radio", { name: "Conifer needles" }).check();
  await mission.getByRole("radio", { name: "Sand" }).check();
  await mission.getByRole("radio", { name: "Cold and wet" }).check();
  await mission.getByRole("radio", { name: "10,000 years" }).check();
  await expect(mission.locator(".observation").first()).toContainText("A pale E");
  await shot(page, "c11-04-podzol", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Both ways/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c11-m3: down the hill; the detective pit takes any defensible reading.
  await page.getByRole("button", { name: "Go: Out of the pit and down the hill" }).click();
  await expect(page.getByRole("heading", { name: "Three pits down the hill" })).toBeVisible();
  await settled(page);
  mission = await panel(page);
  await expect(mission.locator(".pit-columns")).toContainText("WRB example: Gleysol");
  await shot(page, "c11-05-catena", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Can't tell from colour alone/ }).click();
  await expect(mission.locator(".feedback")).toContainText("Defensible");
  await shot(page, "c11-06-detective", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c11-m4: formation against erosion.
  mission = await panel(page);
  await mission.getByRole("radio", { name: "About a century to several centuries" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Work it out" }).click();
  await expect(mission.locator(".observation").first()).toContainText("130 years");
  await shot(page, "c11-07-rates", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Not on a human timescale/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("Chapter 11 · complete");
  expect(errors).toEqual([]);
});
