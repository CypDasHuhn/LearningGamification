import { useRef, useEffect } from "react";
import { Link, useNavigate, redirect, useLoaderData } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import {
  parseAuthFromCookieHeader,
  isGuestFromCookieHeader,
} from "~/lib/auth-cookies";
import { apiGetServer } from "~/lib/api-server";
import type { ThemeResponse } from "~/lib/api";
import { useGameLoop } from "~/hooks/useGameLoop";
import { useDragScroll } from "~/hooks/useDragScroll";

import type { Level } from "../components/types";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  NODE_RADIUS,
} from "../components/mapConstants";
import { generateDecorationPositions } from "../components/design/positions/mapDecorations";
import {
  buildPathSamples,
  findClosestSampleIndex,
  findNearestByX,
} from "../components/design/positions/pathUtils";
import {
  TreeSVG,
  RockSVG,
  FlowerSVG,
} from "../components/design/structures/MapDecorationsSVG";
import { PlatformSVG } from "../components/design/structures/PlatformSVG";

// All chapters share the same Y so they sit on the flat runway centerline.
const RUNWAY_Y = 215;
const CHAPTER_START_X = 300;
const CHAPTER_END_PADDING = 300;
const CHAPTER_MAX_SPACING = 620;
const CHAPTER_MIN_SPACING = NODE_RADIUS * 2 + 50;

const FALLBACK_CHAPTERS: Level[] = [
  { id: 1, x: 300, y: RUNWAY_Y, stars: 1, title: "Einführung" },
  { id: 2, x: 920, y: RUNWAY_Y, stars: 0, title: "Variablen" },
  { id: 3, x: 1540, y: RUNWAY_Y, stars: -1, title: "Schleifen" },
];

function computeChapterSpacing(chapterCount: number): number {
  if (chapterCount <= 1) return CHAPTER_MAX_SPACING;

  const availableWidth = MAP_WIDTH - CHAPTER_START_X - CHAPTER_END_PADDING;
  const fitSpacing = Math.floor(availableWidth / (chapterCount - 1));
  return Math.max(CHAPTER_MIN_SPACING, Math.min(CHAPTER_MAX_SPACING, fitSpacing));
}

function computeMapWidth(chapters: Level[]): number {
  if (chapters.length === 0) return MAP_WIDTH;
  const maxX = chapters.reduce(
    (largestX, chapter) => Math.max(largestX, chapter.x),
    CHAPTER_START_X,
  );
  return Math.max(MAP_WIDTH, maxX + CHAPTER_END_PADDING);
}

/**
 * Converts the API theme list to the flat `Level[]` format used by the map.
 * Falls back to {@link FALLBACK_CHAPTERS} when the list is empty.
 *
 * @param themes - Themes returned by `GET /themes`.
 * @returns Chapter level array with fixed x-positions and progressive unlock state.
 */
function themesToChapters(themes: ThemeResponse[]): Level[] {
  if (themes.length === 0) return FALLBACK_CHAPTERS;
  const chapterSpacing = computeChapterSpacing(themes.length);

  return themes.map((t, i) => ({
    id: t.themeId,
    x: CHAPTER_START_X + i * chapterSpacing,
    y: RUNWAY_Y,
    stars: i === 0 ? 1 : i === 1 ? 0 : -1,
    title: t.name,
  }));
}

/**
 * Server loader — redirects unauthenticated (non-guest) visitors to `/` and
 * fetches the theme list to populate the runway map.
 */
export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const hasAuth  = parseAuthFromCookieHeader(cookieHeader) !== null;
  const isGuest  = isGuestFromCookieHeader(cookieHeader);
  if (!hasAuth && !isGuest) return redirect("/");
  const themes   = await apiGetServer<ThemeResponse[]>(cookieHeader, "/themes");
  const chapters = themes ? themesToChapters(themes) : FALLBACK_CHAPTERS;
  return { chapters };
}

// ─── Runway dimensions ────────────────────────────────────────────────────────
const RW_TOP    = 181;
const RW_BOTTOM = 249;
const RW_HEIGHT = RW_BOTTOM - RW_TOP;
const RW_CENTER = (RW_TOP + RW_BOTTOM) / 2;

// ─── Jet sprite ───────────────────────────────────────────────────────────────
const JET_H = 36;
const JET_KEYFRAMES = `
@keyframes jetIdle {
  0%,100% { transform: translateX(-50%); }
  30%      { transform: translateX(calc(-50% + 0.6px)); }
  70%      { transform: translateX(calc(-50% - 0.6px)); }
}
`;

/** CSS div-based private jet sprite used on the chapter-selection runway. */
function JetSprite({
  facingLeft = false,
  isMoving   = false,
}: {
  facingLeft?: boolean;
  isMoving?:   boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 84,
        height: JET_H,
        transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
        filter: "drop-shadow(1px 5px 2px rgba(0,0,0,0.6))",
      }}
    >
      {/* ── Fuselage ── */}
      <div style={{ position: "absolute", left: 10, top: 10, width: 60, height: 16, background: "#f1f5f9", borderRadius: "4px 50% 50% 4px" }} />
      {/* ── Nose / cockpit ── */}
      <div style={{ position: "absolute", left: 58, top: 7, width: 26, height: 22, background: "#93c5fd", borderRadius: "2px 60% 60% 2px" }} />
      {/* ── Gold accent stripe ── */}
      <div style={{ position: "absolute", left: 10, top: 17, width: 52, height: 4, background: "#fbbf24" }} />
      {/* ── Windows ── */}
      {[44, 34, 22].map((wx) => (
        <div key={wx} style={{ position: "absolute", left: wx, top: 11, width: 7, height: 7, background: "#1d4ed8", borderRadius: 2, opacity: 0.85 }} />
      ))}
      {/* ── Main wing (below fuselage) ── */}
      <div style={{ position: "absolute", left: 20, top: 24, width: 38, height: 12, background: "#e2e8f0", borderRadius: "1px 3px 6px 1px", transform: "skewX(14deg)" }} />
      {/* ── Vertical tail fin ── */}
      <div style={{ position: "absolute", left: 7, top: 1, width: 12, height: 14, background: "#e2e8f0", borderRadius: "4px 4px 0 0", transform: "skewX(10deg)" }} />
      {/* ── Horizontal tail wing ── */}
      <div style={{ position: "absolute", left: 3, top: 19, width: 22, height: 7, background: "#e2e8f0", borderRadius: "2px 4px 4px 2px" }} />
      {/* ── Engine exhaust ── */}
      <div style={{
        position: "absolute", left: -5, top: 15, width: 16, height: 6,
        background: "linear-gradient(to left, #fbbf24 0%, #f97316 55%, transparent 100%)",
        borderRadius: "4px 0 0 4px",
        opacity: isMoving ? 1 : 0.45,
        transition: "opacity 0.15s",
      }} />
    </div>
  );
}

// ─── Chapter node overlay ─────────────────────────────────────────────────────
/** Clickable label overlay rendered above each chapter platform node. */
function ChapterNode({ chapter }: { chapter: Level }) {
  const isLocked = chapter.stars === -1;

  return (
    <div
      className="absolute flex flex-col items-center gap-1.5"
      style={{
        left: chapter.x,
        top: chapter.y - NODE_RADIUS,
        transform: "translateX(-50%)",
        width: NODE_RADIUS * 2 + 48,
        pointerEvents: "none",
      }}
    >
      {isLocked ? (
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: NODE_RADIUS * 2, height: NODE_RADIUS * 2, fontSize: "28px" }}
        >
          🔒
        </div>
      ) : (
        <Link
          to={`/level-selection?chapter=${chapter.id}`}
          className="flex items-center justify-center rounded-full font-pixel hover:scale-110 active:scale-95 transition-transform"
          style={{
            width: NODE_RADIUS * 2,
            height: NODE_RADIUS * 2,
            fontSize: "18px",
            color: "#1c1917",
            textShadow: "1px 1px 0 rgba(255,255,255,0.7)",
            pointerEvents: "all",
          }}
        >
          {chapter.id}
        </Link>
      )}
      <div
        className="font-pixel text-center leading-tight"
        style={{
          fontSize: "9px",
          color: "#f5f0e8",
          textShadow: "1px 1px 0 rgba(0,0,0,0.9)",
          maxWidth: NODE_RADIUS * 2 + 48,
          pointerEvents: "none",
        }}
      >
        {chapter.title.toUpperCase()}
      </div>
    </div>
  );
}

// ─── Runway SVG ───────────────────────────────────────────────────────────────
/** SVG runway strip with edge lines, center dashes, and touchdown zone markings. */
function RunwaySVG({
  chapters,
  mapWidth,
}: {
  chapters: Level[];
  mapWidth: number;
}) {
  const dashCount = Math.ceil(mapWidth / 50);
  const dashW = 32;
  const dashH = 8;
  const dashY = RW_CENTER - dashH / 2;

  return (
    <g>
      {/* Gravel shoulder */}
      <rect x={0} y={RW_TOP - 8} width={mapWidth} height={RW_HEIGHT + 16} fill="#5c5c46" />
      {/* Asphalt surface */}
      <rect x={0} y={RW_TOP} width={mapWidth} height={RW_HEIGHT} fill="#373737" />
      {/* Top highlight */}
      <rect x={0} y={RW_TOP} width={mapWidth} height={6} fill="rgba(255,255,255,0.04)" />
      {/* White edge lines */}
      <rect x={0} y={RW_TOP} width={mapWidth} height={5} fill="white" opacity={0.85} />
      <rect x={0} y={RW_BOTTOM - 5} width={mapWidth} height={5} fill="white" opacity={0.85} />

      {/* Yellow center dashes */}
      {Array.from({ length: dashCount }, (_, i) => (
        <rect
          key={i}
          x={i * 50 + 4}
          y={dashY}
          width={dashW}
          height={dashH}
          rx={2}
          fill="#fbbf24"
          opacity={0.72}
        />
      ))}

      {/* Touchdown zone markings at each chapter */}
      {chapters.map((ch) =>
        ([-1, 1] as const).map((side) =>
          [0, 1, 2, 3].map((row) => {
            const blockH  = 9;
            const gap     = 3;
            const totalH  = 4 * blockH + 3 * gap;
            const startY  = RW_CENTER - totalH / 2;
            const bx      = side === -1 ? ch.x - 38 : ch.x + 28;
            const by      = startY + row * (blockH + gap);
            return (
              <rect
                key={`${ch.id}-${side}-${row}`}
                x={bx}
                y={by}
                width={10}
                height={blockH}
                rx={1}
                fill="white"
                opacity={0.65}
              />
            );
          }),
        ),
      )}
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * Chapter-selection map screen.
 *
 * Renders a runway where the user taxis a private jet to any unlocked chapter
 * node and presses Enter (or clicks the node) to enter that chapter's
 * level-selection screen.
 */
export default function ChapterSelection() {
  const { chapters } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const mapWidth = computeMapWidth(chapters);

  const pathSamples = useRef<{ x: number; y: number }[]>([]);
  if (pathSamples.current.length === 0 && chapters.length > 1) {
    pathSamples.current = buildPathSamples(chapters, 150);
  }
  const samples = pathSamples.current;

  const decorations = useRef<ReturnType<typeof generateDecorationPositions>>(
    generateDecorationPositions(chapters),
  );
  const { trees, rocks, flowers } = decorations.current;

  const lastUnlockedIndex = chapters.reduce(
    (last, ch, idx) => (ch.stars !== -1 ? idx : last),
    0,
  );
  const maxReachableSampleIndex =
    samples.length > 0
      ? findClosestSampleIndex(samples, chapters[lastUnlockedIndex])
      : 0;

  const startChapter =
    chapters.find((c) => c.stars === 0) ?? chapters[lastUnlockedIndex];
  const initialSampleIndex =
    samples.length > 0 ? findClosestSampleIndex(samples, startChapter) : 0;

  const { ref: scrollContainerRef, handlers: dragHandlers } = useDragScroll();
  const {
    sampleIndex: characterSampleIndex,
    sampleIndexRef: characterSampleIndexRef,
    facingLeft: isFacingLeft,
    isMoving,
  } = useGameLoop({
    samples,
    maxSampleIndex: maxReachableSampleIndex,
    scrollRef: scrollContainerRef,
    initialSampleIndex,
  });

  const characterPosition = samples[characterSampleIndex] ?? {
    x: chapters[0]?.x ?? 0,
    y: chapters[0]?.y ?? 0,
  };

  const nearestChapter = chapters.length > 0
    ? findNearestByX(chapters, characterPosition.x)
    : null;

  const isCharacterOnNode =
    nearestChapter !== null &&
    Math.abs(nearestChapter.x - characterPosition.x) < NODE_RADIUS;

  const currentProgressChapter = chapters.find((c) => c.stars === 0);

  // Enter key — navigate to the nearest unlocked chapter's level-selection.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") return;
      const pos = samples[characterSampleIndexRef.current];
      if (!pos || chapters.length === 0) return;
      const nearest = findNearestByX(chapters, pos.x);
      if (nearest.stars !== -1 && Math.abs(nearest.x - pos.x) < NODE_RADIUS) {
        navigate(`/level-selection?chapter=${nearest.id}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, samples, chapters, characterSampleIndexRef]);

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <style>{JET_KEYFRAMES}</style>

      <IngameHeader siteName="Kapitel Auswahl" backTo="/" backLabel="MENÜ" />

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="flex items-center w-full gap-2 px-2">
          <button
            onClick={() => scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
            className="shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all"
            style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
            aria-label="Scroll left"
          >
            ◀
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-scroll overflow-y-hidden select-none rounded-xl border-4 border-stone-800/40"
            style={{ cursor: "grab" }}
            {...dragHandlers}
          >
            <div className="relative" style={{ width: mapWidth, height: MAP_HEIGHT }}>
              <svg
                className="absolute inset-0 pointer-events-none"
                width={mapWidth}
                height={MAP_HEIGHT}
              >
                {/* ── Grass background ── */}
                <rect width={mapWidth} height={MAP_HEIGHT} fill="#3d7a20" />
                {Array.from({ length: Math.ceil(mapWidth / 600) }).map((_, segmentIndex) => (
                  <rect
                    key={segmentIndex}
                    x={segmentIndex * 600}
                    y={0}
                    width={600}
                    height={MAP_HEIGHT}
                    fill={segmentIndex % 2 === 0 ? "#448c22" : "#3a7018"}
                    opacity={segmentIndex % 2 === 0 ? 0.25 : 0.20}
                  />
                ))}

                {/* ── Decorations behind runway ── */}
                {rocks.map((rock, i) => (
                  <RockSVG key={i} x={rock.x} y={rock.y} scale={rock.scale} />
                ))}
                {flowers.map((flower, i) => (
                  <FlowerSVG key={i} x={flower.x} y={flower.y} color={flower.color} />
                ))}

                {/* ── Runway ── */}
                <RunwaySVG chapters={chapters} mapWidth={mapWidth} />

                {/* ── Platform nodes ── */}
                {chapters.map((ch) => (
                  <PlatformSVG
                    key={ch.id}
                    x={ch.x}
                    y={ch.y}
                    isCompleted={ch.stars > 0}
                    isCurrent={currentProgressChapter?.id === ch.id}
                    isLocked={ch.stars === -1}
                    isCharacterNearby={isCharacterOnNode && nearestChapter?.id === ch.id}
                  />
                ))}

                {/* ── Trees in front ── */}
                {trees.map((tree, i) => (
                  <TreeSVG key={i} x={tree.x} y={tree.y} scale={tree.scale} />
                ))}
              </svg>

              {/* ── Chapter node overlays ── */}
              {chapters.map((ch) => (
                <ChapterNode key={ch.id} chapter={ch} />
              ))}

              {/* ── Jet ── */}
              {samples.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: characterPosition.x,
                    top: characterPosition.y - JET_H / 2,
                    animation: isMoving ? undefined : "jetIdle 2s ease-in-out infinite",
                    pointerEvents: "none",
                    zIndex: 20,
                    willChange: "transform",
                  }}
                >
                  <JetSprite facingLeft={isFacingLeft} isMoving={isMoving} />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
            className="shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all"
            style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>

        <p
          className="mt-3 font-pixel text-stone-600 dark:text-stone-400 opacity-60"
          style={{ fontSize: "8px" }}
        >
          ← → TAXI &nbsp;|&nbsp; ↵ KAPITEL STARTEN
        </p>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 py-4 bg-stone-900/50 dark:bg-stone-950/70 border-t-2 border-stone-700 dark:border-stone-800">
        <Link
          to="/einstellungen"
          className="font-pixel text-xs sm:text-sm text-stone-300 hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors"
        >
          Einstellungen...
        </Link>
      </footer>

      <div className="flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs">
        <span>Learning Gamification v1.0</span>
        <span className="opacity-80">© 2025</span>
      </div>
    </main>
  );
}
