/**
 * Chapter 9 (T23): hand the nitrogen baton, straw against beet tops, the leak
 * hunt, gene ≠ rate (no claim before a second measurement) and the straw bench.
 */
import { expect, test, type Page } from "@playwright/test";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 150_000 });
  await page.waitForTimeout(700);
}

/** Open chapter 9 with the given missions already done. */
async function open(page: Page, done: string[]) {
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "leaf", "c1", "c9"],
    chaptersComplete: ["prologue", "leaf", "c1"],
    missions: Object.fromEntries(done.map((id) => [id, { step: 0, done: true }])),
    flags: done.map((id) => `${id}-done`),
  };
  await page.addInitScript(
    ([k, v]) => !localStorage.getItem(k!) && localStorage.setItem(k!, v!),
    [SAVE_KEY, JSON.stringify(save)],
  );
  await page.goto(`./?static=1#/ch/c9/c9-relay`);
  await settled(page);
}

async function openSheet(page: Page, project: string) {
  const mission = page.locator(".mission");
  if (project === "phone" && (await mission.getAttribute("data-open")) === "false")
    await mission.locator(".mission-toggle").click();
  return mission;
}

const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  return errors;
};

test.describe.configure({ timeout: 600_000 });

test("chapter 9: hand the nitrogen baton; the ledger accounts for every unit", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, []);
  await expect(page.getByRole("heading", { name: "Under the beet field" })).toBeVisible();
  await shot(page, "c9-01-relay", p);
  for (const name of [
    "Ploughed-in straw",
    "Decomposers on the straw",
    "Ammonia oxidisers",
    "Sugar beet taproot",
  ]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  const mission = await openSheet(page, p);
  // A misplaced handoff shows its explanation card.
  await mission.getByRole("radio", { name: "Ammonia oxidisers" }).click();
  await expect(mission.getByText("Misplaced handoff.")).toBeVisible();
  await mission.locator(".explain-card").scrollIntoViewIfNeeded();
  await shot(page, "c9-02-misplaced", p);
  for (const name of [
    "Decomposers",
    "Ammonia-oxidising archaea and bacteria",
    /comammox Nitrospira running both legs/,
    "The beet root takes it up",
  ]) {
    await mission.getByRole("radio", { name }).click();
    await mission.getByRole("button", { name: "Hand on the baton" }).click();
  }
  await expect(mission.getByText("Teaching model: direction, not prediction.")).toBeVisible();
  await expect(mission.getByText("N accounted for: 100.0 %")).toBeVisible();
  await mission.getByRole("slider", { name: "Day" }).fill("120");
  await expect(mission.getByText("N accounted for: 100.0 %")).toBeVisible();
  await mission.locator(".relay-season").scrollIntoViewIfNeeded();
  await shot(page, "c9-03-relay-season", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /small mineral pool/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 9: straw dips the beet's nitrogen, then the leak hunt", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, ["c9-m1"]);
  const mission = await openSheet(page, p);
  await mission.getByRole("radio", { name: "It falls for a while" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("slider", { name: "Day" }).fill("60");
  await expect(mission.getByText("N accounted for: 100.0 %")).toBeVisible();
  await mission.locator(".straw-run").scrollIntoViewIfNeeded();
  await shot(page, "c9-04-straw-run", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /take it from the soil/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Borrowed/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  for (const name of ["Field drain", "Waterlogged crumb", "Air above the straw"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  await mission.getByRole("checkbox", { name: "Nitrogen taken into microbes" }).click();
  for (const name of ["Nitrate to the drain", /N₂O and N₂/, "NH₃ from the surface"])
    await mission.getByRole("checkbox", { name }).click();
  await expect(mission.getByText("Leaks found: 3 of 3")).toBeVisible();
  await mission.locator(".leak-table").scrollIntoViewIfNeeded();
  await shot(page, "c9-05-leak-hunt", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Roots took nitrate up/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 9: gene ≠ rate needs a second measurement before a claim", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await open(page, ["c9-m1", "c9-m2", "c9-m3"]);
  const mission = await openSheet(page, p);
  const claim = mission.getByRole("radio", { name: /potential is there/ });
  await expect(claim).toBeDisabled();
  await mission.getByRole("button", { name: "A second qPCR on another core" }).click();
  await expect(claim).toBeDisabled();
  await mission.getByRole("button", { name: "Nitrate production in a 7-day incubation" }).click();
  await expect(claim).toBeEnabled();
  await mission.getByRole("radio", { name: /genes are abundant/ }).click();
  await claim.click();
  await mission
    .getByRole("table", { name: "Nitrate production in a 7-day incubation" })
    .scrollIntoViewIfNeeded();
  await shot(page, "c9-06-gene-rate", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 9: the straw bench", async ({ page }, info) => {
  const p = info.project.name;
  const errors = errorsOf(page);
  await page.goto(`./?static=1#/bench/straw-n`);
  await expect(page.getByRole("heading", { name: "The nitrogen relay" })).toBeVisible();
  await page.getByRole("radio", { name: "heavy (waterlogged)" }).check({ force: true });
  await expect(page.getByText("N accounted for: 100.0 %")).toBeVisible();
  await shot(page, "c9-07-bench", p);
  expect(errors).toEqual([]);
});
