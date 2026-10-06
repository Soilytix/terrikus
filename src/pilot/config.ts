/**
 * Pilot instrument and thresholds (T33). Both are pending OD-13 (docs/spec.md
 * §11, owner: Founder): the item set below is a draft built from the
 * misconception bank, and every threshold is null until OD-13 settles it.
 */
import type { MisconceptionId, ReviewStatus } from "../content/schema";

export interface PilotConfig {
  /** Shipped as a content node so the public profile refuses it until approved. */
  id: string;
  reviewStatus: ReviewStatus;
  /** Bumped whenever items change, so exports from different instruments are never pooled. */
  version: string;
  /** One true/false item per misconception, worded as the misconception itself. */
  items: MisconceptionId[];
  thresholds: {
    /** Chapters complete before the closing questions are offered; null: offered as soon as the opening set is in. */
    postAfterChapters: number | null;
    /** Items moved to the correct answer, pre to post, that count as a learning gain; null: not judged. */
    itemsShiftedForGain: number | null;
  };
}

export const PILOT: PilotConfig = {
  id: "pilot-instrument",
  reviewStatus: "draft",
  version: "draft-1",
  // The misconceptions the Build-phase chapters (prologue, leaf) set out to move.
  items: ["M1", "M4", "M5", "M7", "M9", "M15", "M26", "M27", "M28"],
  thresholds: { postAfterChapters: null, itemsShiftedForGain: null },
};
