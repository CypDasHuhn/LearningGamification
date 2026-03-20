import { useRef, useState, useEffect } from "react";
import type { Level } from "~/components/types";
import { CHARACTER_WALK_SPEED, NODE_RADIUS } from "~/components/mapConstants";
import {
  buildPathSamples,
  findClosestSampleIndex,
} from "~/components/design/positions/pathUtils";
import { generateDecorationPositions } from "~/components/design/positions/mapDecorations";

type PathSample = { x: number; y: number };

interface UseMapNavigationOptions {
  nodes: Level[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Called when Enter is pressed while the character stands on an unlocked node. */
  onEnterNode: (node: Level) => void;
}

/**
 * Shared game-loop hook for both the chapter map and the level map.
 *
 * Manages:
 *  - Path sampling along the node graph
 *  - Character position state (sample index, facing direction, moving flag)
 *  - Arrow-key + Enter keyboard input
 *  - RAF game loop with smooth camera scroll
 *  - Decoration positions (trees, rocks, flowers)
 */
export function useMapNavigation({
  nodes,
  scrollRef,
  onEnterNode,
}: UseMapNavigationOptions) {
  // ── Keep onEnterNode fresh without adding it to effect deps ──────────────
  const onEnterNodeRef = useRef(onEnterNode);
  useEffect(() => {
    onEnterNodeRef.current = onEnterNode;
  });

  // ── Path samples (computed once, nodes are stable after SSR) ─────────────
  const samplesRef = useRef<PathSample[]>([]);
  if (samplesRef.current.length === 0 && nodes.length > 1) {
    samplesRef.current = buildPathSamples(nodes, 150);
  }
  const samples = samplesRef.current;

  // ── Decorations (computed once) ───────────────────────────────────────────
  const decorationsRef = useRef(generateDecorationPositions(nodes));
  const decorations = decorationsRef.current;

  // ── Reachability ──────────────────────────────────────────────────────────
  const lastUnlockedIdx = nodes.reduce(
    (last, n, i) => (n.stars !== -1 ? i : last),
    0,
  );
  const maxReachableSampleIndex =
    samples.length > 0
      ? findClosestSampleIndex(samples, nodes[lastUnlockedIdx])
      : 0;

  const startNode =
    nodes.find((n) => n.stars === 0) ?? nodes[lastUnlockedIdx];
  const initialSampleIndex =
    samples.length > 0 ? findClosestSampleIndex(samples, startNode) : 0;

  // ── Character state ───────────────────────────────────────────────────────
  const characterSampleIndexRef = useRef<number>(initialSampleIndex);
  const [characterSampleIndex, setCharacterSampleIndex] =
    useState<number>(initialSampleIndex);
  const [isFacingLeft, setIsFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const isFacingLeftRef = useRef(false);

  // ── Derived position & nearest node ──────────────────────────────────────
  const characterPosition: PathSample = samples[characterSampleIndex] ?? {
    x: nodes[0]?.x ?? 0,
    y: nodes[0]?.y ?? 0,
  };

  const nearestNode = nodes.reduce<Level>(
    (nearest, node) =>
      Math.abs(node.x - characterPosition.x) <
      Math.abs(nearest.x - characterPosition.x)
        ? node
        : nearest,
    nodes[0],
  );

  const isCharacterOnNode =
    !!nearestNode &&
    Math.abs(nearestNode.x - characterPosition.x) < NODE_RADIUS;

  // ── RAF game loop ─────────────────────────────────────────────────────────
  const animationFrameRef = useRef<number>(0);
  const pressedKeys = useRef({ left: false, right: false });

  useEffect(() => {
    if (samples.length === 0) return;

    function tick() {
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
          if (isFacingLeftRef.current) {
            isFacingLeftRef.current = false;
            setIsFacingLeft(false);
          }
          moved = true;
        }
      } else if (left && !right) {
        const next = Math.max(
          characterSampleIndexRef.current - CHARACTER_WALK_SPEED,
          0,
        );
        if (next !== characterSampleIndexRef.current) {
          characterSampleIndexRef.current = next;
          setCharacterSampleIndex(next);
          if (!isFacingLeftRef.current) {
            isFacingLeftRef.current = true;
            setIsFacingLeft(true);
          }
          moved = true;
        }
      }

      setIsMoving(moved);

      if (moved && scrollRef.current && samples[characterSampleIndexRef.current]) {
        const containerWidth = scrollRef.current.clientWidth;
        const target =
          samples[characterSampleIndexRef.current].x - containerWidth / 2;
        scrollRef.current.scrollLeft +=
          (target - scrollRef.current.scrollLeft) * 0.08;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [samples, maxReachableSampleIndex, scrollRef]);

  // ── Keyboard input ────────────────────────────────────────────────────────
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
        const pos = samples[characterSampleIndexRef.current];
        if (!pos) return;
        const nearest = nodes.reduce<Level>(
          (acc, n) =>
            Math.abs(n.x - pos.x) < Math.abs(acc.x - pos.x) ? n : acc,
          nodes[0],
        );
        if (
          nearest &&
          nearest.stars !== -1 &&
          Math.abs(nearest.x - pos.x) < NODE_RADIUS
        ) {
          onEnterNodeRef.current(nearest);
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
  }, [nodes, samples]);

  return {
    characterPosition,
    isFacingLeft,
    isMoving,
    nearestNode,
    isCharacterOnNode,
    samples,
    decorations,
  };
}
