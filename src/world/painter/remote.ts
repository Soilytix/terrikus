/**
 * `paint` in a module worker, so a 2 MB plate never blocks a frame. Falls back
 * to the main thread when workers are unavailable or the worker fails.
 */
import { composeStatic, paint, type Plate } from ".";
import PaintWorker from "./paint.worker?worker";

export interface PaintRequest {
  id: number;
  recipe: string;
  seed: number;
  w: number;
  h: number;
  scale: number;
  /** Also compose the static fallback's single SVG. */
  compose: boolean;
}
export type PaintReply =
  { id: number; plate: Plate; svg: string | undefined; error?: undefined } | { id: number; error: string };

type Painted = { plate: Plate; svg: string | undefined };

let worker: Worker | null | undefined;
let next = 0;
const pending = new Map<
  number,
  { req: PaintRequest; resolve: (p: Painted) => void; reject: (e: Error) => void }
>();

const local = (r: PaintRequest): Painted => {
  const plate = paint(r.recipe, r.seed, r.w, r.h, r.scale);
  return { plate, svg: r.compose ? composeStatic(plate) : undefined };
};

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = typeof Worker === "undefined" ? null : new PaintWorker();
  } catch {
    worker = null;
  }
  if (!worker) return worker;
  worker.onmessage = ({ data }: MessageEvent<PaintReply>) => {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error !== undefined) p.reject(new Error(data.error));
    else p.resolve({ plate: data.plate, svg: data.svg });
  };
  // A worker that cannot load or crashes: finish its queue here and stop using it.
  worker.onerror = (e) => {
    e.preventDefault();
    worker?.terminate();
    worker = null;
    for (const p of pending.values()) {
      try {
        p.resolve(local(p.req));
      } catch (err) {
        p.reject(err as Error);
      }
    }
    pending.clear();
  };
  return worker;
}

function request(recipe: string, seed: number, w: number, h: number, scale: number, compose: boolean) {
  const req: PaintRequest = { id: next++, recipe, seed, w, h, scale, compose };
  const wk = getWorker();
  if (!wk) return Promise.resolve().then(() => local(req));
  return new Promise<Painted>((resolve, reject) => {
    pending.set(req.id, { req, resolve, reject });
    wk.postMessage(req);
  });
}

/** `paint`, off the main thread when it can be. */
export const paintOff = (recipe: string, seed: number, w: number, h: number, scale = 1) =>
  request(recipe, seed, w, h, scale, false).then((r) => r.plate);

/** `paint` plus `composeStatic`, off the main thread when it can be. */
export const paintStaticOff = (recipe: string, seed: number, w: number, h: number, scale = 1) =>
  request(recipe, seed, w, h, scale, true) as Promise<{ plate: Plate; svg: string }>;
