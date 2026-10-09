import { expect, test, type Page } from "@playwright/test";
import { MISSIONS } from "../src/content";
import { loadChapters } from "../src/content/load";
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

test("play chapter 3: drain the cave, stranded, the Birch pulse and fast lanes", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done and the dry patch glimpsed on the map: chapter 3 is open (WB§1).
  await loadChapters(["prologue", "c1", "leaf"]);
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf", "c3"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    rumors: { "r-c3": "glimpsed" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await page.getByRole("button", { name: "Go: A dry patch after rain" }).click();
  await expect(page.getByRole("heading", { name: "The draining cave" })).toBeVisible();
  await settled(page);

  // c3-m1: predict, pull the water, explain field capacity.
  let mission = await panel(page);
  await mission.getByRole("radio", { name: "The widest ones" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  const slider = mission.getByRole("slider");
  await slider.fill("4");
  await expect(mission.locator(".observation")).toContainText(
    "At −33 kPa, pores wider than about 9 µm have drained",
  );
  await expect(mission.locator(".observation")).toContainText("a convention, not a constant");
  await shot(page, "c3-01-drain", p);
  await slider.fill("7");
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /No: the wide pores have drained/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c3-m2: the short road strands the amoeba; the corner films get it there.
  mission = await panel(page);
  await mission.getByRole("button", { name: "Wide pore" }).click();
  await mission.getByRole("button", { name: "Bacteria to eat" }).click();
  await expect(mission.locator(".observation")).toContainText("you are stranded");
  await mission.getByRole("button", { name: "Rewet and start again" }).click();
  for (const name of ["Corner film, near", "Corner film, far", "Bacteria to eat"])
    await mission.getByRole("button", { name }).click();
  await expect(mission.locator(".observation").first()).toContainText("You reached the bacteria");
  await shot(page, "c3-02-stranded", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Wide pores drain first/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c3-m3: the Birch pulse, its sources left unresolved.
  mission = await panel(page);
  await mission.getByRole("radio", { name: /A burst well above/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Dry it, then wet it" }).click();
  await expect(mission.locator(".attribution")).toContainText("unresolved");
  await shot(page, "c3-03-birch", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "Several sources, not yet separable" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c3-m4: up to the profile in the rain.
  await page.getByRole("button", { name: "Go: Up to the field in the rain" }).click();
  await expect(page.getByRole("heading", { name: "Rain on the profile" })).toBeVisible();
  await settled(page);
  await shot(page, "c3-04-rain-profile", p);
  mission = await panel(page);
  await mission.getByRole("radio", { name: "With burrows" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Rain for an hour" }).click();
  await expect(mission.getByText("60 min of rain")).toBeVisible({ timeout: 10_000 });
  await shot(page, "c3-05-fast-lanes", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /It ran down the burrows/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("· complete");
  expect(errors).toEqual([]);
});
