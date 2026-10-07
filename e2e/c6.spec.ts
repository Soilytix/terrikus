/**
 * Chapter 6 (T20): links reveal only by watching, the ripple run, the geosmin
 * scene and the squeezing jar, whose caption stays on screen throughout.
 */
import { expect, test, type Page } from "@playwright/test";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 150_000 });
  await page.waitForTimeout(700);
}

/** Open chapter 6 with the given missions already done. */
async function open(page: Page, done: string[], scene = "c6-gallery") {
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "leaf", "c6"],
    chaptersComplete: ["prologue", "leaf"],
    missions: Object.fromEntries(done.map((id) => [id, { step: 0, done: true }])),
    flags: done.map((id) => `${id}-done`),
  };
  await page.addInitScript(
    ([k, v]) => !localStorage.getItem(k!) && localStorage.setItem(k!, v!),
    [SAVE_KEY, JSON.stringify(save)],
  );
  await page.goto(`./?static=1#/ch/c6/${scene}`);
  await settled(page);
}

// Scenes paint slowly on a loaded runner under software GL.
test.describe.configure({ timeout: 600_000 });

test("chapter 6: links reveal by watching, and the ripple run", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, []);
  await expect(page.getByRole("heading", { name: "Beside a spinach root" })).toBeVisible();
  await shot(page, "c6-01-gallery", p);

  const mission = page.locator(".mission");
  await mission.getByRole("button", { name: "Make a prediction" }).click();
  await mission.getByRole("radio", { name: "It leaves the amoeba as ammonium" }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();

  // No link is drawn before any meal is watched, and Continue waits for the watching.
  const mobile = mission.getByRole("img", { name: /food-web mobile/ });
  await expect(mobile).toHaveAccessibleName(/No feeding has been watched yet/);
  await expect(mission.getByRole("button", { name: "Continue" })).toBeDisabled();
  await mission.getByRole("button", { name: "Watch: Amoebae" }).click();
  await expect(mobile).toHaveAccessibleName(/Amoebae eat bacteria/);
  await mission.getByRole("button", { name: "Watch: Bacteria" }).click();
  await shot(page, "c6-02-mobile", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /released as ammonium by the amoeba/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  for (const name of [
    "Fungi",
    "Bacteria-feeding nematodes",
    "Fungus-feeding nematodes",
    "Springtails",
    "Predatory nematodes",
    "Predatory mites",
  ])
    await mission.getByRole("button", { name: `Watch: ${name}` }).click();
  await shot(page, "c6-03-mobile-full", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /Bacteria stay high/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Run both webs" }).click();
  await expect(mission.getByText("Teaching model: direction, not prediction.")).toBeVisible();
  await mission.locator(".ripple").scrollIntoViewIfNeeded();
  await shot(page, "c6-04-ripple", p);
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 6: read the mouth, then follow the smell", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, ["c6-m1", "c6-m2"]);
  const mission = page.locator(".mission");
  await mission.getByRole("radio", { name: /Fungal threads, by piercing/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: "The bacterial channel" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  await page.getByRole("button", { name: /Go: Follow the earthy smell/ }).click();
  await expect(page.getByRole("heading", { name: "The smell of soil" })).toBeVisible();
  await settled(page);
  await shot(page, "c6-05-geosmin", p);
  for (const name of ["Streptomyces filaments", "Scent ribbons", "Springtail"]) {
    await page.getByRole("button", { name: `Look at: ${name}` }).click();
    await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  }
  if (p === "phone" && (await mission.getAttribute("data-open")) === "false")
    await mission.locator(".mission-toggle").click();
  await mission.getByRole("radio", { name: /Up the ribbons/ }).click();
  await mission.getByRole("button", { name: "Commit my prediction" }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();
  expect(errors).toEqual([]);
});

test("chapter 6: the squeezing jar's caption stays on screen", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}\n${e.stack ?? ""}`));
  await open(page, ["c6-m1", "c6-m2", "c6-m3", "c6-m4"]);
  const mission = page.locator(".mission");
  const caption = mission.getByText("Relative, not absolute; presence ≠ activity.");
  await expect(caption).toBeVisible();
  await mission.getByRole("radio", { name: "Yes, the fungi declined" }).click();
  await expect(caption).toBeVisible();
  await mission.locator(".jar").scrollIntoViewIfNeeded();
  await shot(page, "c6-06-jar", p);
  await mission.getByRole("radio", { name: "Cannot tell from shares alone" }).click();
  await expect(caption).toBeVisible();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("radio", { name: /associated with the sugar pulse/ }).click();
  await mission.getByRole("button", { name: "Continue" }).click();
  await mission.getByRole("button", { name: "Add to my notebook" }).click();

  expect(errors).toEqual([]);
});
