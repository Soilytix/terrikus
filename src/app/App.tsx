/** The shell: routes, the world, the HUD and every panel above it. */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CHAPTERS, SCENES, chapter, scene as sceneById } from "../content";
import type { SceneObject } from "../content/schema";
import { World, type WorldHandle } from "../world/World";
import { Bench } from "../ui/Bench";
import { LabBench } from "../ui/LabBench";
import { Hotspots } from "../ui/Hotspots";
import { Hud } from "../ui/Hud";
import { MissionPanel } from "../ui/MissionPanel";
import { Notebook } from "../ui/Notebook";
import { Glossary } from "../ui/Glossary";
import { Help, Settings, Truth } from "../ui/Panels";
import { ReviewOverlay } from "../ui/Review";
import { ScanCard } from "../ui/ScanCard";
import { Title } from "../ui/Title";
import {
  activeMission,
  begin,
  currentStep,
  lensAvailable,
  scan,
  stepIndex,
  visibleObjects,
  visit,
} from "./progress";
import { href, parse, targetHref, type NotebookTab } from "./router";
import { prefersReduced, useGame } from "./store";

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const getHash = () => window.location.hash;

function useReducedMotion(setting: Parameters<typeof prefersReduced>[0]) {
  const [sys, setSys] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setSys((n) => n + 1);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sys re-reads the media query
  return useMemo(() => prefersReduced(setting), [setting, sys]);
}

/** Which visible portal in `from` leads (eventually) to `to`? */
function towards(fromId: string, to: string, visible: SceneObject[]): string | undefined {
  for (const o of visible) {
    if (o.kind !== "portal" || !o.to || o.to.startsWith("#")) continue;
    const seen = new Set([fromId]);
    const queue = [o.to];
    while (queue.length) {
      const id = queue.shift()!;
      if (id === to) return o.id;
      if (seen.has(id)) continue;
      seen.add(id);
      for (const x of sceneById(id)?.objects ?? [])
        if (x.kind === "portal" && x.to && !x.to.startsWith("#")) queue.push(x.to);
    }
  }
  return undefined;
}

/** The scene whose portal opens this bench route: where the bench returns to without a session. */
const benchScene = (route: string) =>
  SCENES.find((s) => s.objects.some((o) => o.to === route))?.id ?? "valley";

export function App() {
  const hash = useSyncExternalStore(subscribeHash, getHash);
  const route = parse(hash);
  const { save, update, replace, reset, persistent } = useGame();
  const reduced = useReducedMotion(save.settings.motion);
  const forceStatic = useMemo(() => new URLSearchParams(window.location.search).has("static"), []);
  const world = useRef<WorldHandle>(null);
  const [tooSlow, setTooSlow] = useState(false);
  const [scanned, setScanned] = useState<SceneObject | null>(null);
  const [panel, setPanel] = useState<"truth" | "settings" | "help" | "glossary" | null>(null);
  const [focusCard, setFocusCard] = useState<string | undefined>(undefined);
  const [narration, setNarration] = useState("");
  const [seen, setSeen] = useState(
    () => save.discoveries.length + save.codex.length + Object.keys(save.cards).length,
  );

  const go = useCallback((h: string) => {
    window.location.hash = h;
  }, []);

  // The scene in view: the route's, or the last one visited for overlays.
  const last = save.lastSession?.route ? parse(save.lastSession.route) : null;
  const lastScene = last?.name === "scene" ? last.scene : "valley";
  const sceneId = route.name === "scene" ? route.scene : route.name === "title" ? "valley" : lastScene;
  const scene = sceneById(sceneId) ?? sceneById("valley")!;
  const chapterId =
    scene.chapter !== "valley"
      ? scene.chapter
      : (CHAPTERS.find(
          (c) => c.playable && save.chaptersUnlocked.includes(c.id) && !save.chaptersComplete.includes(c.id),
        )?.id ?? CHAPTERS.findLast((c) => c.playable)!.id);
  const mission = activeMission(chapterId, save);

  // Arrivals: stamps, `go` steps, and where to resume.
  useEffect(() => {
    if (route.name !== "scene") return;
    update((s) => ({
      ...visit(s, route.scene),
      lastSession: { route: href(route), at: new Date().toISOString() },
    }));
    setScanned(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per scene
  }, [route.name === "scene" ? route.scene : null]);

  useEffect(() => {
    if (mission && !save.missions[mission.id]) update((s) => begin(s, mission.id));
  }, [mission, save.missions, update]);

  const narrate = useCallback((t: string) => setNarration(t), []);
  useEffect(() => {
    if (route.name === "scene") narrate(`${scene.title}. ${scene.description}`);
  }, [route.name, scene, narrate]);

  const visible = visibleObjects(scene, save);
  const step = mission && currentStep(save, mission);
  const highlight = new Set<string>();
  if (mission && step) {
    if (step.kind === "scan" && mission.scene === scene.id) step.objects.forEach((o) => highlight.add(o));
    if (step.kind === "go" && step.object) highlight.add(step.object);
    if (step.kind === "bench") highlight.add("bench");
    if (mission.scene !== scene.id && step.kind !== "go") {
      const via = towards(scene.id, mission.scene, visible);
      if (via) highlight.add(via);
    }
  }
  // Nothing left to do: the valley still points at the chapter's way in.
  if (!mission && scene.id === "valley") {
    const entry = chapter(chapterId)?.entry;
    const way = visible.find((o) => o.kind === "portal" && o.to === entry);
    if (way) highlight.add(way.id);
  }

  const activate = (o: SceneObject) => {
    if (o.kind === "portal" && o.to) {
      setScanned(null);
      go(targetHref(o.to));
      return;
    }
    if (o.kind === "glimpse") {
      setScanned(o);
      if (o.to)
        update((s) =>
          s.rumors[`r-${o.to}`] ? s : { ...s, rumors: { ...s.rumors, [`r-${o.to}`]: "glimpsed" } },
        );
      return;
    }
    setScanned(o);
    update((s) => scan(s, scene.id, o.id));
    narrate(o.scan ?? o.label);
  };

  const notebookOpen = route.name === "notebook";
  // Without a tab asked for, open where the newest entries usually land: field cards, once there are any.
  const openNotebook = (tab: NotebookTab = Object.keys(save.cards).length ? "cards" : "rumors") => {
    setSeen(save.discoveries.length + save.codex.length + Object.keys(save.cards).length);
    go(href({ name: "notebook", tab }));
  };
  const closeNotebook = () => {
    setFocusCard(undefined);
    go(save.lastSession?.route ?? "#/");
  };
  const fresh = save.discoveries.length + save.codex.length + Object.keys(save.cards).length > seen;
  const up = scene.up ? () => go(targetHref(scene.up!)) : null;

  // Keyboard map (README "Controls"). One listener; it always calls the latest handler.
  const lastDismiss = useRef(0);
  const onKey = useRef<(e: KeyboardEvent) => void>(() => undefined);
  onKey.current = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    const k = e.key;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // An Esc that closed something must not, pressed again at once, also leave the scene.
    const dismissing = !!(t?.closest("dialog") ?? document.querySelector("dialog[open]"));
    if (k === "Escape" && dismissing) lastDismiss.current = performance.now();
    if (t && (t.closest("input, select, textarea") || t.closest("dialog"))) return;
    if (document.querySelector("dialog[open]")) return;
    if (k === "n" || k === "N") return void (notebookOpen ? closeNotebook() : openNotebook());
    if (k === "?") return setPanel("help");
    if (k === "g" || k === "G") return setPanel("glossary");
    if ((k === "l" || k === "L") && lensAvailable(save))
      return update((s) => ({ ...s, settings: { ...s.settings, lens: !s.settings.lens } }));
    if (route.name !== "scene") return;
    if (k === "Escape") {
      if (scanned) setScanned(null);
      else if (performance.now() - lastDismiss.current > 600) up?.();
      lastDismiss.current = performance.now();
      return;
    }
    if (k === "+" || k === "=") return world.current?.zoom(1.25);
    if (k === "-" || k === "_") return world.current?.zoom(0.8);
    const pan: Record<string, [number, number]> = {
      ArrowLeft: [-0.08, 0],
      ArrowRight: [0.08, 0],
      ArrowUp: [0, -0.08],
      ArrowDown: [0, 0.08],
    };
    if (pan[k]) {
      e.preventDefault();
      return world.current?.pan(...pan[k]);
    }
    if (k === "[" || k === "]") {
      const portals = [...document.querySelectorAll<HTMLButtonElement>('.hotspot[data-kind="portal"]')];
      if (!portals.length) return;
      const i = portals.indexOf(document.activeElement as HTMLButtonElement);
      const n = k === "]" ? (i + 1) % portals.length : (i - 1 + portals.length) % portals.length;
      portals[n]?.focus();
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (route.name === "bench") {
    const backHref = save.lastSession?.route ?? targetHref(benchScene(href(route)));
    if (route.bench === "lab-bench")
      return (
        <div className="app app-bench">
          <LabBench backHref={backHref} />
        </div>
      );
    return (
      <div className="app app-bench">
        <Bench
          bench={route.bench}
          save={save}
          update={update}
          go={go}
          reduced={reduced}
          backHref={backHref}
        />
      </div>
    );
  }

  const glimpse = scanned?.kind === "glimpse" && scanned.to ? chapter(scanned.to) : undefined;
  const resume = save.lastSession?.route ? parse(save.lastSession.route) : null;
  const resumeScene = resume?.name === "scene" ? sceneById(resume.scene) : undefined;

  return (
    <div className="app" data-route={route.name}>
      <World
        ref={world}
        sceneId={scene.id}
        reduced={reduced}
        forceStatic={forceStatic}
        dim={notebookOpen || !!panel}
        onTooSlow={() => setTooSlow(true)}
      >
        {route.name !== "title" && (
          <Hotspots
            objects={visible}
            scanned={(id) => save.scanned.includes(`${scene.id}/${id}`)}
            highlight={highlight}
            onActivate={activate}
            fresh={!save.scanned.some((k) => k.startsWith(`${scene.id}/`))}
            reduced={reduced}
          />
        )}
      </World>

      {route.name === "title" ? (
        <Title
          save={save}
          resumeLabel={resumeScene?.title ?? "the spinach field"}
          onStart={() => go(resumeScene ? save.lastSession!.route : targetHref("p-field-dawn"))}
        />
      ) : (
        <>
          <Hud
            scene={scene}
            stamps={save.stamps}
            onUp={up}
            onNotebook={() => openNotebook()}
            onTruth={() => setPanel("truth")}
            onSettings={() => setPanel("settings")}
            onHelp={() => setPanel("help")}
            notebookDot={fresh}
          />
          <p className="sr-only">{scene.description}</p>
          <MissionPanel
            key={`${mission ? `${mission.id}:${stepIndex(save, mission.id)}` : chapterId}@${scene.id}`}
            mission={mission}
            chapterId={chapterId}
            sceneId={scene.id}
            save={save}
            update={update}
            go={go}
            narrate={narrate}
            reduced={reduced || forceStatic}
          />
          {scanned && (
            <ScanCard
              object={scanned}
              glimpse={
                glimpse ? { number: glimpse.number, title: glimpse.title, hook: glimpse.hook } : undefined
              }
              onClose={() => setScanned(null)}
              onOpenCard={(id) => {
                setFocusCard(id);
                openNotebook("cards");
              }}
            />
          )}
        </>
      )}

      {notebookOpen && (
        <Notebook
          tab={route.tab}
          save={save}
          focusCard={focusCard}
          onTab={(t) => go(href({ name: "notebook", tab: t }))}
          onClose={closeNotebook}
        />
      )}
      {panel === "truth" && <Truth scene={scene} onClose={() => setPanel(null)} />}
      {panel === "help" && <Help onClose={() => setPanel(null)} onGlossary={() => setPanel("glossary")} />}
      {panel === "glossary" && <Glossary save={save} onClose={() => setPanel(null)} />}
      {panel === "settings" && (
        <Settings
          save={save}
          persistent={persistent}
          tooSlow={tooSlow}
          onMotion={(m) => update((s) => ({ ...s, settings: { ...s.settings, motion: m } }))}
          onReplace={replace}
          onReset={reset}
          onClose={() => setPanel(null)}
        />
      )}
      {__SW_PROFILE__ === "internal" && route.name !== "title" && <ReviewOverlay sceneId={scene.id} />}
      {!persistent && (
        <p className="persist-note">Progress is not being kept in this browser. Export it from Settings.</p>
      )}
      <div className="sr-only" aria-live="polite">
        {narration}
      </div>
    </div>
  );
}

export { SCENES };
