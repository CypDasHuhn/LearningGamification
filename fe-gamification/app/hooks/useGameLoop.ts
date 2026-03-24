import { useRef, useState, useEffect, type RefObject } from "react";
import { CHARACTER_WALK_SPEED } from "~/components/mapConstants";
import type { PathSample } from "~/components/design/positions/pathUtils";

/** Configuration for {@link useGameLoop}. */
export interface UseGameLoopOptions {
  /** Pre-computed path sample points for the current map. An empty array disables the loop. */
  samples: PathSample[];
  /** Highest sample index the character is allowed to reach (inclusive). */
  maxSampleIndex: number;
  /** Ref to the horizontally-scrollable container used for auto-panning. */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Starting sample index; the hook is uncontrolled after mount. */
  initialSampleIndex: number;
}

/** Values returned by {@link useGameLoop}. */
export interface UseGameLoopResult {
  /** React state for the current sample index — triggers re-renders. */
  sampleIndex: number;
  /**
   * Ref mirror of `sampleIndex` — read this inside `requestAnimationFrame`
   * callbacks or event handlers to avoid stale closures.
   */
  sampleIndexRef: RefObject<number>;
  /** Whether the character is currently facing left. */
  facingLeft: boolean;
  /** Whether the character moved in the most recent animation frame. */
  isMoving: boolean;
  /**
   * Mutable ref holding current key-press state.
   * Exposed so callers can read it inside their own `keydown` handlers
   * (e.g. to handle the `Enter` key for node navigation).
   */
  pressedKeys: RefObject<{ left: boolean; right: boolean }>;
}

/**
 * Encapsulates the `requestAnimationFrame` game loop for map-screen character movement.
 *
 * Handles:
 * - `ArrowLeft` / `ArrowRight` key listeners (registered internally).
 * - Per-frame position advancement capped at `maxSampleIndex`.
 * - Facing-direction tracking with a ref mirror to avoid stale closures.
 * - Smooth scroll-pan of `scrollRef` to keep the character centred.
 *
 * @remarks
 * The `Enter` key handler is intentionally **not** included — the navigation
 * target (level vs. chapter) differs between the two map screens, so callers
 * must add their own `keydown` listener that reads `pressedKeys` and
 * `sampleIndexRef` to resolve and navigate to the nearest node.
 *
 * @example
 * const { ref: scrollRef, handlers } = useDragScroll();
 * const { sampleIndex, facingLeft, isMoving, pressedKeys, sampleIndexRef } =
 *   useGameLoop({ samples, maxSampleIndex, scrollRef, initialSampleIndex });
 */
export function useGameLoop({
  samples,
  maxSampleIndex,
  scrollRef,
  initialSampleIndex,
}: UseGameLoopOptions): UseGameLoopResult {
  const pressedKeys      = useRef({ left: false, right: false });
  const animFrameRef     = useRef<number>(0);
  const sampleIndexRef   = useRef<number>(initialSampleIndex);
  const isFacingLeftRef  = useRef(false);

  const [sampleIndex, setSampleIndex] = useState<number>(initialSampleIndex);
  const [facingLeft,  setFacingLeft]  = useState(false);
  const [isMoving,    setIsMoving]    = useState(false);

  // ── rAF game loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (samples.length === 0) return;

    function gameLoop() {
      const { left, right } = pressedKeys.current;
      let moved = false;

      if (right && !left) {
        const next = Math.min(sampleIndexRef.current + CHARACTER_WALK_SPEED, maxSampleIndex);
        if (next !== sampleIndexRef.current) {
          sampleIndexRef.current = next;
          setSampleIndex(next);
          if (isFacingLeftRef.current) {
            isFacingLeftRef.current = false;
            setFacingLeft(false);
          }
          moved = true;
        }
      } else if (left && !right) {
        const next = Math.max(sampleIndexRef.current - CHARACTER_WALK_SPEED, 0);
        if (next !== sampleIndexRef.current) {
          sampleIndexRef.current = next;
          setSampleIndex(next);
          if (!isFacingLeftRef.current) {
            isFacingLeftRef.current = true;
            setFacingLeft(true);
          }
          moved = true;
        }
      }

      setIsMoving(moved);

      if (moved && scrollRef.current && samples[sampleIndexRef.current]) {
        const containerWidth   = scrollRef.current.clientWidth;
        const targetScrollLeft = samples[sampleIndexRef.current].x - containerWidth / 2;
        scrollRef.current.scrollLeft +=
          (targetScrollLeft - scrollRef.current.scrollLeft) * 0.08;
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [samples, maxSampleIndex, scrollRef]);

  // ── Arrow-key listeners ────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); pressedKeys.current.left  = true; }
      if (e.key === "ArrowRight") { e.preventDefault(); pressedKeys.current.right = true; }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  pressedKeys.current.left  = false;
      if (e.key === "ArrowRight") pressedKeys.current.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, []);

  return { sampleIndex, sampleIndexRef, facingLeft, isMoving, pressedKeys };
}
