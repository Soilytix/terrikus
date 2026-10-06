/** Paints plates off the main thread; `remote.ts` is its only caller. */
import { composeStatic, paint } from ".";
import type { PaintReply, PaintRequest } from "./remote";

self.onmessage = ({ data: r }: MessageEvent<PaintRequest>) => {
  let reply: PaintReply;
  try {
    const plate = paint(r.recipe, r.seed, r.w, r.h, r.scale);
    reply = { id: r.id, plate, svg: r.compose ? composeStatic(plate) : undefined };
  } catch (e) {
    reply = { id: r.id, error: String(e) };
  }
  postMessage(reply);
};
