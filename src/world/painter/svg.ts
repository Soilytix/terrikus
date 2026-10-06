/** A tiny string builder for deterministic SVG plates. */
export type Pt = [number, number];

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Closed smooth path through points (Catmull-Rom → cubic Bézier). */
export function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return "";
  let d = `M${f(pts[0]![0])},${f(pts[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
}

/** Open smooth path through points. */
export function smoothOpen(pts: Pt[]): string {
  const n = pts.length;
  if (n < 2) return "";
  let d = `M${f(pts[0]![0])},${f(pts[0]![1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(n - 1, i + 2)]!;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

export const poly = (pts: Pt[]) => "M" + pts.map((p) => `${f(p[0])},${f(p[1])}`).join("L") + "Z";

export class Svg {
  private defs: string[] = [];
  private body: string[] = [];
  private ids = 0;
  constructor(
    readonly w: number,
    readonly h: number,
  ) {}

  id(prefix: string): string {
    return `${prefix}${this.ids++}`;
  }
  def(s: string): this {
    this.defs.push(s);
    return this;
  }
  add(s: string): this {
    this.body.push(s);
    return this;
  }
  path(d: string, attrs: string): this {
    if (d) this.body.push(`<path d="${d}" ${attrs}/>`);
    return this;
  }
  circle(x: number, y: number, r: number, attrs: string): this {
    this.body.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" ${attrs}/>`);
    return this;
  }
  rect(x: number, y: number, w: number, h: number, attrs: string): this {
    this.body.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" ${attrs}/>`);
    return this;
  }
  open(attrs: string): this {
    this.body.push(`<g ${attrs}>`);
    return this;
  }
  close(): this {
    this.body.push("</g>");
    return this;
  }
  get size(): number {
    return this.body.length;
  }
  /** `scale` sets the raster size (device pixels); the viewBox stays in CSS pixels. */
  toString(scale = 1): string {
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(this.w * scale)}" height="${Math.round(
        this.h * scale,
      )}" viewBox="0 0 ${this.w} ${this.h}" preserveAspectRatio="none">` +
      (this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "") +
      this.body.join("") +
      "</svg>"
    );
  }
}
