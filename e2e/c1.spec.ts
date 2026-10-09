import { expect, test, type Page } from "@playwright/test";
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

test("play chapter 1: feel test, labyrinth, slake and crumb", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Start with the prologue done, so chapter 1 is open.
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf"],
    chaptersComplete: ["prologue"],
    missions: { "p-m1": { step: 6, done: true }, "p-m2": { step: 3, done: true } },
    flags: ["p-m1-done", "p-m2-done"],
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley");
  await settled(page);
  await page.getByRole("button", { name: "Go: A crumb of the spinach field" }).click();
  await expect(page.getByRole("heading", { name: "The grain ruler" })).toBeVisible();
  await settled(page);
  await shot(page, "c1-01-grain-ruler", p);

  // c1-m1: scan, feel, explain, discover.
  for (const name of ["Sand", "Silt", "Clay"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  let mission = await panel(page);
  for (const [act, branch] of [
    ["Squeeze it in your palm", "Yes"],
    ["Push it into a ribbon", "Yes"],
    ["Let the ribbon hang until it breaks", "Under 2.5 cm"],
    ["Rub a wet pinch in your palm", "Neither"],
  ] as const) {
    await mission.getByRole("button", { name: act }).click();
    await mission.getByRole("button", { name: branch, exact: true }).click();
  }
  await expect(mission.getByText("Texture class:")).toContainText("Loam");
  await shot(page, "c1-02-feel-test", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /No: ploughing changes/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c1-m2: down into the labyrinth as the amoeba.
  await page.getByRole("button", { name: "Go: Cut open a crumb" }).click();
  await expect(page.getByRole("heading", { name: "Inside a crumb" })).toBeVisible();
  await settled(page);
  await shot(page, "c1-03-aggregate-cut", p);
  await page.getByRole("button", { name: /Go: Into the pore network/ }).click();
  await expect(page.getByRole("heading", { name: "The pore labyrinth" })).toBeVisible();
  await settled(page);
  mission = await panel(page);
  const status = mission.locator(".labyrinth .observation");
  await mission.getByRole("button", { name: "Colony in a narrow pore" }).click();
  await expect(status).toContainText("narrower than your body");
  await mission.getByRole("button", { name: "Colony across the neck" }).click();
  await expect(status).toContainText("No connected water film");
  await mission.getByRole("button", { name: "Colony in a wide pore" }).click();
  await expect(status).toContainText("You followed the films", { timeout: 5_000 });
  await mission.getByRole("radio", { name: "Wet" }).check({ force: true });
  await mission.getByRole("button", { name: "Colony across the neck" }).click();
  await expect(status).toContainText("You followed the films", { timeout: 5_000 });
  await shot(page, "c1-04-labyrinth", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /The narrow pore/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Run the week" }).click();
  await shot(page, "c1-05-grazer-week", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "The grazer could not get in" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c1-m3 and c1-m4 start inside the crumb.
  await page.goto("./#/ch/c1/c1-aggregate-cut");
  await settled(page);
  mission = await panel(page);
  await mission.getByRole("radio", { name: "The ploughed one" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Lower both into water" }).click();
  await expect(mission.getByText("5 min in water")).toBeVisible({ timeout: 10_000 });
  await shot(page, "c1-06-slake", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Roots, fungal threads/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await mission.getByRole("button", { name: "Build the crumb" }).click();
  await mission.getByRole("button", { name: "Till, then wait a season" }).click();
  await expect(mission.locator(".crumb-state")).toContainText("Clay–organic bonds");
  await shot(page, "c1-07-crumb", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Clay–organic bonds inside/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("· complete");
  expect(errors).toEqual([]);
});
