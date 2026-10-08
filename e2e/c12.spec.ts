import { expect, test, type Page } from "@playwright/test";
import { MISSIONS } from "../src/content";
import { loadChapters } from "../src/content/load";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 60_000 });
  await page.waitForTimeout(700);
}

/** Phones fold the sheet for steps played in the world; unfold it to use the panel. */
async function panel(page: Page) {
  const toggle = page.locator(".mission-toggle");
  if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
  return page.locator(".mission");
}

test("play chapter 12: twin fields, the context flip, depth, heavy wheels and a shared cause", async ({
  page,
}, info) => {
  test.setTimeout(300_000);
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done and the two fields glimpsed on the map: chapter 12 is open (WB§1).
  await loadChapters(["prologue", "c1", "leaf"]);
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf", "c12"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    rumors: { "r-c12": "glimpsed" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await page.getByRole("button", { name: "Go: Two neighbouring fields" }).click();
  await expect(page.getByRole("heading", { name: "Twin fields", level: 1 })).toBeVisible();
  await settled(page);
  await shot(page, "c12-01-fields", p);

  // c12-m1: one turn of the season wheel, then change one practice.
  let mission = await panel(page);
  for (let i = 0; i < 5; i++) await mission.getByRole("button", { name: /^Next:/ }).click();
  await expect(mission.locator(".season")).toContainText("Spread manure on wet ground");
  await shot(page, "c12-02-season", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "reduced" }).check();
  await mission.getByRole("radio", { name: "grass" }).check();
  await expect(mission.getByRole("button", { name: "Run ten years" })).toBeDisabled();
  await mission.getByRole("radio", { name: "none" }).check();
  await mission.getByRole("button", { name: "Run ten years" }).click();
  await expect(mission.locator(".twin table")).toContainText("Aggregate index");
  await shot(page, "c12-03-twin", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /So any difference/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c12-m2: the same change flips sign between a dry and a humid field.
  mission = await panel(page);
  await mission.getByRole("radio", { name: "It depends on the field" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Dry, sand" }).click();
  await mission.getByRole("button", { name: "Humid, clay" }).click();
  await expect(mission.locator('.flip tr[data-sign="1"]')).toHaveCount(1);
  await expect(mission.locator('.flip tr[data-sign="-1"]')).toHaveCount(1);
  await shot(page, "c12-04-flip", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /In a dry climate/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c12-m3: shallow against whole-profile carbon, then the contested cover-crop pair.
  mission = await panel(page);
  await mission.getByRole("radio", { name: "top 10 cm" }).check();
  await mission.getByRole("radio", { name: "whole profile to 60 cm" }).check();
  await shot(page, "c12-05-depth", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await expect(mission.locator(".open-question")).toContainText("0.32 ± 0.08");
  await expect(mission.locator(".open-question")).toContainText("Chaplot & Smith 2023");
  const sort = async (claim: RegExp, verdict: string) =>
    mission.getByRole("region", { name: claim }).getByRole("radio", { name: verdict, exact: true }).check();
  await sort(/always store/, "Unsupported");
  await sort(/how much is contested/, "Supported");
  await sort(/No-till sequesters/, "Weakly supported");
  await shot(page, "c12-06-claims", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Carbon and bulk density/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c12-m4: under a wheel track; wet soil ponds, dry soil does not.
  await page.getByRole("button", { name: "Go: Down to a wheel track" }).click();
  await expect(page.getByRole("heading", { name: "Under the wheel", level: 1 })).toBeVisible();
  await settled(page);
  await shot(page, "c12-07-wheel-scene", p);
  mission = await panel(page);
  for (const wet of ["dry", "wet"]) {
    await mission.getByRole("radio", { name: wet, exact: true }).check();
    await mission.getByRole("button", { name: "Drive the wheel" }).click();
    await mission.getByRole("button", { name: "Let it rain" }).click();
  }
  await expect(mission.locator(".wheel .observation").first()).toContainText("water ponds");
  await shot(page, "c12-08-wheel", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /It may loosen the pan/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c12-m5: same seed, two fields; only drainage explains the low-yield zones.
  await page.getByRole("button", { name: "Go: Back up to the fields" }).click();
  await expect(page.getByRole("heading", { name: "Twin fields", level: 1 })).toBeVisible();
  await settled(page);
  mission = await panel(page);
  await mission.getByRole("button", { name: "Group the zones by drainage" }).click();
  await expect(mission.locator(".same-seed table")).toContainText("Poorly drained");
  await shot(page, "c12-09-same-seed", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /The microbes behind the signal/ }).click();
  await expect(mission.getByRole("button", { name: "Continue" })).toHaveCount(0);
  await mission.getByRole("radio", { name: /Drainage:/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /The water table in every zone/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("Chapter 12 · complete");
  expect(errors).toEqual([]);
});
