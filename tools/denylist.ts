/**
 * Customer denylist matching (spec §9). Only SHA-256 hashes of lowercase tokens
 * are committed; the plain list lives outside the repo. Single words and
 * two-word phrases are both checked, so multi-word names can be listed.
 */
import { createHash } from "node:crypto";

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function tokens(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9äöüß]+/g) ?? [];
  const out = new Set(words);
  for (let i = 1; i < words.length; i++) out.add(`${words[i - 1]} ${words[i]}`);
  return [...out];
}

export function findDenied(text: string, hashes: ReadonlySet<string>): string[] {
  return tokens(text).filter((t) => hashes.has(sha256(t)));
}
