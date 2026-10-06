/**
 * R10: during a portal zoom the plate is painted in the paint worker, never on
 * the main thread. Records a CPU profile and the long tasks (> 50 ms) of the
 * zoom and attaches both; the long tasks are reported, not asserted, because
 * software GL (SwiftShader) makes texture upload and the governor's fallback
 * long on their own.
 */
import { expect, test } from "@playwright/test";

interface ProfileNode {
  id: number;
  callFrame: { functionName: string; url: string };
}

test("a portal zoom paints in the worker, not on the main thread", async ({ page }, info) => {
  test.setTimeout(300_000);
  const workers: string[] = [];
  page.on("worker", (w) => workers.push(w.url()));
  await page.goto("./#/ch/prologue/p-field-dawn");
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 120_000 });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const w = window as unknown as { longTasks: number[] };
    w.longTasks = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) w.longTasks.push(Math.round(e.duration));
    }).observe({ type: "longtask" });
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
  await cdp.send("Profiler.start");
  await page.getByRole("button", { name: "Go: Pick up a handful" }).click();
  await expect(page.getByRole("heading", { name: "A handful", exact: true })).toBeVisible();
  await expect(page.locator(".hotspots")).toHaveAttribute("data-busy", "false", { timeout: 120_000 });
  await page.waitForTimeout(1000);
  const { profile } = await cdp.send("Profiler.stop");
  const longTasks = await page.evaluate(() => (window as unknown as { longTasks: number[] }).longTasks);

  await info.attach("main-thread-profile.cpuprofile", {
    body: JSON.stringify(profile),
    contentType: "application/json",
  });
  info.annotations.push({ type: "long tasks (ms)", description: JSON.stringify(longTasks) });

  // Main-thread CPU time spent inside the painter's chunk (the fallback copy of `paint`).
  const inPainter = new Set(
    (profile.nodes as ProfileNode[])
      .filter(
        (n) => /\/remote-[^/]*\.js$/.test(n.callFrame.url) && !/onmessage/.test(n.callFrame.functionName),
      )
      .map((n) => n.id),
  );
  let ms = 0;
  profile.samples!.forEach((id, i) => inPainter.has(id) && (ms += profile.timeDeltas![i]! / 1000));
  expect(ms, "ms of painting on the main thread").toBeLessThan(5);
  expect(workers.some((u) => /paint\.worker/.test(u))).toBe(true);
});
