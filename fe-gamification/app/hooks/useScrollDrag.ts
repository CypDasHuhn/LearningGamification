import { useRef } from "react";

/**
 * Provides mouse-drag-to-scroll handlers for a horizontally scrollable container.
 * Attach the returned handlers to the scroll container's mouse events.
 */
export function useScrollDrag(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    drag.current = {
      active: true,
      startX: event.pageX - (scrollRef.current?.offsetLeft ?? 0),
      scrollLeft: scrollRef.current?.scrollLeft ?? 0,
    };
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  }

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!drag.current.active || !scrollRef.current) return;
    event.preventDefault();
    const x = event.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft =
      drag.current.scrollLeft - (x - drag.current.startX) * 1.4;
  }

  function onDragEnd() {
    drag.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }

  return { onMouseDown, onMouseMove, onDragEnd };
}
