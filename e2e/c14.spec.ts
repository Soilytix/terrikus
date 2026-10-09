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

test("play chapter 14: the lab, the jar, five layers, the claim budget and an honest report", async ({
  page,
}, info) => {
  test.setTimeout(600_000);
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Four chapters besides the prologue done: chapter 14 is open, no rumor needed (WB§1).
  const before = ["prologue", "c1", "leaf", "c3", "c5"];
  await loadChapters(before);
  const done = MISSIONS.filter((m) => before.includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: [...before, "c14"],
    chaptersComplete: before,
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    rumors: { "r-c14": "glimpsed" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./#/ch/valley/valley-map");
  await settled(page);
  await page.getByRole("button", { name: "Go: The farm lab" }).click();
  await expect(page.getByRole("heading", { name: "The lab bench", level: 1 })).toBeVisible();
  await settled(page);
  await shot(page, "c14-01-bench", p);

  // c14-m1: look at each station, then send a sample through with and without free DNA.
  let mission = await panel(page);
  await mission.getByRole("button", { name: "Continue" }).click();
  for (const name of ["Soil cores", "The sieve", "Extraction tubes", "The PCR block", "The sequencer"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  mission = await panel(page);
  await mission.getByRole("button", { name: "Run the sample" }).click();
  await mission.getByRole("radio", { name: "removed first" }).check();
  await mission.getByRole("button", { name: "Run the sample" }).click();
  await expect(mission.locator('tr[data-relic="remove"]')).toContainText("not detected");
  await shot(page, "c14-02-pipeline", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Not necessarily/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c14-m2: the squeezing jar; the spike-in says which way each group moved.
  mission = await panel(page);
  await mission.getByRole("radio", { name: /The shares alone cannot tell/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await expect(mission.getByText("cannot tell without a spike-in").first()).toBeVisible();
  await mission.getByRole("radio", { name: "known amount added" }).check();
  await expect(mission.locator('tr[data-taxon="spore"]')).toContainText("↓ down");
  await shot(page, "c14-03-jar", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /The other groups fell further/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c14-m3: twelve statements into five layers.
  mission = await panel(page);
  const layer = (statement: RegExp, name: string) =>
    mission.getByRole("region", { name: statement }).getByRole("radio", { name }).check();
  await layer(/^pH 6.4/, "Measurement");
  await layer(/^20,000 reads/, "Measurement");
  await layer(/^1.2 mg/, "Measurement");
  await layer(/^Spore-former gene copies/, "Derived");
  await layer(/^Carbon stock/, "Derived");
  await layer(/top quarter of fields/, "Derived");
  await layer(/suggests the community/, "Interpretation");
  await layer(/most likely means/, "Interpretation");
  await layer(/function-prediction tool/, "Prediction");
  await layer(/A model expects/, "Prediction");
  await layer(/^Sample again/, "Recommendation");
  await layer(/^Leave the residue/, "Recommendation");
  await shot(page, "c14-04-layers", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Where the field sits/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c14-m4: the claim budget; an overclaim is named.
  mission = await panel(page);
  await mission.getByRole("radio", { name: /more of the group per gram/ }).check();
  await expect(mission.locator(".overclaim")).toContainText("Overclaim");
  await shot(page, "c14-05-budget", p);
  await mission.getByRole("radio", { name: /DNA is in this sample/ }).check();
  await mission.getByRole("button", { name: "Next case" }).click();
  await mission.getByRole("radio", { name: /more of the group per gram/ }).check();
  await mission.getByRole("button", { name: "Next case" }).click();
  await mission.getByRole("radio", { name: /In a controlled test/ }).check();
  await mission.getByRole("button", { name: "Done", exact: true }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // c14-m5: two reports disagree, then an honest report, block by block.
  mission = await panel(page);
  await mission.getByRole("button", { name: "How was Report A measured?" }).click();
  await mission.getByRole("button", { name: "How was Report B measured?" }).click();
  await shot(page, "c14-06-reports", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /different depths/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  const place = mission.getByRole("button", { name: "Place in the report" });
  const fill = async (...names: RegExp[]) => {
    for (const name of names) await mission.getByRole("radio", { name }).check();
    await place.click();
  };
  await mission
    .getByRole("radio", { name: /^The same field before the drought, by the same method/ })
    .check();
  await mission.getByRole("radio", { name: /^Moderate: five pooled cores/ }).check();
  await mission.getByRole("radio", { name: "Lab result" }).check();
  await expect(place).toBeDisabled();
  await fill(/^Five cores/);
  await fill(/with the same spike/, /^Moderate for the direction/, /^Known spike added/);
  await fill(/^Read against the share/, /^Low to moderate/, /^Inferred from the two blocks/);
  await mission.getByRole("radio", { name: /own count before/ }).check();
  await mission.getByRole("radio", { name: /^Not yet known/ }).check();
  await mission.getByRole("radio", { name: /^Proposed next step/ }).check();
  await mission.locator(".report-mock").scrollIntoViewIfNeeded();
  await shot(page, "c14-07-report", p);
  await place.click();
  await expect(mission.locator(".report-block")).toHaveCount(4);
  await expect(mission.locator(".report-mock")).toContainText("Teaching mock-up");
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await expect(page.locator(".mission")).toContainText("· complete");
  expect(errors).toEqual([]);
});
