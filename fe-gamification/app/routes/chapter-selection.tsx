import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, redirect, useLoaderData } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import {
  parseAuthFromCookieHeader,
  isGuestFromCookieHeader,
} from "~/lib/auth-cookies";
import { apiGetServer } from "~/lib/api-server";
import type { ThemeResponse } from "~/lib/api";

import type { Level } from "../components/types";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  NODE_RADIUS,
  CHARACTER_WALK_SPEED,
} from "../components/mapConstants";
import { generateDecorationPositions } from "../components/design/positions/mapDecorations";
import {
  buildPathSamples,
  findClosestSampleIndex,
} from "../components/design/positions/pathUtils";
import {
  TreeSVG,
  RockSVG,
  FlowerSVG,
} from "../components/design/structures/MapDecorationsSVG";
import { PlatformSVG } from "../components/design/structures/PlatformSVG";

// All chapters share the same Y so they sit on the flat runway centerline
const RUNWAY_Y = 215;

const FALLBACK_CHAPTERS: Level[] = [
  { id: 1, x: 300, y: RUNWAY_Y, stars: 1, title: "Einführung" },
  { id: 2, x: 920, y: RUNWAY_Y, stars: 0, title: "Variablen" },
  { id: 3, x: 1540, y: RUNWAY_Y, stars: -1, title: "Schleifen" },
];

function themesToChapters(themes: ThemeResponse[]): Level[] {
  if (themes.length === 0) return FALLBACK_CHAPTERS;
  const xPositions = [300, 920, 1540];
  return themes.map((t, i) => ({
    id: t.themeId,
    x: xPositions[i % xPositions.length] ?? 300 + i * 620,
    y: RUNWAY_Y,
    stars: i === 0 ? 1 : i === 1 ? 0 : -1,
    title: t.name,
  }));
}

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const hasAuth = parseAuthFromCookieHeader(cookieHeader) !== null;
  const isGuest = isGuestFromCookieHeader(cookieHeader);
  if (!hasAuth && !isGuest) {
    return redirect("/");
  }
  const themes = await apiGetServer<ThemeResponse[]>(cookieHeader, "/themes");
  const chapters = themes ? themesToChapters(themes) : FALLBACK_CHAPTERS;
  return { chapters };
}

// ─── Runway dimensions ────────────────────────────────────────────────────────
const RW_TOP    = 181;          // top of asphalt
const RW_BOTTOM = 249;          // bottom of asphalt
const RW_HEIGHT = RW_BOTTOM - RW_TOP;  // 68 px
const RW_CENTER = (RW_TOP + RW_BOTTOM) / 2; // 215

// ─── Jet sprite ───────────────────────────────────────────────────────────────
const JET_H = 36;
const JET_KEYFRAMES = `
@keyframes jetIdle {
  0%,100% { transform: translateX(-50%); }
  30%      { transform: translateX(calc(-50% + 0.6px)); }
  70%      { transform: translateX(calc(-50% - 0.6px)); }
}
`;

function JetSprite({
  facingLeft = false,
  isMoving = false,
}: {
  facingLeft?: boolean;
  isMoving?: boolean;
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
function ChapterNode({
  chapter,
}: {
  chapter: Level;
}) {
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
function RunwaySVG({ chapters }: { chapters: Level[] }) {
  const dashCount = Math.ceil(MAP_WIDTH / 50);
  const dashW = 32;
  const dashH = 8;
  const dashY = RW_CENTER - dashH / 2;

  return (
    <g>
      {/* Gravel shoulder */}
      <rect x={0} y={RW_TOP - 8} width={MAP_WIDTH} height={RW_HEIGHT + 16} fill="#5c5c46" />
      {/* Asphalt surface */}
      <rect x={0} y={RW_TOP} width={MAP_WIDTH} height={RW_HEIGHT} fill="#373737" />
      {/* Top highlight */}
      <rect x={0} y={RW_TOP} width={MAP_WIDTH} height={6} fill="rgba(255,255,255,0.04)" />
      {/* White edge lines */}
      <rect x={0} y={RW_TOP}      width={MAP_WIDTH} height={5} fill="white" opacity={0.85} />
      <rect x={0} y={RW_BOTTOM - 5} width={MAP_WIDTH} height={5} fill="white" opacity={0.85} />

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
            const blockH = 9;
            const gap = 3;
            const totalH = 4 * blockH + 3 * gap; // 45 px
            const startY = RW_CENTER - totalH / 2;
            const bx = side === -1 ? ch.x - 38 : ch.x + 28;
            const by = startY + row * (blockH + gap);
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
export default function ChapterSelection() {
  const { chapters } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const animationFrameRef = useRef<number>(0);
  const pressedKeys = useRef({ left: false, right: false });

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

  const startChapter = chapters.find((c) => c.stars === 0) ?? chapters[lastUnlockedIndex];
  const initialSampleIndex =
    samples.length > 0 ? findClosestSampleIndex(samples, startChapter) : 0;

  const characterSampleIndexRef = useRef<number>(initialSampleIndex);
  const [characterSampleIndex, setCharacterSampleIndex] = useState<number>(initialSampleIndex);
  const [isFacingLeft, setIsFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const isFacingLeftRef = useRef(false);

  const characterPosition = samples[characterSampleIndex] ?? {
    x: chapters[0]?.x ?? 0,
    y: chapters[0]?.y ?? 0,
  };

  const nearestChapter = chapters.reduce<Level>(
    (nearest, ch) =>
      Math.abs(ch.x - characterPosition.x) < Math.abs(nearest.x - characterPosition.x)
        ? ch
        : nearest,
    chapters[0],
  );

  const isCharacterOnNode =
    nearestChapter &&
    Math.abs(nearestChapter.x - characterPosition.x) < NODE_RADIUS;

  const currentProgressChapter = chapters.find((c) => c.stars === 0);

  useEffect(() => {
    if (samples.length === 0) return;

    function gameLoop() {
      const { left, right } = pressedKeys.current;
      let moved = false;

      if (right && !left) {
        const next = Math.min(
          characterSampleIndexRef.current + CHARACTER_WALK_SPEED,
          maxReachableSampleIndex,
        );
        if (next !== characterSampleIndexRef.current) {
          characterSampleIndexRef.current = next;
          setCharacterSampleIndex(next);
          if (isFacingLeftRef.current) { isFacingLeftRef.current = false; setIsFacingLeft(false); }
          moved = true;
        }
      } else if (left && !right) {
        const next = Math.max(characterSampleIndexRef.current - CHARACTER_WALK_SPEED, 0);
        if (next !== characterSampleIndexRef.current) {
          characterSampleIndexRef.current = next;
          setCharacterSampleIndex(next);
          if (!isFacingLeftRef.current) { isFacingLeftRef.current = true; setIsFacingLeft(true); }
          moved = true;
        }
      }

      setIsMoving(moved);

      if (moved && scrollContainerRef.current && samples[characterSampleIndexRef.current]) {
        const containerWidth = scrollContainerRef.current.clientWidth;
        const targetScrollLeft = samples[characterSampleIndexRef.current].x - containerWidth / 2;
        scrollContainerRef.current.scrollLeft +=
          (targetScrollLeft - scrollContainerRef.current.scrollLeft) * 0.08;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [samples, maxReachableSampleIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft")  { event.preventDefault(); pressedKeys.current.left = true; }
      if (event.key === "ArrowRight") { event.preventDefault(); pressedKeys.current.right = true; }
      if (event.key === "Enter") {
        const pos = samples[characterSampleIndexRef.current];
        if (!pos) return;
        const nearest = chapters.reduce<Level>(
          (acc, ch) =>
            Math.abs(ch.x - pos.x) < Math.abs(acc.x - pos.x) ? ch : acc,
          chapters[0],
        );
        if (nearest && nearest.stars !== -1 && Math.abs(nearest.x - pos.x) < NODE_RADIUS) {
          navigate(`/level-selection?chapter=${nearest.id}`);
        }
      }
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "ArrowLeft")  pressedKeys.current.left = false;
      if (event.key === "ArrowRight") pressedKeys.current.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [navigate, samples]);

  function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    dragState.current = {
      active: true,
      startX: event.pageX - (scrollContainerRef.current?.offsetLeft ?? 0),
      scrollLeft: scrollContainerRef.current?.scrollLeft ?? 0,
    };
    if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = "grabbing";
  }
  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!dragState.current.active || !scrollContainerRef.current) return;
    event.preventDefault();
    const currentX = event.pageX - scrollContainerRef.current.offsetLeft;
    scrollContainerRef.current.scrollLeft =
      dragState.current.scrollLeft - (currentX - dragState.current.startX) * 1.4;
  }
  function onDragEnd() {
    dragState.current.active = false;
    if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = "grab";
  }

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
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
          >
            <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
              <svg
                className="absolute inset-0 pointer-events-none"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              >
                {/* ── Grass background ── */}
                <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#3d7a20" />
                <rect x={0}    y={0} width={600} height={MAP_HEIGHT} fill="#448c22" opacity={0.25} />
                <rect x={700}  y={0} width={500} height={MAP_HEIGHT} fill="#3a7018" opacity={0.20} />
                <rect x={1300} y={0} width={540} height={MAP_HEIGHT} fill="#448c22" opacity={0.22} />

                {/* ── Decorations behind runway ── */}
                {rocks.map((rock, i) => (
                  <RockSVG key={i} x={rock.x} y={rock.y} scale={rock.scale} />
                ))}
                {flowers.map((flower, i) => (
                  <FlowerSVG key={i} x={flower.x} y={flower.y} color={flower.color} />
                ))}

                {/* ── Runway ── */}
                <RunwaySVG chapters={chapters} />

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
