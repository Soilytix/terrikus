/**
 * First interactive on a cold load over Chrome DevTools' "Fast 4G" profile:
 * the time from navigation start until the title's first action is visible
 * and enabled. Budget 2.5 s (backlog T34). The moving world's first paint is
 * logged too but not held to the budget: headless runs draw with software GL.
 */
import { expect, test } from "@playwright/test";

const BUDGET_MS = 2500;
// Chromium's Fast 4G preset: 9 Mbps down, 1.5 Mbps up at 90 % throughput, 165 ms latency.
const FAST_4G = {
  offline: false,
  latency: 165,
  downloadThroughput: (9_000_000 / 8) * 0.9,
  uploadThroughput: (1_500_000 / 8) * 0.9,
};

test("first interactive on throttled fast 4G", async ({ page }, info) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", FAST_4G);

  await page.goto("./", { waitUntil: "commit" });
  const interactive = await page
    .waitForFunction(
      () => {
        const begin = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Begin"));
        return begin && !begin.disabled && begin.checkVisibility() ? performance.now() : false;
      },
      undefined,
      { polling: "raf", timeout: 30_000 },
    )
    .then(async (h) => Math.round(Number(await h.jsonValue())));
  const painted = await page
    .waitForFunction(
      () => (document.querySelector('.hotspots[data-busy="false"]') ? performance.now() : false),
      undefined,
      {
        polling: "raf",
        timeout: 120_000,
      },
    )
    .then(async (h) => Math.round(Number(await h.jsonValue())));

  const line = `fast 4G, ${info.project.name}: first interactive ${interactive} ms, world painted ${painted} ms`;
  console.log(line);
  info.annotations.push({ type: "first-interactive-ms", description: String(interactive) });
  expect(interactive, line).toBeLessThanOrEqual(BUDGET_MS);
});
