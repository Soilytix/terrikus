/** The shell: routes, the world, the HUD and every panel above it. */
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CHAPTERS, SCENES, chapter, fieldCard, sceneChapter, scene as sceneById } from "../content";
import { isLoaded, loadChapters } from "../content/load";
import type { SceneObject } from "../content/schema";
import type { Save } from "../save/schema";
import { World, type WorldHandle } from "../world/World";
import { Bench } from "../ui/Bench";
import { LabBench } from "../ui/LabBench";
import { StrawBench } from "../ui/NitrogenRelay";
import { Hotspots } from "../ui/Hotspots";
import { Hud } from "../ui/Hud";
import { MissionPanel } from "../ui/MissionPanel";
import { Notebook } from "../ui/Notebook";
import { Glossary } from "../ui/Glossary";
import { Help, Settings, Truth } from "../ui/Panels";
import { Recall } from "../ui/Recall";
import { ReviewOverlay } from "../ui/Review";
import { CardTray, ScanCard } from "../ui/ScanCard";
import { SoundCaptions } from "../ui/Sound";
import { Title } from "../ui/Title";
import {
  activeMission,
  begin,
  currentStep,
  glimpse as meetRumor,
  lensAvailable,
  recallOnReturn,
  scan,
  stepIndex,
  viewRumors,
  visibleObjects,
  visit,
  unlockAll,
} from "./progress";
import { href, parse, targetHref, type NotebookTab, type Route } from "./router";
import { prefersReduced, useGame } from "./store";

/** Dev-only beats surface: `?beats` in the URL, or the internal Settings switch. */
const BeatsDev = lazy(() => import("../ui/BeatsDev"));
const beatsParam = new URLSearchParams(window.location.search).has("beats");

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

/** The chapters a route draws on: its scene's and the last one's, every unlocked one, or all for the codex count and benches. */
function needs(route: Route, save: Save): string[] {
  if ((route.name === "notebook" && route.tab === "codex") || route.name === "bench")
    return CHAPTERS.map((c) => c.id);
  const last = save.lastSession?.route ? parse(save.lastSession.route) : null;
  const scenes = [route, last].flatMap((r) => (r?.name === "scene" ? [sceneChapter(r.scene) ?? ""] : []));
  return [...save.chaptersUnlocked, ...scenes];
}

// The first route's chapters start loading before the first render.
void loadChapters(needs(parse(getHash()), useGame.getState().save));
// The music engine too, ahead of the world's plates: the title waits on it before Begin.
if (useGame.getState().save.settings.sound) void import("../audio/music/engine");

/** Holds the previous route on screen until the next one's chapter content has loaded. */
export function App() {
  const hash = useSyncExternalStore(subscribeHash, getHash);
  const save = useGame((g) => g.save);
  const want = needs(parse(hash), save);
  const [shown, setShown] = useState<string | null>(null);
  const [, setLoads] = useState(0);
  const ready = want.every(isLoaded);
  useEffect(() => {
    if (ready) return;
    let live = true;
    void loadChapters(want).then(() => {
      if (live) setLoads((n) => n + 1);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by the chapter set
  }, [want.join()]);
  useEffect(() => {
    if (ready) setShown(hash);
  }, [ready, hash]);
  const view = ready ? hash : shown;
  return view === null ? null : <Shell hash={view} />;
}

function Shell({ hash }: { hash: string }) {
  const route = parse(hash);
  const { save, update, replace, reset, persistent } = useGame();
  const reduced = useReducedMotion(save.settings.motion);
  const forceStatic = useMemo(() => new URLSearchParams(window.location.search).has("static"), []);
  const world = useRef<WorldHandle>(null);
  const [tooSlow, setTooSlow] = useState(false);
  const [beats, setBeats] = useState(beatsParam);
  const [scanned, setScanned] = useState<SceneObject | null>(null);
  const [panel, setPanel] = useState<"truth" | "settings" | "help" | "glossary" | null>(null);
  const [focusCard, setFocusCard] = useState<string | undefined>(undefined);
  const [narration, setNarration] = useState("");
  const [recall, setRecall] = useState<ReturnType<typeof recallOnReturn>>([]);
  // Until the new scene has arrived the ladder stays tucked away and arrival cards wait.
  const [arrived, setArrived] = useState<string | null>(null);
  const [seen, setSeen] = useState(
    () => save.discoveries.length + save.codex.length + Object.keys(save.cards).length,
  );

  // Cards picked up this visit stack in the tray until opened.
  const [tray, setTray] = useState<string[]>([]);
  const had = useRef(new Set(Object.keys(save.cards)));
  useEffect(() => {
    const got = Object.keys(save.cards).filter((id) => !had.current.has(id));
    got.forEach((id) => had.current.add(id));
    const cards = got.filter((id) => fieldCard(id));
    if (cards.length) setTray((t) => [...t, ...cards]);
  }, [save.cards]);

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
        )?.id ??
        CHAPTERS.findLast((c) => c.playable && save.chaptersUnlocked.includes(c.id))?.id ??
        "prologue");
  const mission = activeMission(chapterId, save);

  useEffect(() => {
    if (__SW_PROFILE__ === "internal" && new URLSearchParams(window.location.search).has("unlock"))
      update(unlockAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on load
  }, []);

  // Arrivals: stamps, `go` steps, and where to resume.
  useEffect(() => {
    if (route.name !== "scene") return;
    const from = last?.name === "scene" ? sceneById(last.scene)?.chapter : undefined;
    setRecall(recallOnReturn(save, route.scene, from));
    update((s) => ({
      ...visit(s, route.scene),
      lastSession: { route: href(route), at: new Date().toISOString() },
    }));
    setScanned(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per scene
  }, [route.name === "scene" ? route.scene : null]);

  // Each opening of the Rumor Map is a view (WB§7.1 "where to look").
  useEffect(() => {
    if (route.name === "notebook" && route.tab === "rumors") update(viewRumors);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opening
  }, [route.name === "notebook" && route.tab === "rumors"]);

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
      if (o.to) update((s) => meetRumor(s, o.to!));
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
  const openCard = (id: string) => {
    setTray((t) => t.filter((x) => x !== id));
    setFocusCard(id);
    openNotebook("cards");
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
    if (route.bench === "straw-n")
      return (
        <div className="app app-bench">
          <StrawBench backHref={backHref} />
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
    <div
      className="app"
      data-route={route.name}
      data-tray={tray.length > 0}
      data-tone={scene.tone}
      data-arriving={arrived !== scene.id}
    >
      <World
        ref={world}
        sceneId={scene.id}
        reduced={reduced}
        ambient={save.settings.ambient}
        forceStatic={forceStatic}
        dim={notebookOpen || !!panel}
        onReady={setArrived}
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
            open={scanned?.id}
          />
        )}
      </World>
      <SoundCaptions scene={scene} reduced={reduced} />
      {beats && (
        <Suspense fallback={null}>
          <BeatsDev />
        </Suspense>
      )}

      {route.name === "title" ? (
        <Title
          save={save}
          resumeLabel={resumeScene?.title ?? "the spinach field"}
          birds={!reduced && !forceStatic && save.settings.ambient}
          sound={
            save.settings.sound && save.settings.ambient
              ? (sceneById(resumeScene?.id ?? "p-field-dawn") ?? null)
              : null
          }
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
            sceneEvent={(name, value) => world.current?.event(name, value)}
          />
          {scanned && (
            <ScanCard
              object={scanned}
              glimpse={
                glimpse
                  ? {
                      number: glimpse.number,
                      title: glimpse.title,
                      hook: glimpse.hook,
                      open: save.chaptersUnlocked.includes(glimpse.id),
                    }
                  : undefined
              }
              onClose={() => setScanned(null)}
              onOpenCard={openCard}
            />
          )}
          <CardTray ids={tray} onOpen={openCard} />
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
      {recall.length > 0 && arrived === scene.id && <Recall cards={recall} onClose={() => setRecall([])} />}
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
          onUnlockAll={__SW_PROFILE__ === "internal" ? () => update(unlockAll) : undefined}
          beats={__SW_PROFILE__ === "internal" ? beats : undefined}
          onBeats={setBeats}
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
