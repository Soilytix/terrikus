import { createHash } from "node:crypto";
import { Worker } from "node:worker_threads";
import { afterAll, describe, expect, it } from "vitest";
import { composeStatic, paint } from ".";
import { RECIPES } from "./recipes";
import type { PaintReply, PaintRequest } from "./remote";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

// The real worker module in a real thread: `self` and `postMessage` bridged to worker_threads.
const thread = new Worker(
  `const { parentPort } = require("node:worker_threads");
   globalThis.self = globalThis;
   globalThis.postMessage = (d) => parentPort.postMessage(d);
   parentPort.on("message", (data) => self.onmessage({ data }));
   require("tsx/esm/api").tsImport(${JSON.stringify(new URL("./paint.worker.ts", import.meta.url).href)}, __filename);`,
  { eval: true },
);
afterAll(() => thread.terminate());

const viaWorker = (req: PaintRequest) =>
  new Promise<PaintReply>((resolve, reject) => {
    thread.once("error", reject);
    const on = (r: PaintReply) => {
      if (r.id !== req.id) return;
      thread.off("message", on);
      thread.off("error", reject);
      resolve(r);
    };
    thread.on("message", on);
    thread.postMessage(req);
  });

describe("paint worker", { timeout: 30_000 }, () => {
  let id = 0;
  it.each(Object.keys(RECIPES))("%s: worker output equals main-thread output", async (recipe) => {
    const r = await viaWorker({ id: id++, recipe, seed: 7, w: 1440, h: 900, scale: 1.5, compose: true });
    if (r.error !== undefined) throw new Error(r.error);
    const main = paint(recipe, 7, 1440, 900, 1.5);
    expect(hash(JSON.stringify(r.plate))).toBe(hash(JSON.stringify(main)));
    expect(hash(r.svg!)).toBe(hash(composeStatic(main)));
  });

  it("reports an unknown recipe instead of dying", async () => {
    const r = await viaWorker({ id: id++, recipe: "nope", seed: 1, w: 10, h: 10, scale: 1, compose: false });
    expect(r.error).toMatch(/unknown painter recipe/);
  });
});
