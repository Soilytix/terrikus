/**
 * The world view: a Pixi stage (lazy) or a static painted plate, with the DOM
 * hotspot layer kept in register with the camera. All text and every control
 * live in the DOM; the canvas is decoration.
 */
import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { scene as sceneById } from "../content";
import { loadManifest, pickBaked, plateUrl as bakedUrl } from "./baked";
import type { Tier } from "./shaders/tiers";
import type { Arrival, Stage, ScreenView } from "./stage";

export interface WorldHandle {
  zoom(factor: number): void;
  pan(dx: number, dy: number): void;
  reset(): void;
}

interface Props {
  sceneId: string;
  reduced: boolean;
  /** Ambient motion on (OD-8 interim: behind a settings toggle). */
  ambient: boolean;
  forceStatic: boolean;
  dim: boolean;
  children: ReactNode;
  ref?: Ref<WorldHandle>;
  onReady?: () => void;
  /** The stage fell back to the static plate because it drew too slowly. */
  onTooSlow?: () => void;
}

function arrival(prev: string | null, next: string, portrait: boolean): Arrival {
  if (!prev) return { kind: "cut" };
  const p = sceneById(prev);
  const n = sceneById(next);
  const down = p?.objects.find((o) => o.to === next);
  if (down) return { kind: "in", anchor: (portrait && down.portrait) || down.anchor };
  const up = n?.objects.find((o) => o.to === prev);
  if (up) return { kind: "out", anchor: (portrait && up.portrait) || up.anchor };
  return { kind: "cut" };
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function World({
  sceneId,
  reduced,
  ambient,
  forceStatic,
  dim,
  children,
  ref,
  onReady,
  onTooSlow,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const prev = useRef<string | null>(null);
  const [mode, setMode] = useState<"pixi" | "static">(() =>
    forceStatic || !webglAvailable() ? "static" : "pixi",
  );
  const [busy, setBusy] = useState(true);
  const [ground, setGround] = useState<string | undefined>(undefined);
  const [plateUrl, setPlateUrl] = useState<string | null>(null);
  const [plateSource, setPlateSource] = useState<"baked" | "painted" | undefined>(undefined);
  const [tier, setTier] = useState<Tier | undefined>(undefined);
  const [stageReady, setStageReady] = useState(0);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  const slowRef = useRef(onTooSlow);
  slowRef.current = onTooSlow;

  useImperativeHandle(ref, () => ({
    zoom: (f) => stage.current?.nudge(0, 0, f),
    pan: (dx, dy) => stage.current?.nudge(dx, dy),
    reset: () => stage.current?.resetView(),
  }));

  /**
   * The camera, as CSS variables on the two places that read them (hotspots
   * and the scale bar), written only when it moved: the stage reports every frame.
   */
  const lastView = useRef("");
  // A new scene may mount a new scale bar: let the next frame write again.
  useEffect(() => {
    lastView.current = "";
  }, [sceneId]);
  const applyView = (v: ScreenView) => {
    const key = `${v.s}|${v.tx}|${v.ty}|${v.w}|${v.h}`;
    if (key === lastView.current) return;
    lastView.current = key;
    for (const el of document.querySelectorAll<HTMLElement>(".hotspots, .scalebar")) {
      el.style.setProperty("--vs", String(v.s));
      el.style.setProperty("--vtx", `${v.tx}px`);
      el.style.setProperty("--vty", `${v.ty}px`);
      el.style.setProperty("--vw", `${v.w}px`);
      el.style.setProperty("--vh", `${v.h}px`);
    }
  };

  // Pixi stage lifecycle.
  useEffect(() => {
    if (mode !== "pixi" || !host.current) return;
    let alive = true;
    let made: Stage | null = null;
    const el = host.current;
    void import("./stage")
      .then(({ createStage }) =>
        createStage({
          host: el,
          reducedMotion: reduced,
          onView: applyView,
          onGround: setGround,
          onBusy: setBusy,
          onPlate: setPlateSource,
          onTier: setTier,
          onTooSlow: () => {
            setMode("static");
            slowRef.current?.();
          },
        }),
      )
      .then((s) => {
        made = s;
        if (!alive) return s.destroy();
        stage.current = s;
        prev.current = null;
        setStageReady((n) => n + 1);
      })
      .catch(() => alive && setMode("static"));
    return () => {
      alive = false;
      made?.destroy();
      stage.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the stage is created once per mode
  }, [mode]);

  useEffect(() => stage.current?.setReducedMotion(reduced), [reduced, stageReady]);
  useEffect(() => stage.current?.setDim(dim), [dim, stageReady]);
  useEffect(() => stage.current?.setAmbient(ambient), [ambient, stageReady]);

  // Show the scene.
  useEffect(() => {
    const s = sceneById(sceneId);
    if (!s) return;
    if (mode === "pixi") {
      const st = stage.current;
      if (!st) return;
      const el = host.current;
      const how = arrival(prev.current, sceneId, !!el && el.clientHeight > el.clientWidth);
      prev.current = sceneId;
      setBusy(true);
      void st.show(s.recipe, s.seed, how, s.scale).then(() => {
        setBusy(false);
        readyRef.current?.();
      });
      return;
    }
    // Static plate: baked when one fits the viewport, else painted once per size; no motion.
    let alive = true;
    let url: string | null = null;
    const paintNow = async () => {
      const el = host.current;
      if (!el) return;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      const manifest = await loadManifest();
      const baked = manifest ? pickBaked(manifest, s.recipe, s.seed, w, h) : undefined;
      if (baked) {
        const img = new Image();
        img.src = bakedUrl(baked.flat);
        const ok = await img.decode().then(
          () => true,
          () => false,
        );
        if (!alive) return;
        if (ok) {
          setGround(baked.ground);
          setPlateUrl(img.src);
          setPlateSource("baked");
          applyView({ s: 1, tx: 0, ty: 0, w, h });
          setBusy(false);
          readyRef.current?.();
          return;
        }
      }
      void import("./painter/remote")
        .then(({ paintStaticOff }) => paintStaticOff(s.recipe, s.seed, w, h, 1))
        .then(({ plate, svg }) => {
          if (!alive) return;
          if (url) URL.revokeObjectURL(url);
          url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          setGround(plate.ground);
          setPlateUrl(url);
          setPlateSource("painted");
          applyView({ s: 1, tx: 0, ty: 0, w, h });
          setBusy(false);
          readyRef.current?.();
        });
    };
    void paintNow();
    let t = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(() => void paintNow(), 250);
    });
    if (host.current) ro.observe(host.current);
    return () => {
      alive = false;
      ro.disconnect();
      window.clearTimeout(t);
      if (url) URL.revokeObjectURL(url);
    };
  }, [sceneId, mode, stageReady]);

  return (
    <div
      className="world"
      style={ground ? { background: ground } : undefined}
      data-mode={mode}
      data-plate={plateSource}
      data-tier={mode === "pixi" ? tier : undefined}
    >
      <div ref={host} className="world-canvas" aria-hidden="true">
        {mode === "static" && plateUrl && <img src={plateUrl} alt="" className="world-plate" />}
      </div>
      {mode === "static" && dim && <div className="world-dim" aria-hidden="true" />}
      <div className="hotspots" data-busy={busy}>
        {children}
      </div>
    </div>
  );
}
