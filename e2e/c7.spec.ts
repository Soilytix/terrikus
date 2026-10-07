/**
 * Chapter 7 (T21): follow the root inputs with the exudation share as a band,
 * bare versus planted, and home or away with a spike-in.
 */
import { expect, test, type Page } from "@playwright/test";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 150_000 });
  await page.waitForTimeout(700);
}

/** Open chapter 7 with the given missions already done. */
async function open(page: Page, done: string[]) {
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "leaf", "c6", "c7"],
    chaptersComplete: ["prologue", "leaf", "c6"],
    missions: Object.fromEntries(done.map((id) => [id, { step: 0, done: true }])),
    flags: done.map((id) => `${id}-done`),
  };
  await page.addInitScript(
    ([k, v]) => !localStorage.getItem(k!) && localStorage.setItem(k!, v!),
    [SAVE_KEY, JSON.stringify(save)],
  );
  await page.goto(`./?static=1#/ch/c7/c7-root-tip`);
  await settled(page);
}

async function openSheet(page: Page, project: string) {
  const mission = page.locator(".mission");
  if (project === "phone" && (await mission.getAttribute("data-open")) === "false")
    await mission.locator(".mission-toggle").click();
  return mission;
}

// Scenes paint slowly on a loaded runner under software GL.
test.describe.configure({ timeout: 600_000 });

test("chapter 7: follow the root inputs, the share shown as a band", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, []);
  await expect(page.getByRole("heading", { name: "At the root tip" })).toBeVisible();
  await shot(page, "c7-01-root-tip", p);
  for (const name of ["Root tip", "Exudate halos", "Bacteria near the root", "Amoeba"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  const mission = await openSheet(page, p);
  await mission.getByRole("radio", { name: "In microbes, their grazers and the air" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();

  await expect(mission.getByText("Teaching model: direction, not prediction.")).toBeVisible();
  await expect(mission.getByRole("img", { name: /somewhere in 5–21 %, contested/ })).toBeVisible();
  await mission.getByRole("slider", { name: "Day" }).fill("12");
  await expect(mission.getByText("C accounted for: 100.0 % · N accounted for: 100.0 %")).toBeVisible();
  await mission.locator(".root-inputs").scrollIntoViewIfNeeded();
  await shot(page, "c7-02-root-inputs", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /only once grazers ate the bacteria/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 7: bare versus planted, then home or away", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, ["c7-m1"]);
  const mission = await openSheet(page, p);
  await mission.getByRole("radio", { name: "The planted plot" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Run both plots" }).click();
  await expect(mission.getByRole("columnheader", { name: "Planted (5–21 % exuded)" })).toBeVisible();
  await mission.locator(".ripple").scrollIntoViewIfNeeded();
  await shot(page, "c7-03-bare-planted", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  const caption = mission.getByText("Relative, not absolute; presence ≠ activity.");
  await expect(caption).toBeVisible();
  await mission.getByRole("radio", { name: "Yes, fungi avoid the root" }).click();
  await mission.getByRole("radio", { name: "Cannot tell from shares alone" }).click();
  await mission.getByRole("button", { name: "Add a spike-in (absolute count)" }).click();
  await expect(caption).toBeVisible();
  await mission.locator(".jar").scrollIntoViewIfNeeded();
  await shot(page, "c7-04-home-away", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});
