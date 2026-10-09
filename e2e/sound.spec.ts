import { expect, test } from "@playwright/test";
import { CUES } from "../src/audio/mixer";

test("sound is on by default but waits for a gesture, and every cue has a caption", async ({
  page,
}, info) => {
  // Count AudioContexts the page builds: none may exist before the learner's first gesture.
  await page.addInitScript(() => {
    const w = window as unknown as { __audio: number; AudioContext: typeof AudioContext };
    w.__audio = 0;
    const Real = w.AudioContext;
    w.AudioContext = class extends Real {
      constructor(o?: AudioContextOptions) {
        super(o);
        w.__audio++;
      }
    };
  });
  const contexts = () => page.evaluate(() => (window as unknown as { __audio: number }).__audio);
  const captions = page.locator(".sound-captions");

  await page.goto("./?static=1#/ch/prologue/p-pore");
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 30_000 });
  expect(await contexts()).toBe(0);
  await page.getByRole("button", { name: "Look at: Bacterium" }).click();
  await page.locator(".scan-card").getByRole("button", { name: "Close" }).click();
  expect(await contexts()).toBe(1);
  await expect(captions).toContainText("synthesised, not a recording");

  await page.getByRole("button", { name: "Settings" }).click();
  const sound = page.getByRole("region", { name: "Sound" });
  await expect(sound.getByRole("checkbox", { name: /Play sounds/ })).toBeChecked();
  for (const { caption } of Object.values(CUES)) {
    await sound.getByRole("row", { name: caption }).getByRole("button", { name: "Play" }).click();
    await expect(captions).toContainText(caption);
    await expect(sound.getByRole("status")).toHaveText(caption);
  }
  await page.screenshot({
    path: `docs/screens/${info.project.name}-17-sound.jpg`,
    type: "jpeg",
    quality: 82,
  });

  await page.getByRole("dialog", { name: "Settings" }).getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Look at: Naked amoeba" }).click();
  // A first look earns a card, and the card cue outranks the plain scan click.
  await expect(captions).toContainText(CUES.card.caption);
  expect(await contexts()).toBe(1);
});
