import { expect, test, type Page } from "@playwright/test";
import { MISSIONS } from "../src/content";
import { loadChapters } from "../src/content/load";
import { SAVE_KEY, freshSave } from "../src/save/schema";

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/screens/${project}-${name}.jpg`, type: "jpeg", quality: 82 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
  await page.waitForTimeout(700);
}

test("valley map, rumor glimpse and recall on return, by keyboard in static mode", async ({ page }, info) => {
  const p = info.project.name;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Chapters 1 and 2 done: the map is open (WB§1).
  await loadChapters(["prologue", "c1", "leaf"]);
  const done = MISSIONS.filter((m) => ["prologue", "c1", "leaf"].includes(m.chapter));
  const save = {
    ...freshSave(),
    chaptersUnlocked: ["prologue", "c1", "leaf"],
    chaptersComplete: ["prologue", "c1", "leaf"],
    missions: Object.fromEntries(done.map((m) => [m.id, { step: m.steps.length - 1, done: true }])),
    flags: [...done.map((m) => `${m.id}-done`), "map-open"],
    discoveries: ["d-p-half-space", "d-p-sleepers", "d-c2-conserved", "d-c2-moisture"],
    rumors: { "r-p-starving": "investigated", "r-c1": "investigated", "r-c2-leaf": "explained" },
  };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [SAVE_KEY, JSON.stringify(save)]);
  await page.goto("./?static=1#/ch/valley");
  await settled(page);
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "static");

  // `]` walks the portals; Enter goes.
  const map = page.getByRole("button", { name: "Go: The valley map" });
  for (let i = 0; i < 10 && !(await map.evaluate((el) => el === document.activeElement)); i++)
    await page.keyboard.press("]");
  await expect(map).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "The valley map" })).toBeVisible();
  await settled(page);
  await shot(page, "map-01-valley-map", p);

  // A later chapter is met as its rumor.
  await page.getByRole("button", { name: "Glimpse: A dry patch after rain" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".scan-card")).toContainText("Water Roads");
  await page.keyboard.press("Escape");

  // Returning to chapter 2 from the map opens with recall before anything else.
  await page.getByRole("button", { name: "Go: The hedge at the field edge" }).focus();
  await page.keyboard.press("Enter");
  const recall = page.getByRole("dialog", { name: "Before you go on" });
  await expect(recall.getByRole("heading", { name: "Where did the leaf's carbon go?" })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(recall).toContainText("Carbon is never destroyed");
  await page.waitForTimeout(600);
  await shot(page, "map-02-recall", p);
  await page.keyboard.press("Enter");
  await expect(recall.getByRole("heading", { name: /limits decomposition/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(recall).toBeHidden();

  await page.goto("./?static=1#/notebook/rumors");
  const rumors = page.locator(".rumor-map");
  await expect(rumors).toContainText("After the dry spell");
  await expect(rumors.locator('[data-edge="explains"]')).toHaveCount(1);
  await page.waitForTimeout(600);
  await shot(page, "map-03-rumor-map", p);
  expect(errors).toEqual([]);
});
