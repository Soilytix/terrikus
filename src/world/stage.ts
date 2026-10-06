/**
 * The Pixi stage (spec §4): rasters painted plates to textures, gives them
 * ambient life (sway, shimmer, drift, particles), and moves the camera within
 * and between scale nodes. Loaded lazily; the canvas is aria-hidden and every
 * interactive thing lives in the DOM above it.
 */
import { Application, Container, DisplacementFilter, Graphics, Sprite, Texture } from "pixi.js";
import { num } from "./painter/color";
import { fbm, rngFor } from "./painter/noise";
import { paint, type Plate, type ParticleSpec, type PlateLayer, type SpriteSpec } from "./painter";
import { HOME, clampView, easeChart, logLerp, viewTransform, type View } from "./camera";

export interface ScreenView {
  s: number;
  tx: number;
  ty: number;
  w: number;
  h: number;
}

export type Arrival =
  | { kind: "cut" }
  | { kind: "in"; anchor: { x: number; y: number } }
  | { kind: "out"; anchor: { x: number; y: number } };

export interface StageOptions {
  host: HTMLElement;
  reducedMotion: boolean;
  /** Every frame the camera moved: the DOM hotspot layer follows. */
  onView: (v: ScreenView) => void;
  onGround: (colour: string) => void;
  onBusy: (busy: boolean) => void;
}

const SOFT = new Set(["sky", "far", "air", "grain", "mist", "deep", "water", "back", "light", "vignette"]);
const PARALLAX_PX = 9;
const ZOOM_MS = 1100;
const FADE_MS = 200;

interface LiveSprite {
  sprite: Sprite;
  spec: SpriteSpec;
  x: number;
  y: number;
}
interface LiveParticle {
  sprite: Sprite;
  spec: ParticleSpec;
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
  phase: number;
  a: number;
}
interface LiveLayer {
  holder: Container;
  sprite: Sprite;
  spec: PlateLayer;
}

class SceneView {
  readonly root = new Container();
  layers: LiveLayer[] = [];
  sprites: LiveSprite[] = [];
  particles: LiveParticle[] = [];
  view: View = { ...HOME };
  target: View = { ...HOME };
  constructor(
    readonly plate: Plate,
    readonly key: string,
  ) {}

  destroy() {
    this.root.destroy({ children: true, texture: true, textureSource: true });
  }
}

async function svgTexture(svg: string): Promise<Texture> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return Texture.from(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function dotTexture(): Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.75)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
  }
  return Texture.from(c);
}

/** A tiling noise map for displacement (red = x, green = y). */
function noiseTexture(seed: number): Texture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const nx = fbm(seed, 3);
  const ny = fbm(seed + 1, 3);
  if (g) {
    const img = g.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Sample on a torus so the map tiles without a seam.
        const a = (x / size) * Math.PI * 2;
        const b = (y / size) * Math.PI * 2;
        const u = Math.cos(a) * 1.6 + 3;
        const v = Math.sin(a) * 1.6 + Math.cos(b) * 1.6 + 3;
        const i = (y * size + x) * 4;
        img.data[i] = Math.round(nx(u, v + Math.sin(b)) * 255);
        img.data[i + 1] = Math.round(ny(v, u + Math.sin(b)) * 255);
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }
  const t = Texture.from(c);
  t.source.addressMode = "repeat";
  return t;
}

export class Stage {
  private app = new Application();
  private world = new Container();
  private dim = new Graphics();
  private current: SceneView | null = null;
  private leaving: SceneView | null = null;
  private dot!: Texture;
  private sway!: { sprite: Sprite; filter: DisplacementFilter };
  private shimmer!: { sprite: Sprite; filter: DisplacementFilter };
  private t = 0;
  private reduced: boolean;
  private dimmed = false;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private slowFrames = 0;
  private quality = 2;
  private resizeTimer = 0;
  private observer: ResizeObserver | null = null;
  private transition: {
    start: number;
    dur: number;
    from: SceneView;
    to: SceneView;
    how: Arrival;
    done: () => void;
  } | null = null;
  private size = { w: 1, h: 1 };
  private scene: { recipe: string; seed: number } | null = null;
  private drag: { x: number; y: number; cx: number; cy: number } | null = null;

  constructor(private opts: StageOptions) {
    this.reduced = opts.reducedMotion;
  }

  async init(): Promise<void> {
    const { host } = this.opts;
    await this.app.init({
      resizeTo: host,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      preference: "webgl",
      powerPreference: "low-power",
    });
    const canvas = this.app.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("tabindex", "-1");
    canvas.style.display = "block";
    host.appendChild(canvas);
    this.size = { w: host.clientWidth || 1, h: host.clientHeight || 1 };
    this.dot = dotTexture();
    const mk = (seed: number, sc: number) => {
      const sprite = new Sprite(noiseTexture(seed));
      sprite.scale.set(sc);
      sprite.renderable = false;
      this.app.stage.addChild(sprite);
      return { sprite, filter: new DisplacementFilter({ sprite, scale: 0 }) };
    };
    this.sway = mk(11, 6);
    this.shimmer = mk(29, 2.5);
    this.app.stage.addChild(this.world, this.dim);
    this.app.ticker.add(() => this.frame());
    this.observer = new ResizeObserver(() => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => void this.onResize(), 220);
    });
    this.observer.observe(host);
    host.addEventListener("pointermove", this.onPointer);
    host.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointerup", this.onUp);
    host.addEventListener("wheel", this.onWheel, { passive: false });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  destroy(): void {
    this.observer?.disconnect();
    const { host } = this.opts;
    host.removeEventListener("pointermove", this.onPointer);
    host.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointerup", this.onUp);
    host.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.current?.destroy();
    this.leaving?.destroy();
    this.app.destroy(true, { children: true, texture: true });
  }

  setReducedMotion(reduced: boolean): void {
    this.reduced = reduced;
  }

  setDim(dim: boolean): void {
    this.dimmed = dim;
  }

  /** Paint and show a scene. Resolves when the arrival has finished. */
  async show(recipe: string, seed: number, how: Arrival): Promise<void> {
    this.scene = { recipe, seed };
    const key = `${recipe}:${seed}`;
    if (this.current?.key === key && !this.transition) return;
    this.opts.onBusy(true);
    const next = await this.build(recipe, seed);
    this.opts.onBusy(false);
    if (this.scene.recipe !== recipe || this.scene.seed !== seed) {
      next.destroy();
      return;
    }
    this.finishTransition();
    const prev = this.current;
    this.current = next;
    this.world.addChild(next.root);
    this.opts.onGround(next.plate.ground);
    if (!prev) {
      next.root.alpha = 1;
      this.emitView();
      return;
    }
    await new Promise<void>((done) => {
      const dur = this.reduced || how.kind === "cut" ? FADE_MS : ZOOM_MS;
      this.leaving = prev;
      next.root.alpha = 0;
      this.transition = {
        start: performance.now(),
        dur,
        from: prev,
        to: next,
        how: this.reduced ? { kind: "cut" } : how,
        done,
      };
    });
  }

  /** User camera: pan by a fraction of the view, zoom by a factor. */
  nudge(dx: number, dy: number, zoom = 1): void {
    const c = this.current;
    if (!c) return;
    const z = c.target.z * zoom;
    c.target = clampView({ z, cx: c.target.cx + dx / z, cy: c.target.cy + dy / z });
    if (this.reduced) c.view = { ...c.target };
  }

  resetView(): void {
    if (!this.current) return;
    this.current.target = { ...HOME };
    if (this.reduced) this.current.view = { ...HOME };
  }

  private async build(recipe: string, seed: number): Promise<SceneView> {
    const { w, h } = this.size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fine = Math.min(dpr, 1.5);
    const plate = paint(recipe, seed, w, h, 1);
    const crisp = paint(recipe, seed, w, h, fine);
    const view = new SceneView(plate, `${recipe}:${seed}`);
    const textures = await Promise.all(
      crisp.layers.map((l, i) => svgTexture(SOFT.has(l.id) ? (plate.layers[i]?.svg ?? l.svg) : l.svg)),
    );
    const spriteTextures = await Promise.all(crisp.sprites.map((s) => svgTexture(s.svg)));
    textures.forEach((texture, i) => {
      const spec = crisp.layers[i]!;
      const holder = new Container();
      const sprite = new Sprite(texture);
      sprite.width = w;
      sprite.height = h;
      if (spec.alpha !== undefined) sprite.alpha = spec.alpha;
      if (spec.blend && spec.blend !== "normal") sprite.blendMode = spec.blend;
      holder.addChild(sprite);
      view.root.addChild(holder);
      view.layers.push({ holder, sprite, spec });
    });
    // Sprites sit above the mid layers, below the atmosphere overlays.
    const overlayAt = view.layers.findIndex((l, i) => i > 0 && l.spec.parallax === 0);
    const actors = new Container();
    view.root.addChildAt(actors, overlayAt > 0 ? overlayAt : view.root.children.length);
    spriteTextures.forEach((texture, i) => {
      const spec = crisp.sprites[i]!;
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.width = spec.w;
      sprite.height = spec.h;
      sprite.position.set(spec.x, spec.y);
      sprite.rotation = spec.rotation ?? 0;
      if (spec.alpha !== undefined) sprite.alpha = spec.alpha;
      if (spec.blend && spec.blend !== "normal") sprite.blendMode = spec.blend;
      actors.addChild(sprite);
      view.sprites.push({ sprite, spec, x: spec.x, y: spec.y });
    });
    const parts = new Container();
    view.root.addChildAt(parts, view.root.getChildIndex(actors) + 1);
    for (const spec of crisp.particles) {
      const rng = rngFor(seed, 31, spec.count);
      for (let k = 0; k < spec.count; k++) {
        const sprite = new Sprite(this.dot);
        sprite.anchor.set(0.5);
        sprite.tint = num(spec.colour);
        const size = spec.size[0] + (spec.size[1] - spec.size[0]) * rng();
        sprite.scale.set(size / 8);
        const a = spec.alpha[0] + (spec.alpha[1] - spec.alpha[0]) * rng();
        sprite.alpha = a;
        if (spec.kind === "glint" || spec.kind === "mote") sprite.blendMode = "screen";
        const x = (spec.region.x0 + (spec.region.x1 - spec.region.x0) * rng()) * w;
        const y = (spec.region.y0 + (spec.region.y1 - spec.region.y0) * rng()) * h;
        sprite.position.set(x, y);
        parts.addChild(sprite);
        view.particles.push({
          sprite,
          spec,
          x,
          y,
          hx: x,
          hy: y,
          vx: spec.vx * (0.6 + rng() * 0.8),
          vy: spec.vy * (0.6 + rng() * 0.8),
          phase: rng() * Math.PI * 2,
          a,
        });
      }
    }
    return view;
  }

  private finishTransition(): void {
    const tr = this.transition;
    if (!tr) return;
    this.transition = null;
    tr.to.root.alpha = 1;
    tr.to.view = { ...tr.to.target };
    if (this.leaving) {
      this.world.removeChild(this.leaving.root);
      this.leaving.destroy();
      this.leaving = null;
    }
    tr.done();
  }

  private async onResize(): Promise<void> {
    const { host } = this.opts;
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    if (Math.abs(w - this.size.w) < 2 && Math.abs(h - this.size.h) < 2) return;
    this.size = { w, h };
    if (!this.scene || !this.current) return;
    this.finishTransition();
    const keep = { ...this.current.target };
    const next = await this.build(this.scene.recipe, this.scene.seed);
    const old = this.current;
    this.current = next;
    next.view = keep;
    next.target = keep;
    this.world.addChild(next.root);
    this.world.removeChild(old.root);
    old.destroy();
    this.emitView();
  }

  private onPointer = (e: PointerEvent) => {
    const { w, h } = this.size;
    this.pointer.x = (e.offsetX / w - 0.5) * 2;
    this.pointer.y = (e.offsetY / h - 0.5) * 2;
    if (this.drag && this.current) {
      const z = this.current.target.z;
      this.current.target = clampView({
        z,
        cx: this.drag.cx - (e.clientX - this.drag.x) / (w * z),
        cy: this.drag.cy - (e.clientY - this.drag.y) / (h * z),
      });
      this.current.view = { ...this.current.target };
    }
  };

  private onDown = (e: PointerEvent) => {
    if (!this.current || e.target !== this.app.canvas || this.current.target.z <= 1.001) return;
    this.drag = { x: e.clientX, y: e.clientY, cx: this.current.target.cx, cy: this.current.target.cy };
  };

  private onUp = () => {
    this.drag = null;
  };

  private onWheel = (e: WheelEvent) => {
    const c = this.current;
    if (!c || this.transition) return;
    e.preventDefault();
    const f = Math.exp(-e.deltaY * 0.0015);
    const { w, h } = this.size;
    // Zoom about the cursor.
    const t = viewTransform(c.target, w, h);
    const px = (e.offsetX - t.tx) / (w * t.s);
    const py = (e.offsetY - t.ty) / (h * t.s);
    const z = Math.min(3, Math.max(1, c.target.z * f));
    c.target = clampView({ z, cx: px - (e.offsetX / w - 0.5) / z, cy: py - (e.offsetY / h - 0.5) / z });
    if (this.reduced) c.view = { ...c.target };
  };

  private onVisibility = () => {
    if (document.hidden) this.app.ticker.stop();
    else this.app.ticker.start();
  };

  private emitView(): void {
    const c = this.current;
    if (!c) return;
    const { w, h } = this.size;
    const t = viewTransform(c.view, w, h);
    const p = 0.6 * PARALLAX_PX;
    this.opts.onView({ s: t.s, tx: t.tx - this.pointer.sx * p, ty: t.ty - this.pointer.sy * p, w, h });
  }

  private frame(): void {
    const dt = Math.min(this.app.ticker.deltaMS, 100) / 1000;
    this.govern(this.app.ticker.deltaMS);
    const speed = this.reduced ? 0 : this.dimmed ? 0.25 : 1;
    this.t += dt * speed;
    const { w, h } = this.size;
    const u = Math.min(w, h);

    // Ambient displacement maps scroll slowly; frozen under reduced motion.
    const amp = this.reduced || this.quality < 2 ? 0 : 1;
    this.sway.sprite.position.set(this.t * 9, this.t * 4);
    this.sway.filter.scale.set(u * 0.007 * amp, u * 0.004 * amp);
    this.shimmer.sprite.position.set(-this.t * 14, this.t * 6);
    this.shimmer.filter.scale.set(u * 0.004 * amp, u * 0.003 * amp);

    if (!this.reduced) {
      this.pointer.sx += (this.pointer.x - this.pointer.sx) * 0.04;
      this.pointer.sy += (this.pointer.y - this.pointer.sy) * 0.04;
    }

    this.dim.clear();
    if (this.dimmed) this.dim.rect(0, 0, w, h).fill({ color: 0x161c19, alpha: 0.4 });

    const tr = this.transition;
    if (tr) {
      const k = Math.min(1, (performance.now() - tr.start) / tr.dur);
      const e = easeChart(k);
      const fade = tr.how.kind === "cut" ? k : Math.min(1, Math.max(0, (k - 0.4) / 0.3));
      tr.from.root.alpha = 1 - fade;
      tr.to.root.alpha = fade;
      if (tr.how.kind === "in") {
        const a = tr.how.anchor;
        tr.from.view = {
          z: logLerp(tr.from.target.z, tr.from.target.z * 7, e),
          cx: tr.from.target.cx + (a.x - tr.from.target.cx) * e,
          cy: tr.from.target.cy + (a.y - tr.from.target.cy) * e,
        };
        tr.to.view = { z: logLerp(1 / 7, 1, e), cx: 0.5, cy: 0.5 };
      } else if (tr.how.kind === "out") {
        const a = tr.how.anchor;
        tr.from.view = { z: logLerp(tr.from.target.z, 1 / 7, e), cx: 0.5, cy: 0.5 };
        tr.to.view = { z: logLerp(7, 1, e), cx: a.x + (0.5 - a.x) * e, cy: a.y + (0.5 - a.y) * e };
      }
      this.place(tr.from);
      this.animate(tr.from, dt);
      if (k >= 1) this.finishTransition();
    }

    const c = this.current;
    if (!c) return;
    if (!tr) {
      const ease = this.reduced ? 1 : 0.14;
      c.view = {
        z: c.view.z + (c.target.z - c.view.z) * ease,
        cx: c.view.cx + (c.target.cx - c.view.cx) * ease,
        cy: c.view.cy + (c.target.cy - c.view.cy) * ease,
      };
    }
    this.place(c);
    this.animate(c, dt);
    this.emitView();
  }

  private place(v: SceneView): void {
    const { w, h } = this.size;
    const t = viewTransform(v.view, w, h);
    v.root.scale.set(t.s);
    v.root.position.set(t.tx, t.ty);
    for (const l of v.layers) {
      const p = l.spec.parallax;
      if (p === 0) {
        l.holder.position.set(0, 0);
        continue;
      }
      // Overscan so a parallax shift never reveals the edge.
      const over = 1 + (2 * PARALLAX_PX) / Math.min(w, h);
      l.holder.scale.set(over);
      l.holder.position.set(
        -this.pointer.sx * PARALLAX_PX * p - (w * (over - 1)) / 2,
        -this.pointer.sy * PARALLAX_PX * p - (h * (over - 1)) / 2,
      );
    }
  }

  private animate(v: SceneView, dt: number): void {
    const t = this.t;
    const { w, h } = this.size;
    const u = Math.min(w, h);
    for (const l of v.layers) {
      const m = l.spec.motion;
      const want = m === "sway" ? [this.sway.filter] : m === "shimmer" ? [this.shimmer.filter] : null;
      const has = l.sprite.filters && (l.sprite.filters as unknown[]).length > 0;
      if (want && this.quality >= 2 && !this.reduced) {
        if (!has) l.sprite.filters = want;
      } else if (has) {
        l.sprite.filters = [];
      }
      if (m === "drift") {
        l.sprite.x = Math.sin(t * 0.06 + l.spec.parallax * 9) * u * 0.012;
        l.sprite.alpha = (l.spec.alpha ?? 1) * (0.88 + 0.12 * Math.sin(t * 0.11));
      }
    }
    if (this.reduced) return;
    const step = dt * (this.dimmed ? 0.25 : 1);
    for (const s of v.sprites) {
      const { spec, sprite } = s;
      const ph = spec.phase * Math.PI * 2;
      switch (spec.motion) {
        case "breathe":
          sprite.scale.set(
            (spec.w / sprite.texture.width) * (1 + 0.035 * Math.sin(t * 0.9 + ph)),
            (spec.h / sprite.texture.height) * (1 + 0.035 * Math.sin(t * 0.9 + ph + 1)),
          );
          break;
        case "wiggle":
          sprite.rotation = (spec.rotation ?? 0) + 0.14 * Math.sin(t * 1.3 + ph);
          sprite.position.set(
            s.x + Math.sin(t * 0.7 + ph) * u * 0.004,
            s.y + Math.cos(t * 0.9 + ph) * u * 0.003,
          );
          break;
        case "sway":
          sprite.rotation = (spec.rotation ?? 0) + 0.025 * Math.sin(t * 0.5 + ph);
          break;
        case "drift": {
          s.x += (spec.vx ?? 0) * step;
          s.y += (spec.vy ?? 0) * step;
          if (s.x > w + spec.w) s.x = -spec.w;
          if (s.x < -spec.w) s.x = w + spec.w;
          if (s.y > h + spec.h) s.y = -spec.h;
          const falling = (spec.vy ?? 0) > 0;
          sprite.position.set(s.x + (falling ? Math.sin(t * 1.2 + ph) * u * 0.02 : 0), s.y);
          if (falling) sprite.rotation += step * 0.9;
          break;
        }
        default:
          break;
      }
    }
    if (this.quality < 1) return;
    for (const p of v.particles) {
      const { spec } = p;
      const r = spec.region;
      switch (spec.kind) {
        case "colloid":
          p.x = p.hx + Math.sin(t * 2.1 + p.phase * 7) * u * 0.004 + Math.sin(t * 5.3 + p.phase) * u * 0.0015;
          p.y = p.hy + Math.cos(t * 1.7 + p.phase * 5) * u * 0.004;
          break;
        case "glint":
          p.x += p.vx * step;
          if (p.x > r.x1 * w) p.x = r.x0 * w;
          p.sprite.alpha = p.a * Math.max(0, Math.sin(t * 1.6 + p.phase * 4));
          break;
        default: {
          p.x += p.vx * step + Math.sin(t * 0.8 + p.phase) * 0.15;
          p.y += p.vy * step;
          const out = p.x > r.x1 * w || p.x < r.x0 * w || p.y < r.y0 * h || p.y > r.y1 * h;
          if (out) {
            if (spec.kind === "plume") {
              p.x = r.x0 * w;
              p.y = (r.y0 + (r.y1 - r.y0) * (0.5 + 0.5 * Math.sin(p.phase * 13 + t))) * h;
            } else if (spec.kind === "bubble") {
              p.y = r.y1 * h;
              p.x = p.hx;
            } else {
              p.x = p.vx >= 0 ? r.x0 * w : r.x1 * w;
              p.y = p.hy;
            }
          }
          if (spec.kind === "plume") {
            const life = (p.x - r.x0 * w) / ((r.x1 - r.x0) * w);
            p.sprite.alpha = p.a * Math.max(0, 1 - life);
          }
          if (spec.kind === "mote") p.sprite.alpha = p.a * (0.6 + 0.4 * Math.sin(t * 0.9 + p.phase));
        }
      }
      p.sprite.position.set(p.x, p.y);
    }
  }

  /** Quality governor (spec §8): drop shaders, then particles; never labels. */
  private govern(ms: number): void {
    if (ms > 30) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 90 && this.quality > 0) {
      this.quality--;
      this.slowFrames = 0;
      if (this.quality < 1) for (const p of this.current?.particles ?? []) p.sprite.visible = false;
    }
  }
}

export async function createStage(opts: StageOptions): Promise<Stage> {
  const stage = new Stage(opts);
  await stage.init();
  return stage;
}
