/**
 * The prologue and the first chapter-2 mission, played four ways: normal,
 * reduced motion, static plates (?static=1) and keyboard only. One script,
 * two drivers: the mouse driver clicks, the keyboard driver only presses keys.
 */
import { expect as baseExpect, test, type Locator, type Page } from "@playwright/test";

// Scene changes wait on software GL: give each assertion room on a loaded runner.
const expect = baseExpect.configure({ timeout: 20_000 });

type Driver = {
  press: (b: Locator) => Promise<void>;
  tick: (box: Locator) => Promise<void>;
  choose: (radio: Locator, scope: Locator) => Promise<void>;
  slide: (slider: Locator, value: number) => Promise<void>;
  pick: (select: Locator, value: string) => Promise<void>;
};

const mouse: Driver = {
  press: (b) => b.click(),
  tick: (box) => box.click(),
  choose: (radio) => radio.click(),
  slide: (slider, value) => slider.fill(String(value)),
  pick: async (select, value) => void (await select.selectOption(value)),
};

const isFocused = (l: Locator) => l.evaluate((el) => el === document.activeElement);

/** Tab forward until `ok` holds for the focused element. */
async function tabUntil(page: Page, ok: () => Promise<boolean>, what: string) {
  for (let i = 0; i < 120; i++) {
    if (await ok()) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab never reached ${what}`);
}

const keyboard = (page: Page): Driver => ({
  press: async (b) => {
    await tabUntil(page, () => isFocused(b), String(b));
    await page.keyboard.press("Enter");
  },
  tick: async (box) => {
    await tabUntil(page, () => isFocused(box), String(box));
    await page.keyboard.press("Space");
  },
  // A radio group is one tab stop; arrows move and select.
  choose: async (radio, scope) => {
    await tabUntil(
      page,
      () => scope.evaluate((el) => !!el.querySelector(":is([role=radio], input[type=radio]):focus")),
      String(radio),
    );
    for (let i = 0; i < 8 && !(await radio.isChecked()); i++) await page.keyboard.press("ArrowDown");
    await expect(radio).toBeChecked();
  },
  slide: async (slider, value) => {
    await tabUntil(page, () => isFocused(slider), String(slider));
    for (let i = 0; i < 100; i++) {
      const now = Number(await slider.inputValue());
      if (now === value) return;
      await page.keyboard.press(now < value ? "ArrowRight" : "ArrowLeft");
    }
    await expect(slider).toHaveValue(String(value));
  },
  // Type-ahead: arrows on a closed <select> open the popup on macOS instead of moving.
  pick: async (select, value) => {
    await tabUntil(page, () => isFocused(select), String(select));
    await page.keyboard.press(value.charAt(0));
    await expect(select).toHaveValue(value);
  },
});

// Software GL on a loaded runner is slow; a full play-through needs more than the default.
test.describe.configure({ timeout: 360_000 });

async function settled(page: Page) {
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
}

async function play(page: Page, d: Driver) {
  const btn = (name: string | RegExp, within: Page | Locator = page) =>
    within.getByRole("button", { name, exact: typeof name === "string" });
  const mission = page.locator(".mission");

  await expect(page.getByRole("heading", { name: "Terrikus" })).toBeVisible({ timeout: 30_000 });
  await settled(page);
  await d.press(btn(/Begin in the spinach field/));
  await expect(page.getByRole("heading", { name: "The spinach field at dawn" })).toBeVisible();
  await settled(page);

  // p-m1: the handful.
  await d.press(btn("Go: Pick up a handful"));
  await expect(page.getByRole("heading", { name: "A handful", exact: true })).toBeVisible();
  await settled(page);
  await d.press(btn("Look closer", mission));
  await d.slide(mission.getByRole("slider"), 70);
  await d.press(btn("Commit my prediction", mission));
  await d.press(btn("Separate the handful", mission));
  await d.press(btn("Continue", mission));
  await d.choose(mission.getByRole("radio", { name: "Water and air, in the gaps" }), mission);
  await d.press(btn("Continue", mission));
  await d.slide(mission.getByRole("slider"), 40);
  await d.press(btn("Continue", mission));
  await d.press(btn("Build the chain", mission));
  const chain = page.getByRole("dialog", { name: "Water and air" });
  await d.pick(chain.getByRole("combobox", { name: "Link 1" }), "decreases");
  await d.choose(chain.getByRole("radio", { name: "Fairly sure" }), chain);
  await d.press(btn("Confirm the chain", chain));
  await expect(chain.getByText("Supported by your run", { exact: true })).toBeVisible();
  await d.press(btn("Continue", chain));
  await expect(chain).toBeHidden();
  await d.press(btn("Add to my notebook", mission));

  // The pore.
  await d.press(page.getByRole("button", { name: /Go: Zoom into a pore/ }).first());
  await expect(page.getByRole("heading", { name: "Inside a pore" })).toBeVisible();
  await settled(page);
  for (const name of ["Bacterium", "Naked amoeba", "Fungal thread"]) {
    await d.press(btn(`Look at: ${name}`));
    await d.press(btn("Close", page.locator(".scan-card")));
  }
  await d.press(btn("Add to my notebook", mission));
  await d.press(btn("Keep the question", mission));
  await d.press(btn("Back to the valley", mission));
  await expect(page.getByRole("heading", { name: "The valley" })).toBeVisible();
  await settled(page);

  // c2-m1: the hedge, the decomposer and the leaf jar.
  await d.press(btn("Go: The hedge at the field edge"));
  await expect(page.getByRole("heading", { name: "The hedge at the field edge" })).toBeVisible();
  await settled(page);
  await d.press(btn("Make a prediction", mission));
  await d.tick(mission.getByRole("checkbox", { name: "Into the air" }));
  await d.tick(mission.getByRole("checkbox", { name: "Into living things" }));
  await d.press(btn("Commit my prediction", mission));
  await d.press(btn("Continue", mission));
  await d.press(btn("Start eating", mission));
  const eat = page.getByRole("dialog", { name: "Be the decomposer" });
  for (let i = 0; i < 14 && !(await eat.getByText("Now let the world do it").isVisible()); i++) {
    await d.press(btn("Into my body", eat));
    if (await eat.getByText(/Not yet|cannot keep more/).isVisible())
      await d.press(btn("Breathe it out", eat));
  }
  await d.press(btn("Now let the world do it", eat));
  await d.press(btn("Open the lab bench", mission));
  await expect(page.getByRole("heading", { name: "Leaf in a jar" })).toBeVisible();
  await d.press(btn("Run one year"));
  await expect(page.getByText("The year is in your lab book.")).toBeVisible({ timeout: 20_000 });
  await d.press(btn("Take the result back to the field"));
  await settled(page);
  await d.choose(mission.getByRole("radio", { name: "Out of the jar as CO₂" }), mission);
  await d.press(btn("Continue", mission));
  await d.press(btn("Add to my notebook", mission));
  await expect(btn(/Go: Kneel down to the litter/)).toBeAttached();
}

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${String(e)} @ ${page.url()}`));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("normal", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("./");
  await play(page, mouse);
  expect(errors).toEqual([]);
});

test("reduced motion", async ({ page }) => {
  const errors = watchErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await play(page, mouse);
  expect(errors).toEqual([]);
});

test("static plates", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("./?static=1");
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "static");
  await play(page, mouse);
  await expect(page.locator(".world")).toHaveAttribute("data-mode", "static");
  expect(errors).toEqual([]);
});

test("keyboard only", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard play is a desktop path");
  const errors = watchErrors(page);
  await page.goto("./");
  await play(page, keyboard(page));
  expect(errors).toEqual([]);
});
