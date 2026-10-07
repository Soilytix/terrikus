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

test("play chapter 5: musical chairs, leaky nitrate and the pH predictor", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done: the map is open, and chapter 5 opens from its rumor (WB§1).
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await page.getByRole("button", { name: "Glimpse: The acid woodland edge" }).click();
  await expect(page.locator(".scan-card")).toContainText("Charged Surfaces");
  await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Go: A clay platelet at the woodland edge" }).click();
  await expect(page.getByRole("heading", { name: "A charged landscape" })).toBeVisible();
  await settled(page);
  await shot(page, "c5-01-platelet", p);

  // c5-m1: scan, predict, seat cations, add acid.
  for (const name of ["2:1 clay (smectite)", "1:1 clay (kaolinite)", "Calcium on the surface"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  let mission = await panel(page);
  await mission.getByRole("radio", { name: "Potassium (K⁺)" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  for (const ion of ["Ca²⁺", "Ca²⁺", "Mg²⁺", "K⁺", "K⁺"])
    await mission.getByRole("button", { name: `Seat ${ion}` }).click();
  await mission.getByRole("button", { name: "Add acid (2 H⁺)" }).click();
  await expect(mission.locator(".exchange-log")).toContainText("2 K⁺");
  await mission.getByRole("button", { name: "Add acid (2 H⁺)" }).click();
  await expect(mission.locator(".exchange-log")).toContainText("1 Mg²⁺");
  await mission.getByRole("button", { name: "Rain" }).click();
  await shot(page, "c5-02-musical-chairs", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /two positive charges/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c5-m2: the anion leaves, the cation stays.
  mission = await panel(page);
  await mission.getByRole("radio", { name: "Nitrate" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: /Add fertiliser/ }).click();
  await mission.getByRole("button", { name: "Rain" }).click();
  await mission.getByRole("button", { name: "Rain" }).click();
  const row = (ion: string) =>
    mission.locator(".run-table tr", { has: page.getByRole("rowheader", { name: ion }) });
  await expect(row("NO₃⁻").locator("td").nth(2)).toHaveText("3");
  await expect(row("NH₄⁺").locator("td").nth(0)).toHaveText("4");
  await expect(row("NH₄⁺").locator("td").nth(2)).toHaveText("0");
  await shot(page, "c5-03-leaky-nitrate", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /It is positive/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c5-m3: the dial, then association is not yet cause.
  mission = await panel(page);
  const dial = mission.getByRole("slider", { name: /Soil pH/ });
  await dial.fill("4.6");
  await expect(mission.locator(".ph-al")).toBeVisible();
  await shot(page, "c5-04-ph-dial", p);
  await dial.fill("8");
  await expect(mission.locator(".ph-al")).toBeHidden();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /No: the best pH differs/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /strong, replicated association/ }).click();
  await expect(mission.locator(".feedback li[data-ok='true']")).toBeVisible();
  await shot(page, "c5-05-ph-predictor", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /inside one field/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("Chapter 5 · complete");
  expect(errors).toEqual([]);
});
