import { expect, test, type Page } from "@playwright/test";
import { MISSIONS } from "../src/content";
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

test("play chapter 4: the redox elevator, airless crumbs and draining the paddy", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done and the paddy glimpsed on the map: chapter 4 is open (WB§1).
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf", "c4"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    rumors: { "r-c4": "glimpsed" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await page.getByRole("button", { name: "Go: Rice paddy" }).click();
  await expect(page.getByRole("heading", { name: "The rice paddy", exact: true })).toBeVisible();
  await settled(page);
  await shot(page, "c4-01-paddy", p);

  // c4-m1: look around, predict, ride the elevator in ladder order.
  for (const name of ["Rice plants", "Bubbles in the water", "The smell of the mud"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  let mission = await panel(page);
  await mission.getByRole("radio", { name: /breathe something other than oxygen/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Go: Down into the flooded soil" }).click();
  await expect(page.getByRole("heading", { name: "The redox elevator", exact: true })).toBeVisible();
  await settled(page);
  mission = await panel(page);
  // Out of order is refused, with a reason.
  await mission.getByRole("button", { name: "Fe(III)", exact: true }).click();
  await expect(mission.locator(".hint")).toContainText("waits its turn");
  for (const name of ["O₂", "NO₃⁻", "Mn(IV)", "Fe(III)", "SO₄²⁻"])
    await mission.getByRole("button", { name, exact: true }).click();
  await shot(page, "c4-02-elevator", p);
  await mission.getByRole("button", { name: "CO₂", exact: true }).click();
  await expect(mission.locator(".elevator li")).toHaveCount(6);
  await mission.getByRole("button", { name: "Continue" }).click();
  mission = await panel(page);
  await mission.getByRole("radio", { name: /Sulfate reducers make the smell/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  // Away from the mission's home scene, a phone folds the sheet at each step.
  mission = await panel(page);
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c4-m2: airless pockets in crumbs.
  mission = await panel(page);
  await mission.getByRole("radio", { name: /inside larger crumbs/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "Moist, drained" }).click();
  await mission.getByRole("radio", { name: /Large crumb/ }).click();
  await expect(mission.locator(".observation").first()).toContainText("of this crumb has none");
  await mission.getByRole("radio", { name: "Flooded" }).click();
  await shot(page, "c4-03-microsites", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /How far oxygen gets/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c4-m3: back up to the paddy; both curves, no verdict.
  await page.locator(".up-btn").click();
  await expect(page.getByRole("heading", { name: "The rice paddy", exact: true })).toBeVisible();
  await settled(page);
  mission = await panel(page);
  await mission.getByRole("radio", { name: /Methane falls/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Run the season both ways" }).click();
  await expect(mission.getByText("Methane made per day")).toBeVisible();
  await expect(mission.getByText("Nitrous oxide lost per day")).toBeVisible();
  await expect(mission).not.toContainText(/score|CO₂-eq|winner/i);
  await shot(page, "c4-04-drain", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "It depends on what you value and measure" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("Chapter 4 · complete");
  expect(errors).toEqual([]);
});
