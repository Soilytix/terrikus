/**
 * Chapter 10 (T25): the disease triangle (present is not sick, enforced in the
 * chain verdict), the rotation wheel, the suppressive transfer and the
 * evidence ladder (each rung opens one bounded claim).
 */
import { expect, test, type Page } from "@playwright/test";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 150_000 });
  await page.waitForTimeout(700);
}

/** Open a chapter 10 scene with the given missions already done. */
async function open(page: Page, done: string[], scene = "c10-triangle") {
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "leaf", "c1", "c10"],
    chaptersComplete: ["prologue", "leaf", "c1"],
    missions: Object.fromEntries(done.map((id) => [id, { step: 0, done: true }])),
    flags: done.map((id) => `${id}-done`),
  };
  await page.addInitScript(
    ([k, v]) => !localStorage.getItem(k!) && localStorage.setItem(k!, v!),
    [SAVE_KEY, JSON.stringify(save)],
  );
  await page.goto(`./?static=1#/ch/c10/${scene}`);
  await settled(page);
}

async function openSheet(page: Page, project: string) {
  const mission = page.locator(".mission");
  if (project === "phone" && (await mission.getAttribute("data-open")) === "false")
    await mission.locator(".mission-toggle").click();
  return mission;
}

async function look(page: Page, names: string[]) {
  for (const name of names) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
}

const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  return errors;
};

test.describe.configure({ timeout: 600_000 });

test("chapter 10: the triangle; detection → disease is contradicted", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, []);
  await expect(page.getByRole("heading", { name: "Around a pea root" })).toBeVisible();
  await shot(page, "c10-01-triangle", p);
  await look(page, ["Pea root", "Water-mould threads", "Resting spores"]);
  const mission = await openSheet(page, p);
  await mission.getByRole("radio", { name: "Yes: the pathogen is there" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  // Host and pathogen on, dry spring: detected, healthy. Then wet: sick.
  await mission.getByRole("button", { name: "Grow a season" }).click();
  await expect(mission.getByText("healthy peas")).toBeVisible();
  await mission.getByLabel("Environment: wet spring").check();
  await mission.getByRole("button", { name: "Grow a season" }).click();
  await expect(mission.getByText("sick peas")).toBeVisible();
  await mission.locator(".disease").scrollIntoViewIfNeeded();
  await shot(page, "c10-02-toggles", p);
  await mission.getByRole("button", { name: "Continue" }).click();

  await mission.getByRole("button", { name: "Build the chain" }).click();
  const chain = page.locator(".chains");
  await chain.getByLabel("Card 1").selectOption({ label: "Pathogen DNA detected" });
  await chain.getByLabel("Link 1").selectOption({ label: "enables" });
  await chain.getByLabel("Fairly sure").check();
  await chain.getByRole("button", { name: "Confirm the chain" }).click();
  await expect(chain.getByText("Contradicted by your run", { exact: true })).toBeVisible();
  await expect(chain.getByText(/Present is not sick/)).toBeVisible();
  await shot(page, "c10-03-present-not-sick", p);
  await chain.getByLabel("Card 1").selectOption({ label: "Host + virulent pathogen + conducive weather" });
  await chain.getByRole("button", { name: "Confirm the chain" }).click();
  await expect(chain.getByText("Supported by your run", { exact: true })).toBeVisible();
  await chain.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 10: the rotation wheel and cover crops", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, ["c10-m1"]);
  await look(page, ["Nematode cyst", "Fungal knot (sclerotium)"]);
  const mission = await openSheet(page, p);
  await mission.getByRole("radio", { name: "The pea–bean field" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  for (const name of ["Six-year rotation", "Vetch cover", "Oat cover"])
    await mission.getByRole("radio", { name }).check({ force: true });
  await mission.getByRole("radio", { name: "Pea–bean every year" }).check({ force: true });
  await mission.getByRole("radio", { name: "No cover" }).check({ force: true });
  await mission.locator(".disease").scrollIntoViewIfNeeded();
  await shot(page, "c10-04-rotation", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "Yes: every cover crop is a risk" }).click();
  await expect(mission.getByText(/oat winters/)).toBeVisible();
  await mission.getByRole("radio", { name: /It depends/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Build the chain" }).click();
  const chain = page.locator(".chains");
  await chain.getByLabel("Link 1").selectOption({ label: "increases" });
  await chain.getByLabel("Link 2").selectOption({ label: "increases" });
  await chain.getByLabel("Sure", { exact: true }).check();
  await chain.getByRole("button", { name: "Confirm the chain" }).click();
  await expect(chain.getByText("Supported by your run", { exact: true })).toBeVisible();
  await chain.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 10: transfer the shield, then sterilise it", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, ["c10-m1", "c10-m2"], "c10-shield");
  await expect(page.getByRole("heading", { name: "The beet root's shield" })).toBeVisible();
  await shot(page, "c10-05-shield", p);
  await look(page, ["Film along the root (a hypothesis)", "Fungal threads"]);
  const mission = await openSheet(page, p);
  await mission.getByRole("radio", { name: "Fewer seedlings get sick" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  for (const row of ["Conducive + 1 % suppressive", "Suppressive soil, sterilised"])
    await mission.getByRole("row", { name: row }).getByRole("button", { name: "Run this pot" }).click();
  await mission.locator(".disease").scrollIntoViewIfNeeded();
  await shot(page, "c10-06-pots", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /the pathogen was killed/ }).click();
  await mission.getByRole("radio", { name: /The suppression is alive/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Specific/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 10: the evidence ladder opens one bounded claim per rung", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, ["c10-m1", "c10-m2", "c10-m3"], "c10-shield");
  const mission = await openSheet(page, p);
  await mission.getByRole("button", { name: /Rhizoctonia DNA is in the soil/ }).click();
  await expect(mission.getByText(/Present is not sick/)).toBeVisible();
  await expect(mission.getByText("Claim unlocked")).toHaveCount(0);
  for (let k = 1; k <= 6; k++) {
    await mission.getByRole("button", { name: /Collect the evidence/ }).click();
    await expect(mission.getByText("Claim unlocked")).toHaveCount(k);
  }
  await mission.locator(".ladder-rungs").scrollIntoViewIfNeeded();
  await shot(page, "c10-07-ladder", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(
    page.getByRole("button", { name: "Look at: Film along the root (evidence in hand)" }),
  ).toBeAttached();
  expect(errors).toEqual([]);
});
