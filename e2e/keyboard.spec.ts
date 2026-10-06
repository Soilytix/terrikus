import { expect, test, type Locator, type Page } from "@playwright/test";

/** Mission p-m1 with key presses only: no clicks, no fill(). Desktop only (a phone has no keyboard). */
test.skip(({ isMobile }) => isMobile, "keyboard play is a desktop path");

/** Tab forward until `target` has focus; the panel must keep it the whole way. */
async function tabTo(page: Page, target: Locator, within: Locator) {
  for (let i = 0; i < 40; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
  await expect(within.locator(":focus")).toHaveCount(1);
}

/** Arrow the focused slider until it reads `value`. */
async function slideTo(page: Page, slider: Locator, value: number) {
  for (let i = 0; i < 100; i++) {
    const now = Number(await slider.inputValue());
    if (now === value) return;
    await page.keyboard.press(now < value ? "ArrowRight" : "ArrowLeft");
  }
  await expect(slider).toHaveValue(String(value));
}

test("complete p-m1 with the keyboard only", async ({ page }) => {
  await page.goto("./#/ch/prologue/p-handful");
  await expect(page.getByRole("heading", { name: "A handful", exact: true })).toBeVisible();

  const mission = page.locator(".mission");
  const press = async (name: string, within: Locator = mission) => {
    const b = within.getByRole("button", { name, exact: true });
    await tabTo(page, b, within);
    await page.keyboard.press("Enter");
  };
  // After each step the panel keeps the focus (it never falls back to the page).
  const focusInPanel = (within: Locator = mission) => expect(within.locator(":focus")).toHaveCount(1);

  await press("Look closer");
  await focusInPanel();
  const predict = mission.getByRole("slider");
  await tabTo(page, predict, mission);
  await slideTo(page, predict, 70);
  await press("Commit my prediction");
  await focusInPanel();
  await press("Separate the handful");
  await focusInPanel();
  await press("Continue");
  await focusInPanel();

  // The radio group is one tab stop; arrows move and select.
  const group = mission.getByRole("radiogroup");
  const answer = group.getByRole("radio", { name: "Water and air, in the gaps" });
  await tabTo(page, group.locator('[tabindex="0"]'), mission);
  for (let i = 0; i < 6 && (await answer.getAttribute("aria-checked")) !== "true"; i++)
    await page.keyboard.press("ArrowDown");
  await expect(answer).toHaveAttribute("aria-checked", "true");
  // A right answer locks the group; the panel moves focus on to its next control.
  await focusInPanel();
  await press("Continue");
  await focusInPanel();

  const guess = mission.getByRole("slider");
  await tabTo(page, guess, mission);
  await slideTo(page, guess, 40);
  await press("Continue");
  await focusInPanel();
  await press("Build the chain");

  const chain = page.getByRole("dialog", { name: "Water and air" });
  await expect(chain).toBeVisible();
  const link = chain.getByRole("combobox", { name: "Link 1" });
  await tabTo(page, link, chain);
  // Type-ahead: arrows on a closed <select> open the popup on macOS instead of moving.
  await page.keyboard.press("d");
  await expect(link).toHaveValue("decreases");
  const sure = chain.getByRole("radio", { name: "Fairly sure" });
  const firstConfidence = chain.getByRole("radio").first();
  await tabTo(page, firstConfidence, chain);
  for (let i = 0; i < 6 && !(await sure.isChecked()); i++) await page.keyboard.press("ArrowDown");
  await expect(sure).toBeChecked();
  await press("Confirm the chain", chain);
  await expect(chain.getByText("Supported by your run", { exact: true })).toBeVisible();
  await press("Continue", chain);
  await expect(chain).toBeHidden();

  await focusInPanel();
  await press("Add to my notebook");
  await expect(page.getByRole("button", { name: /Go: Zoom into a pore/ }).first()).toBeVisible();
});
