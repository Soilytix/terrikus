/**
 * Chapter 8 (T22): knock knock, slice the nodule and the nitrate off-switch on
 * the pea root; the root exchange, who has no partner, reach or release and
 * the forest-network claim sort in the cortex cell.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 150_000 });
  await page.waitForTimeout(700);
}

/** Open chapter 8 at a scene with the given missions already done. */
async function open(page: Page, scene: string, done: string[]) {
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "leaf", "c6", "c7", "c8"],
    chaptersComplete: ["prologue", "leaf", "c6", "c7"],
    missions: Object.fromEntries(done.map((id) => [id, { step: 0, done: true }])),
    flags: done.map((id) => `${id}-done`),
  };
  await page.addInitScript(
    ([k, v]) => !localStorage.getItem(k!) && localStorage.setItem(k!, v!),
    [SAVE_KEY, JSON.stringify(save)],
  );
  await page.goto(`./?static=1#/ch/c8/${scene}`);
  await settled(page);
}

async function openSheet(page: Page, project: string) {
  const mission = page.locator(".mission");
  if (project === "phone" && (await mission.getAttribute("data-open")) === "false")
    await mission.locator(".mission-toggle").click();
  return mission;
}

async function scanAll(page: Page, names: string[]) {
  for (const name of names) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
}

async function predict(mission: Locator, label: string) {
  await mission.getByRole("radio", { name: label }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
}

// Scenes paint slowly on a loaded runner under software GL.
test.describe.configure({ timeout: 600_000 });

test("chapter 8: knock knock, slice the nodule, the nitrate off-switch", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, "c8-nodule", []);
  await expect(page.getByRole("heading", { name: "Nodules on a pea root" })).toBeVisible();
  await shot(page, "c8-01-nodule", p);
  await scanAll(page, ["Curled root hair", "Pink nodule, sliced", "White nodule, sliced"]);
  const mission = await openSheet(page, p);
  await predict(mission, "The bean does not let them in");

  await mission.getByRole("radio", { name: "Pea rhizobia" }).check();
  await mission.getByRole("radio", { name: "Bush bean" }).check();
  await mission.getByRole("button", { name: "Knock", exact: true }).click();
  await expect(mission.getByText(/Refused: the root does not answer this signal/)).toBeVisible();
  await mission.getByRole("radio", { name: "Spinach" }).check();
  await mission.getByRole("button", { name: "Knock", exact: true }).click();
  await expect(mission.getByText(/No answer: this root forms no nodules/)).toBeVisible();
  await mission.getByRole("radio", { name: "Pea", exact: true }).check();
  await mission.getByRole("button", { name: "Knock", exact: true }).click();
  await expect(mission.getByText(/Let in: a nodule forms/)).toBeVisible();
  await mission.locator(".partners").scrollIntoViewIfNeeded();
  await shot(page, "c8-02-knock", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await mission.getByRole("button", { name: "Slice nodule A" }).click();
  await mission.getByRole("button", { name: "Slice nodule B" }).click();
  await expect(mission.getByText(/pink inside/)).toBeVisible();
  await expect(mission.getByText(/white inside/)).toBeVisible();
  await mission.locator(".nodule-slices").scrollIntoViewIfNeeded();
  await shot(page, "c8-03-slice", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await predict(mission, "Fewer nodules");
  await expect(mission.getByText("Teaching model: direction, not prediction.")).toBeVisible();
  await mission.getByRole("slider", { name: "Nitrate in the root zone" }).fill("4");
  await mission.locator(".partners").scrollIntoViewIfNeeded();
  await shot(page, "c8-04-nitrate", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /leaves the field in the harvested seed/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 8: the root exchange, who has no partner, reach or release, myth or evidence", async ({
  page,
}, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, "c8-arbuscule", ["c8-m3", "c8-m4", "c8-m5"]);
  await expect(page.getByRole("heading", { name: "An arbuscule in a cortex cell" })).toBeVisible();
  await shot(page, "c8-05-arbuscule", p);
  await scanAll(page, ["Arbuscule", "Hypha into the soil", "Cortex cells"]);
  const mission = await openSheet(page, p);
  await predict(mission, "The plant gets less for its carbon");

  for (const level of ["Medium", "High"]) await mission.getByRole("radio", { name: level }).check();
  await expect(mission.getByText("Trade ratio (derived): 0.0 P per 100 C paid")).toBeVisible();
  await mission.locator(".partners").scrollIntoViewIfNeeded();
  await shot(page, "c8-06-trade", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /It depends on the soil/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  for (const crop of ["pea", "bush bean", "spinach", "sugar beet"])
    await mission.getByRole("button", { name: `Look inside the ${crop} root` }).click();
  await expect(mission.locator("tr[data-key='spinach']")).toContainText("None foundNone found");
  await expect(mission.locator("tr[data-key='sugarbeet']")).toContainText("None foundNone found");
  await mission.locator(".partners").scrollIntoViewIfNeeded();
  await shot(page, "c8-07-survey", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /With its own roots/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await expect(mission.getByText(/No fungus colonises: spinach typically forms no mycorrhiza/)).toBeVisible();
  await mission.getByRole("radio", { name: "4.5" }).check();
  await mission.getByRole("radio", { name: "Pea" }).check();
  await mission.locator(".partners").scrollIntoViewIfNeeded();
  await shot(page, "c8-08-reach", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Phosphate binds and barely moves/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await expect(mission.locator(".open-question").getByText("Open question · evidence card")).toBeVisible();
  const sort = async (claim: RegExp, verdict: string) =>
    mission.getByRole("region", { name: claim }).getByRole("radio", { name: verdict, exact: true }).check();
  await sort(/Most forest trees partner/, "Supported");
  await sort(/Carbon moves between trees/, "Weakly supported");
  await sort(/Mother trees recognise their kin/, "Supported");
  await expect(mission.getByText(/Read the evidence card again/)).toBeVisible();
  await sort(/Mother trees recognise their kin/, "Unsupported");
  await mission.locator(".claim-sort").scrollIntoViewIfNeeded();
  await shot(page, "c8-09-claims", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});
