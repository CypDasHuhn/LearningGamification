import { useRef, type RefObject } from "react";

/** Mouse event handlers returned by {@link useDragScroll}. Spread directly onto a `<div>`. */
export interface DragScrollHandlers {
  onMouseDown:  (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove:  (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp:    () => void;
  onMouseLeave: () => void;
}

/** Return value of {@link useDragScroll}. */
export interface UseDragScrollResult {
  /** Attach to the scrollable container element as its `ref`. */
  ref: RefObject<HTMLDivElement | null>;
  /** Spread onto the same scrollable container's JSX props. */
  handlers: DragScrollHandlers;
}

/**
 * Enables click-and-drag horizontal scrolling on a `<div>` container.
 *
 * The hook owns the `ref` — pass it to `useGameLoop`'s `scrollRef` option
 * so both hooks share the same DOM element.
 *
 * The cursor switches to `"grabbing"` while dragging and returns to `"grab"`
 * on mouse-up or mouse-leave.
 *
 * @param scrollMultiplier - Drag-to-scroll speed ratio. Defaults to `1.4`.
 *
 * @example
 * const { ref, handlers } = useDragScroll();
 * return (
 *   <div ref={ref} style={{ cursor: "grab", overflowX: "scroll" }} {...handlers}>
 *     …
 *   </div>
 * );
 */
export function useDragScroll(scrollMultiplier = 1.4): UseDragScrollResult {
  const ref       = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });

  function onMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
    dragState.current = {
      active:     true,
      startX:     event.pageX - (ref.current?.offsetLeft ?? 0),
      scrollLeft: ref.current?.scrollLeft ?? 0,
    };
    if (ref.current) ref.current.style.cursor = "grabbing";
  }

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
    if (!dragState.current.active || !ref.current) return;
    event.preventDefault();
    const currentX = event.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft =
      dragState.current.scrollLeft - (currentX - dragState.current.startX) * scrollMultiplier;
  }

  function onDragEnd(): void {
    dragState.current.active = false;
    if (ref.current) ref.current.style.cursor = "grab";
  }

  return {
    ref,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp:    onDragEnd,
      onMouseLeave: onDragEnd,
    },
  };
}
