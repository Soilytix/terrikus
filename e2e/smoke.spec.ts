import { expect, test, type Page } from "@playwright/test";
import { bundledAssets } from "../src/assets/manifest";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

/** Wait until the scene has painted and the hotspots are live. */
async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
  await page.waitForTimeout(700);
}

test("play the prologue and the first chapter-2 mission", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Terrikus" })).toBeVisible();
  await settled(page);
  await shot(page, "01-title", p);

  await page.getByRole("button", { name: /Begin in the spinach field/ }).click();
  await expect(page.getByRole("heading", { name: "The spinach field at dawn" })).toBeVisible();
  await settled(page);
  await shot(page, "02-field", p);

  await page.getByRole("button", { name: "Go: Pick up a handful" }).click();
  await expect(page.getByRole("heading", { name: "A handful", exact: true })).toBeVisible();
  await settled(page);
  const mission = page.locator(".mission");
  await mission.getByRole("button", { name: "Look closer" }).click();
  await mission.getByRole("slider").fill("70");
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Separate the handful" }).click();
  await page.waitForTimeout(1400);
  await shot(page, "03-handful-observe", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "Water and air, in the gaps" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("slider").fill("40");
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Build the chain" }).click();
  const chain = page.getByRole("dialog", { name: "Water and air" });
  await chain.getByRole("combobox", { name: "Link 1" }).selectOption("decreases");
  await chain.getByRole("radio", { name: "Fairly sure" }).check();
  await chain.getByRole("button", { name: "Confirm the chain" }).click();
  await expect(chain.getByText("Supported by your run", { exact: true })).toBeVisible();
  await shot(page, "03b-chain", p);
  await chain.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await page.getByRole("button", { name: /Go: Zoom into a pore/ }).click();
  await expect(page.getByRole("heading", { name: "Inside a pore" })).toBeVisible();
  await settled(page);
  await shot(page, "04-pore", p);
  for (const name of ["Bacterium", "Naked amoeba", "Fungal thread"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    if (name === "Naked amoeba") {
      await page.waitForTimeout(600);
      await shot(page, "05-pore-scan", p);
    }
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  await mission.getByRole("button", { name: "Keep the question" }).click();
  await expect(mission.getByText("Back to the valley")).toBeVisible();

  await mission.getByRole("button", { name: "Back to the valley" }).click();
  await expect(page.getByRole("heading", { name: "The valley" })).toBeVisible();
  await settled(page);
  await shot(page, "06-valley", p);
  await page.getByRole("button", { name: "Go: The hedge at the field edge" }).click();
  await expect(page.getByRole("heading", { name: "The hedge at the field edge" })).toBeVisible();
  await settled(page);
  await shot(page, "07-hedge", p);

  await mission.getByRole("button", { name: "Make a prediction" }).click();
  await mission.getByRole("checkbox", { name: "Into the air" }).click();
  await mission.getByRole("checkbox", { name: "Into living things" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Start eating" }).click();
  const dialog = page.getByRole("dialog", { name: "Be the decomposer" });
  for (let i = 0; i < 14 && !(await dialog.getByText("Now let the world do it").isVisible()); i++) {
    await dialog.getByRole("button", { name: "Into my body" }).click();
    if (await dialog.getByText(/Not yet|cannot keep more/).isVisible())
      await dialog.getByRole("button", { name: "Breathe it out" }).click();
  }
  await shot(page, "08-decompose", p);
  await dialog.getByRole("button", { name: "Now let the world do it" }).click();
  await mission.getByRole("button", { name: "Open the lab bench" }).click();
  await expect(page.getByRole("heading", { name: "Leaf in a jar" })).toBeVisible();
  await page.getByRole("button", { name: "Run one year" }).click();
  await expect(page.getByText("The year is in your lab book.")).toBeVisible({ timeout: 20_000 });
  await shot(page, "09-bench", p);
  await page.getByRole("button", { name: "Take the result back to the field" }).click();
  await settled(page);
  await mission.getByRole("radio", { name: "Out of the jar as CO₂" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  // On a phone the mission sheet covers the lower scene: fold it first, as a player would.
  if (p === "phone") await mission.locator(".mission-toggle").click();
  await page.getByRole("button", { name: "Go: Kneel down to the litter (5 cm)" }).click();
  await expect(page.getByRole("heading", { name: "The litter layer" })).toBeVisible();
  await settled(page);
  await shot(page, "10-litter", p);
  await page.getByRole("button", { name: /Go: Zoom into a pore beside a fragment/ }).click();
  await expect(page.getByRole("heading", { name: "Beside a leaf fragment" })).toBeVisible();
  await settled(page);
  await shot(page, "11-aggregate", p);

  await page.keyboard.press("n");
  const nb = page.getByRole("dialog", { name: "Field notebook" });
  await expect(nb).toBeVisible();
  await nb.getByRole("tab", { name: "Field cards" }).click();
  await shot(page, "12-notebook-cards", p);
  await nb.getByRole("tab", { name: "Codex" }).click();
  await shot(page, "13-notebook-codex", p);

  // Reload: progress survives.
  await page.goto("./");
  await expect(page.getByRole("button", { name: /Continue:/ })).toBeVisible();

  expect(errors).toEqual([]);
});

test("static plates work without WebGL motion", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await page.goto("./?static=1#/ch/prologue/p-pore");
  await settled(page);
  await expect(page.locator(".world-plate")).toBeVisible();
  await shot(page, "14-static-pore", info.project.name);
  expect(errors).toEqual([]);
});

test("settings credit every bundled asset", async ({ page }, info) => {
  await page.goto("./?static=1#/ch/prologue/p-pore");
  await page.getByRole("button", { name: "Settings" }).click();
  const credits = page.getByRole("region", { name: "Credits" });
  await credits.scrollIntoViewIfNeeded();
  await expect(credits.getByRole("row")).toHaveCount(bundledAssets("internal").length + 2); // assets + 2 fonts
  await shot(page, "15-credits", info.project.name);
});

test("the lab bench keeps reads at 100 % and needs a spike-in for amounts", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await page.goto("./#/bench/lab-bench");
  await expect(page.getByRole("heading", { name: "From soil to reads" })).toBeVisible();
  await expect(page.getByText("cannot tell without a spike-in").first()).toBeVisible();
  await page.getByRole("radio", { name: "known amount added" }).check();
  await page.getByRole("radio", { name: "five cores pooled" }).check();
  await expect(page.getByText("cannot tell without a spike-in")).toHaveCount(0);
  await shot(page, "16-lab-bench", info.project.name);
  expect(errors).toEqual([]);
});

test("the learning study is opt-in and its answers never leave the page", async ({ page }, info) => {
  const offsite: string[] = [];
  page.on("request", (r) => {
    if (!/^(https?:\/\/(localhost|127\.0\.0\.1)[:/]|data:|blob:)/.test(r.url())) offsite.push(r.url());
  });
  await page.goto("./?static=1#/ch/prologue/p-pore");
  await page.getByRole("button", { name: "Settings" }).click();
  const study = page.getByRole("region", { name: "Learning study" });
  await expect(study.getByRole("button", { name: "Answer the opening questions" })).toHaveCount(0);
  await study.getByRole("checkbox", { name: /Take part/ }).check();
  await study.getByRole("button", { name: "Answer the opening questions" }).click();
  for (const item of await study.locator(".pilot-item").all()) {
    await item.getByRole("radio", { name: "Not sure" }).check();
    await item.getByRole("radio", { name: "Guess" }).check();
  }
  await study.locator(".pilot-item").first().scrollIntoViewIfNeeded();
  await shot(page, "17-study", info.project.name);
  await study.getByRole("button", { name: "Keep my answers" }).click();
  const download = page.waitForEvent("download");
  await study.getByRole("button", { name: "Export study answers" }).click();
  expect((await download).suggestedFilename()).toBe("terrikus-study-answers.json");
  expect(offsite).toEqual([]);
});
