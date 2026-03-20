import { useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import type { Level } from "~/components/types";
import { MAP_WIDTH, MAP_HEIGHT, CHARACTER_VERTICAL_OFFSET } from "~/components/mapConstants";
import { buildSvgPathD } from "~/components/design/positions/pathUtils";
import {
  TreeSVG,
  RockSVG,
  FlowerSVG,
  RiverSVG,
} from "~/components/design/structures/MapDecorationsSVG";
import { PlatformSVG } from "~/components/design/structures/PlatformSVG";
import { LevelNode } from "~/components/design/structures/LevelNode";
import {
  PixelCharacter,
  CHARACTER_KEYFRAMES,
} from "~/components/character/PixelCharacter";
import { useMapNavigation } from "~/hooks/useMapNavigation";
import { useScrollDrag } from "~/hooks/useScrollDrag";

export type { Level };

const CHAPTER_TITLES: Record<string, string> = {
  "1": "Einführung",
  "2": "Variablen",
  "3": "Schleifen",
};

export function LevelSelection({ levels }: { levels: Level[] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const chapterId = searchParams.get("chapter") ?? "";
  const chapterTitle = CHAPTER_TITLES[chapterId] ?? "";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { onMouseDown, onMouseMove, onDragEnd } = useScrollDrag(scrollContainerRef);

  const {
    characterPosition,
    isFacingLeft,
    isMoving: isWalking,
    nearestNode: nearestLevel,
    isCharacterOnNode,
    samples,
    decorations,
  } = useMapNavigation({
    nodes: levels,
    scrollRef: scrollContainerRef,
    onEnterNode: (level) =>
      navigate(
        `/level/${level.id}?chapterTitle=${encodeURIComponent(chapterTitle)}&chapter=${chapterId}`,
      ),
  });

  const { trees, rocks, flowers } = decorations;
  const svgPathD = buildSvgPathD(levels);
  const currentProgressLevel = levels.find((l) => l.stars === 0);

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <style>{CHARACTER_KEYFRAMES}</style>

      <IngameHeader
        siteName="Level Auswahl"
        backTo="/chapter-selection"
        backLabel="KAPITEL"
      />

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
              <svg
                className="absolute inset-0 pointer-events-none"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              >
                {/* Background */}
                <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#3d7a20" />
                <rect x={0}    y={0} width={600} height={MAP_HEIGHT} fill="#448c22" opacity={0.25} />
                <rect x={700}  y={0} width={500} height={MAP_HEIGHT} fill="#3a7018" opacity={0.20} />
                <rect x={1300} y={0} width={540} height={MAP_HEIGHT} fill="#448c22" opacity={0.22} />

                <RiverSVG />

                {rocks.map((rock, i) => (
                  <RockSVG key={i} x={rock.x} y={rock.y} scale={rock.scale} />
                ))}
                {flowers.map((flower, i) => (
                  <FlowerSVG key={i} x={flower.x} y={flower.y} color={flower.color} />
                ))}

                {/* Dirt path (3 layered strokes for depth) */}
                {(["#3d2208", "#c8922a", "#e8c070"] as const).map((stroke, i) => (
                  <path
                    key={stroke}
                    d={svgPathD}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={[30, 22, 10][i]}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {levels.map((level) => (
                  <PlatformSVG
                    key={level.id}
                    x={level.x}
                    y={level.y}
                    isCompleted={level.stars > 0}
                    isCurrent={currentProgressLevel?.id === level.id}
                    isLocked={level.stars === -1}
                    isCharacterNearby={
                      isCharacterOnNode && nearestLevel?.id === level.id
                    }
                  />
                ))}

                {trees.map((tree, i) => (
                  <TreeSVG key={i} x={tree.x} y={tree.y} scale={tree.scale} />
                ))}
              </svg>

              {levels.map((level) => (
                <LevelNode
                  key={level.id}
                  level={level}
                  isCurrent={currentProgressLevel?.id === level.id}
                  isCharacterHere={isCharacterOnNode && nearestLevel?.id === level.id}
                  chapterTitle={chapterTitle}
                  chapterId={chapterId}
                />
              ))}

              {samples.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: characterPosition.x,
                    top: characterPosition.y + CHARACTER_VERTICAL_OFFSET,
                    animation: isWalking
                      ? "charBob 0.3s ease-in-out infinite"
                      : "charIdle 1.8s ease-in-out infinite",
                    pointerEvents: "none",
                    zIndex: 20,
                    willChange: "transform",
                  }}
                >
                  <PixelCharacter facingLeft={isFacingLeft} isWalking={isWalking} />
                </div>
              )}
            </div>
          </div>

          <ScrollButton
            direction="right"
            onClick={() => scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
          />
        </div>

        <p
          className="mt-3 font-pixel text-stone-600 dark:text-stone-400 opacity-60"
          style={{ fontSize: "8px" }}
        >
          ← → BEWEGEN &nbsp;|&nbsp; ↵ LEVEL STARTEN
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

// ─── Shared scroll arrow button ────────────────────────────────────────────────
function ScrollButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
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
