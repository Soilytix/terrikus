import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** axe over the title, one scene and every notebook tab: no serious or critical violation. */
const routes: [string, string][] = [
  ["title", "./"],
  ["scene", "./#/ch/prologue/p-handful"],
  ...["rumors", "cards", "lab", "codex", "contents"].map((t): [string, string] => [
    `notebook ${t}`,
    `./#/notebook/${t}`,
  ]),
];

for (const [name, url] of routes) {
  test(`axe: ${name}`, async ({ page }) => {
    await page.goto(url);
    const ready = name.startsWith("notebook")
      ? page.getByRole("dialog", { name: "Field notebook" })
      : page.getByRole("heading", { name: name === "title" ? "Terrikus" : "A handful", exact: true });
    await expect(ready).toBeVisible();
    await page.waitForTimeout(1000);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const blocking = violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.impact} ${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`);
    expect(blocking, blocking.join("\n")).toEqual([]);
  });
}
