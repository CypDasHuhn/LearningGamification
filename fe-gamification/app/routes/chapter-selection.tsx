import { useRef } from "react";
import { Link, useNavigate, redirect, useLoaderData } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import {
  parseAuthFromCookieHeader,
  isGuestFromCookieHeader,
} from "~/lib/auth-cookies";
import { apiGetServer } from "~/lib/api-server";
import type { ThemeResponse } from "~/lib/api";
import type { Level } from "~/components/types";
import { MAP_WIDTH, MAP_HEIGHT, NODE_RADIUS } from "~/components/mapConstants";
import {
  TreeSVG,
  RockSVG,
  FlowerSVG,
} from "~/components/design/structures/MapDecorationsSVG";
import { PlatformSVG } from "~/components/design/structures/PlatformSVG";
import { useMapNavigation } from "~/hooks/useMapNavigation";
import { useScrollDrag } from "~/hooks/useScrollDrag";

// ─── Data / loader ────────────────────────────────────────────────────────────

const RUNWAY_Y = 215;

const FALLBACK_CHAPTERS: Level[] = [
  { id: 1, x: 300,  y: RUNWAY_Y, stars: 1,  title: "Einführung" },
  { id: 2, x: 920,  y: RUNWAY_Y, stars: 0,  title: "Variablen"  },
  { id: 3, x: 1540, y: RUNWAY_Y, stars: -1, title: "Schleifen"  },
];

function themesToChapters(themes: ThemeResponse[]): Level[] {
  if (themes.length === 0) return FALLBACK_CHAPTERS;
  const xSlots = [300, 920, 1540];
  return themes.map((t, i) => ({
    id: t.themeId,
    x: xSlots[i % xSlots.length] ?? 300 + i * 620,
    y: RUNWAY_Y,
    stars: i === 0 ? 1 : i === 1 ? 0 : -1,
    title: t.name,
  }));
}

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const hasAuth = parseAuthFromCookieHeader(cookieHeader) !== null;
  const isGuest = isGuestFromCookieHeader(cookieHeader);
  if (!hasAuth && !isGuest) return redirect("/");

  const themes = await apiGetServer<ThemeResponse[]>(cookieHeader, "/themes");
  return { chapters: themes ? themesToChapters(themes) : FALLBACK_CHAPTERS };
}

// ─── Runway constants & SVG ───────────────────────────────────────────────────

const RW_TOP    = 181;
const RW_BOTTOM = 249;
const RW_HEIGHT = RW_BOTTOM - RW_TOP;
const RW_CENTER = (RW_TOP + RW_BOTTOM) / 2;

function RunwaySVG({ chapters }: { chapters: Level[] }) {
  const dashCount = Math.ceil(MAP_WIDTH / 50);
  const dashY = RW_CENTER - 4;

  return (
    <g>
      <rect x={0} y={RW_TOP - 8} width={MAP_WIDTH} height={RW_HEIGHT + 16} fill="#5c5c46" />
      <rect x={0} y={RW_TOP}     width={MAP_WIDTH} height={RW_HEIGHT}       fill="#373737" />
      <rect x={0} y={RW_TOP}     width={MAP_WIDTH} height={6}               fill="rgba(255,255,255,0.04)" />
      <rect x={0} y={RW_TOP}         width={MAP_WIDTH} height={5} fill="white" opacity={0.85} />
      <rect x={0} y={RW_BOTTOM - 5}  width={MAP_WIDTH} height={5} fill="white" opacity={0.85} />

      {/* Centre dashes */}
      {Array.from({ length: dashCount }, (_, i) => (
        <rect key={i} x={i * 50 + 4} y={dashY} width={32} height={8} rx={2} fill="#fbbf24" opacity={0.72} />
      ))}

      {/* Touchdown zone markings */}
      {chapters.flatMap((ch) =>
        ([-1, 1] as const).flatMap((side) =>
          [0, 1, 2, 3].map((row) => {
            const blockH = 9;
            const gap    = 3;
            const totalH = 4 * blockH + 3 * gap;
            const by = RW_CENTER - totalH / 2 + row * (blockH + gap);
            const bx = side === -1 ? ch.x - 38 : ch.x + 28;
            return (
              <rect key={`${ch.id}-${side}-${row}`} x={bx} y={by} width={10} height={blockH} rx={1} fill="white" opacity={0.65} />
            );
          }),
        ),
      )}
    </g>
  );
}

// ─── Jet sprite ───────────────────────────────────────────────────────────────

const JET_H = 36;
const JET_KEYFRAMES = `
@keyframes jetIdle {
  0%,100% { transform: translateX(-50%); }
  30%     { transform: translateX(calc(-50% + 0.6px)); }
  70%     { transform: translateX(calc(-50% - 0.6px)); }
}
`;

function JetSprite({ facingLeft = false, isMoving = false }: { facingLeft?: boolean; isMoving?: boolean }) {
  return (
    <div style={{ position: "relative", width: 84, height: JET_H, transform: facingLeft ? "scaleX(-1)" : "scaleX(1)", filter: "drop-shadow(1px 5px 2px rgba(0,0,0,0.6))" }}>
      <div style={{ position: "absolute", left: 10, top: 10, width: 60, height: 16, background: "#f1f5f9", borderRadius: "4px 50% 50% 4px" }} />
      <div style={{ position: "absolute", left: 58, top: 7,  width: 26, height: 22, background: "#93c5fd", borderRadius: "2px 60% 60% 2px" }} />
      <div style={{ position: "absolute", left: 10, top: 17, width: 52, height: 4,  background: "#fbbf24" }} />
      {[44, 34, 22].map((wx) => (
        <div key={wx} style={{ position: "absolute", left: wx, top: 11, width: 7, height: 7, background: "#1d4ed8", borderRadius: 2, opacity: 0.85 }} />
      ))}
      <div style={{ position: "absolute", left: 20, top: 24, width: 38, height: 12, background: "#e2e8f0", borderRadius: "1px 3px 6px 1px", transform: "skewX(14deg)" }} />
      <div style={{ position: "absolute", left: 7,  top: 1,  width: 12, height: 14, background: "#e2e8f0", borderRadius: "4px 4px 0 0", transform: "skewX(10deg)" }} />
      <div style={{ position: "absolute", left: 3,  top: 19, width: 22, height: 7,  background: "#e2e8f0", borderRadius: "2px 4px 4px 2px" }} />
      <div style={{ position: "absolute", left: -5, top: 15, width: 16, height: 6,
        background: "linear-gradient(to left, #fbbf24 0%, #f97316 55%, transparent 100%)",
        borderRadius: "4px 0 0 4px", opacity: isMoving ? 1 : 0.45, transition: "opacity 0.15s" }} />
    </div>
  );
}

// ─── Chapter node overlay ─────────────────────────────────────────────────────

function ChapterNode({ chapter }: { chapter: Level }) {
  const isLocked = chapter.stars === -1;
  return (
    <div
      className="absolute flex flex-col items-center gap-1.5"
      style={{ left: chapter.x, top: chapter.y - NODE_RADIUS, transform: "translateX(-50%)", width: NODE_RADIUS * 2 + 48, pointerEvents: "none" }}
    >
      {isLocked ? (
        <div className="flex items-center justify-center rounded-full" style={{ width: NODE_RADIUS * 2, height: NODE_RADIUS * 2, fontSize: "28px" }}>
          🔒
        </div>
      ) : (
        <Link
          to={`/level-selection?chapter=${chapter.id}`}
          className="flex items-center justify-center rounded-full font-pixel hover:scale-110 active:scale-95 transition-transform"
          style={{ width: NODE_RADIUS * 2, height: NODE_RADIUS * 2, fontSize: "18px", color: "#1c1917", textShadow: "1px 1px 0 rgba(255,255,255,0.7)", pointerEvents: "all" }}
        >
          {chapter.id}
        </Link>
      )}
      <div
        className="font-pixel text-center leading-tight"
        style={{ fontSize: "9px", color: "#f5f0e8", textShadow: "1px 1px 0 rgba(0,0,0,0.9)", maxWidth: NODE_RADIUS * 2 + 48, pointerEvents: "none" }}
      >
        {chapter.title.toUpperCase()}
      </div>
    </div>
  );
}

// ─── Shared scroll arrow button (same as level-selection) ─────────────────────

function ScrollButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all"
      style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
    >
      {direction === "left" ? "◀" : "▶"}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChapterSelection() {
  const { chapters } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { onMouseDown, onMouseMove, onDragEnd } = useScrollDrag(scrollContainerRef);

  const {
    characterPosition,
    isFacingLeft,
    isMoving,
    nearestNode: nearestChapter,
    isCharacterOnNode,
    samples,
    decorations,
  } = useMapNavigation({
    nodes: chapters,
    scrollRef: scrollContainerRef,
    onEnterNode: (chapter) => navigate(`/level-selection?chapter=${chapter.id}`),
  });

  const { trees, rocks, flowers } = decorations;
  const currentProgressChapter = chapters.find((c) => c.stars === 0);

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <style>{JET_KEYFRAMES}</style>

      <IngameHeader siteName="Kapitel Auswahl" backTo="/" backLabel="MENÜ" />

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="flex items-center w-full gap-2 px-2">
          <ScrollButton
            direction="left"
            onClick={() => scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
          />

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
              <svg className="absolute inset-0 pointer-events-none" width={MAP_WIDTH} height={MAP_HEIGHT}>
                <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#3d7a20" />
                <rect x={0}    y={0} width={600} height={MAP_HEIGHT} fill="#448c22" opacity={0.25} />
                <rect x={700}  y={0} width={500} height={MAP_HEIGHT} fill="#3a7018" opacity={0.20} />
                <rect x={1300} y={0} width={540} height={MAP_HEIGHT} fill="#448c22" opacity={0.22} />

                {rocks.map((r, i)  => <RockSVG   key={i} x={r.x} y={r.y} scale={r.scale} />)}
                {flowers.map((f, i) => <FlowerSVG key={i} x={f.x} y={f.y} color={f.color} />)}

                <RunwaySVG chapters={chapters} />

                {chapters.map((ch) => (
                  <PlatformSVG
                    key={ch.id}
                    x={ch.x} y={ch.y}
                    isCompleted={ch.stars > 0}
                    isCurrent={currentProgressChapter?.id === ch.id}
                    isLocked={ch.stars === -1}
                    isCharacterNearby={isCharacterOnNode && nearestChapter?.id === ch.id}
                  />
                ))}

                {trees.map((t, i) => <TreeSVG key={i} x={t.x} y={t.y} scale={t.scale} />)}
              </svg>

              {chapters.map((ch) => <ChapterNode key={ch.id} chapter={ch} />)}

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

          <ScrollButton
            direction="right"
            onClick={() => scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
          />
        </div>

        <p className="mt-3 font-pixel text-stone-600 dark:text-stone-400 opacity-60" style={{ fontSize: "8px" }}>
          ← → TAXI &nbsp;|&nbsp; ↵ KAPITEL STARTEN
        </p>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 py-4 bg-stone-900/50 dark:bg-stone-950/70 border-t-2 border-stone-700 dark:border-stone-800">
        <Link to="/einstellungen" className="font-pixel text-xs sm:text-sm text-stone-300 hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors">
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
