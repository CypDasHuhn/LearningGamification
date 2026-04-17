import { useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import { useGameLoop } from "~/hooks/useGameLoop";
import { useDragScroll } from "~/hooks/useDragScroll";

import type { Level } from "../components/types";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  NODE_RADIUS,
  CHARACTER_VERTICAL_OFFSET,
} from "../components/mapConstants";
import { generateDecorationPositions } from "../components/design/positions/mapDecorations";
import {
  buildPathSamples,
  findClosestSampleIndex,
  buildSvgPathD,
  findNearestByX,
} from "../components/design/positions/pathUtils";
import {
  TreeSVG,
  RockSVG,
  FlowerSVG,
  RiverSVG,
} from "../components/design/structures/MapDecorationsSVG";
import { PlatformSVG } from "../components/design/structures/PlatformSVG";
import { LevelNode } from "../components/design/structures/LevelNode";
import {
  PixelCharacter,
  CHARACTER_KEYFRAMES,
} from "../components/character/PixelCharacter";

const CHAPTER_TITLES: Record<string, string> = {
  "1": "Einführung",
  "2": "Variablen",
  "3": "Schleifen",
};

export type { Level };

/**
 * Level-selection map screen.
 *
 * Renders the scrollable adventure map for a single chapter. The user walks
 * the pixel character to any unlocked level node and presses Enter (or
 * clicks/taps the node overlay) to start that level.
 *
 * @param levels - Ordered array of level positions and completion state for
 *   the current chapter. Supplied by the route's server loader.
 */
export function LevelSelection({ levels }: { levels: Level[] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chapterTitle = CHAPTER_TITLES[searchParams.get("chapter") ?? ""] ?? "";

  const pathSamples = useRef<{ x: number; y: number }[]>([]);
  if (pathSamples.current.length === 0 && levels.length > 1) {
    pathSamples.current = buildPathSamples(levels, 150);
  }
  const samples = pathSamples.current;

  const decorations = useRef<ReturnType<typeof generateDecorationPositions>>(
    generateDecorationPositions(levels),
  );
  const { trees, rocks, flowers } = decorations.current;

  const maxReachableSampleIndex = samples.length > 0 ? samples.length - 1 : 0;

  const startLevel = levels.find((level) => level.stars === 0) ?? levels[0];
  const initialSampleIndex =
    samples.length > 0 ? findClosestSampleIndex(samples, startLevel) : 0;

  const { ref: scrollContainerRef, handlers: dragHandlers } = useDragScroll();
  const {
    sampleIndex: characterSampleIndex,
    sampleIndexRef: characterSampleIndexRef,
    facingLeft: isFacingLeft,
    isMoving: isWalking,
  } = useGameLoop({
    samples,
    maxSampleIndex: maxReachableSampleIndex,
    scrollRef: scrollContainerRef,
    initialSampleIndex,
  });

  const characterPosition = samples[characterSampleIndex] ?? {
    x: levels[0]?.x ?? 0,
    y: levels[0]?.y ?? 0,
  };

  const nearestLevelToCharacter =
    levels.length > 0 ? findNearestByX(levels, characterPosition.x) : null;

  const isCharacterOnNode =
    nearestLevelToCharacter !== null &&
    Math.abs(nearestLevelToCharacter.x - characterPosition.x) < NODE_RADIUS;

  const svgPathD = buildSvgPathD(levels);
  const currentProgressLevel = levels.find((level) => level.stars === 0);

  // Enter key — navigate to the nearest level node.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") return;
      const currentPosition = samples[characterSampleIndexRef.current];
      if (!currentPosition || levels.length === 0) return;
      const nearestLevel = findNearestByX(levels, currentPosition.x);
      const isOnNode =
        Math.abs(nearestLevel.x - currentPosition.x) < NODE_RADIUS;
      if (isOnNode) {
        navigate(
          `/level/${nearestLevel.id}?chapterTitle=${encodeURIComponent(chapterTitle)}&chapter=${searchParams.get("chapter") ?? ""}`,
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    levels,
    navigate,
    samples,
    chapterTitle,
    searchParams,
    characterSampleIndexRef,
  ]);

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
          <button
            onClick={() =>
              scrollContainerRef.current?.scrollBy({
                left: -320,
                behavior: "smooth",
              })
            }
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
            <div
              className="relative"
              style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            >
              <svg
                className="absolute inset-0 pointer-events-none"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              >
                <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#3d7a20" />
                <rect
                  x={0}
                  y={0}
                  width={600}
                  height={MAP_HEIGHT}
                  fill="#448c22"
                  opacity={0.25}
                />
                <rect
                  x={700}
                  y={0}
                  width={500}
                  height={MAP_HEIGHT}
                  fill="#3a7018"
                  opacity={0.2}
                />
                <rect
                  x={1300}
                  y={0}
                  width={540}
                  height={MAP_HEIGHT}
                  fill="#448c22"
                  opacity={0.22}
                />

                <RiverSVG />

                {rocks.map((rock, index) => (
                  <RockSVG
                    key={index}
                    x={rock.x}
                    y={rock.y}
                    scale={rock.scale}
                  />
                ))}
                {flowers.map((flower, index) => (
                  <FlowerSVG
                    key={index}
                    x={flower.x}
                    y={flower.y}
                    color={flower.color}
                  />
                ))}

                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#3d2208"
                  strokeWidth={30}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#c8922a"
                  strokeWidth={22}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#e8c070"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {levels.map((level) => (
                  <PlatformSVG
                    key={level.id}
                    x={level.x}
                    y={level.y}
                    isCompleted={level.stars > 0}
                    isCurrent={currentProgressLevel?.id === level.id}
                    isLocked={false}
                    isCharacterNearby={
                      isCharacterOnNode &&
                      nearestLevelToCharacter?.id === level.id
                    }
                  />
                ))}

                {trees.map((tree, index) => (
                  <TreeSVG
                    key={index}
                    x={tree.x}
                    y={tree.y}
                    scale={tree.scale}
                  />
                ))}
              </svg>

              {levels.map((level) => (
                <LevelNode
                  key={level.id}
                  level={level}
                  chapterTitle={chapterTitle}
                  chapterId={searchParams.get("chapter") ?? ""}
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
                  <PixelCharacter
                    facingLeft={isFacingLeft}
                    isWalking={isWalking}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              scrollContainerRef.current?.scrollBy({
                left: 320,
                behavior: "smooth",
              })
            }
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
          ← → BEWEGEN &nbsp;|&nbsp; ↵ LEVEL STARTEN
        </p>
      </div>

      <div className="flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs">
        <span>Learning Gamification v1.0</span>
        <span className="opacity-80">© 2025</span>
      </div>
    </main>
  );
}
