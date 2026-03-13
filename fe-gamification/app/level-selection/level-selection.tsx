import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { IngameHeader } from "~/components/ingame-header";

import type { Level } from "../components/types";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  NODE_RADIUS,
  CHARACTER_WALK_SPEED,
  CHARACTER_VERTICAL_OFFSET,
} from "../components/mapConstants";
import { generateDecorationPositions } from "../components/design/positions/mapDecorations";
import {
  buildPathSamples,
  findClosestSampleIndex,
  buildSvgPathD,
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

export type { Level };

export function LevelSelection({ levels }: { levels: Level[] }) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const animationFrameRef = useRef<number>(0);
  const pressedKeys = useRef({ left: false, right: false });

  const pathSamples = useRef<{ x: number; y: number }[]>([]);
  if (pathSamples.current.length === 0 && levels.length > 1) {
    pathSamples.current = buildPathSamples(levels, 150);
  }
  const samples = pathSamples.current;

  const decorations = useRef<ReturnType<typeof generateDecorationPositions>>(
    generateDecorationPositions(levels),
  );
  const { trees, rocks, flowers } = decorations.current;

  const lastUnlockedLevelIndex = levels.reduce(
    (lastIndex, level, index) => (level.stars !== -1 ? index : lastIndex),
    0,
  );
  const maxReachableSampleIndex =
    samples.length > 0
      ? findClosestSampleIndex(samples, levels[lastUnlockedLevelIndex])
      : 0;

  const startLevel =
    levels.find((level) => level.stars === 0) ?? levels[lastUnlockedLevelIndex];
  const initialSampleIndex =
    samples.length > 0 ? findClosestSampleIndex(samples, startLevel) : 0;

  const characterSampleIndexRef = useRef<number>(initialSampleIndex);
  const [characterSampleIndex, setCharacterSampleIndex] =
    useState<number>(initialSampleIndex);
  const [isFacingLeft, setIsFacingLeft] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const isFacingLeftRef = useRef(false);

  const characterPosition = samples[characterSampleIndex] ?? {
    x: levels[0]?.x ?? 0,
    y: levels[0]?.y ?? 0,
  };

  const nearestLevelToCharacter = levels.reduce<Level>(
    (nearest, level) =>
      Math.abs(level.x - characterPosition.x) <
      Math.abs(nearest.x - characterPosition.x)
        ? level
        : nearest,
    levels[0],
  );

  const isCharacterOnNode =
    nearestLevelToCharacter &&
    Math.abs(nearestLevelToCharacter.x - characterPosition.x) < NODE_RADIUS;

  const svgPathD = buildSvgPathD(levels);
  const currentProgressLevel = levels.find((level) => level.stars === 0);

  useEffect(() => {
    if (samples.length === 0) return;

    function gameLoop() {
      const { left, right } = pressedKeys.current;
      let characterMoved = false;

      if (right && !left) {
        const nextIndex = Math.min(
          characterSampleIndexRef.current + CHARACTER_WALK_SPEED,
          maxReachableSampleIndex,
        );
        if (nextIndex !== characterSampleIndexRef.current) {
          characterSampleIndexRef.current = nextIndex;
          setCharacterSampleIndex(nextIndex);
          if (isFacingLeftRef.current) {
            isFacingLeftRef.current = false;
            setIsFacingLeft(false);
          }
          characterMoved = true;
        }
      } else if (left && !right) {
        const nextIndex = Math.max(
          characterSampleIndexRef.current - CHARACTER_WALK_SPEED,
          0,
        );
        if (nextIndex !== characterSampleIndexRef.current) {
          characterSampleIndexRef.current = nextIndex;
          setCharacterSampleIndex(nextIndex);
          if (!isFacingLeftRef.current) {
            isFacingLeftRef.current = true;
            setIsFacingLeft(true);
          }
          characterMoved = true;
        }
      }

      setIsWalking(characterMoved);

      if (
        characterMoved &&
        scrollContainerRef.current &&
        samples[characterSampleIndexRef.current]
      ) {
        const containerWidth = scrollContainerRef.current.clientWidth;
        const targetScrollLeft =
          samples[characterSampleIndexRef.current].x - containerWidth / 2;
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
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pressedKeys.current.left = true;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        pressedKeys.current.right = true;
      }
      if (event.key === "Enter") {
        const currentPosition = samples[characterSampleIndexRef.current];
        if (!currentPosition) return;
        const nearestLevel = levels.reduce<Level>(
          (nearest, level) =>
            Math.abs(level.x - currentPosition.x) <
            Math.abs(nearest.x - currentPosition.x)
              ? level
              : nearest,
          levels[0],
        );
        const isOnUnlockedNode =
          nearestLevel &&
          nearestLevel.stars !== -1 &&
          Math.abs(nearestLevel.x - currentPosition.x) < NODE_RADIUS;
        if (isOnUnlockedNode) {
          navigate(`/level/${nearestLevel.id}`);
        }
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") pressedKeys.current.left = false;
      if (event.key === "ArrowRight") pressedKeys.current.right = false;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [levels, navigate, samples]);

  function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    dragState.current = {
      active: true,
      startX: event.pageX - (scrollContainerRef.current?.offsetLeft ?? 0),
      scrollLeft: scrollContainerRef.current?.scrollLeft ?? 0,
    };
    if (scrollContainerRef.current)
      scrollContainerRef.current.style.cursor = "grabbing";
  }

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!dragState.current.active || !scrollContainerRef.current) return;
    event.preventDefault();
    const currentX = event.pageX - scrollContainerRef.current.offsetLeft;
    scrollContainerRef.current.scrollLeft =
      dragState.current.scrollLeft -
      (currentX - dragState.current.startX) * 1.4;
  }

  function onDragEnd() {
    dragState.current.active = false;
    if (scrollContainerRef.current)
      scrollContainerRef.current.style.cursor = "grab";
  }

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <style>{CHARACTER_KEYFRAMES}</style>

      <IngameHeader siteName="Level Auswahl" backTo="/chapter-selection" backLabel="KAPITEL" />

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
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
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
                    isLocked={level.stars === -1}
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
                  isCurrent={currentProgressLevel?.id === level.id}
                  isCharacterHere={
                    isCharacterOnNode &&
                    nearestLevelToCharacter?.id === level.id
                  }
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
