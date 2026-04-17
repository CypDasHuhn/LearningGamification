import { Link } from "react-router";
import type { Level } from "../../types";
import { NODE_RADIUS } from "../../mapConstants";

/** Props for {@link LevelNode}. */
type LevelNodeProps = {
  level: Level;
  chapterTitle?: string;
  chapterId?: string;
};

/**
 * HTML overlay rendered above each level platform node.
 *
 * Shows a lock emoji for locked levels or a clickable level-number link for
 * unlocked ones. Visual state (highlight rings, glow) is handled by the
 * underlying {@link PlatformSVG} in the SVG layer.
 */
export function LevelNode({
  level,
  chapterTitle = "",
  chapterId = "",
}: LevelNodeProps) {
  return (
    <div
      className="absolute flex flex-col items-center gap-1.5"
      style={{
        left: level.x,
        top: level.y - NODE_RADIUS,
        transform: "translateX(-50%)",
        width: NODE_RADIUS * 2 + 48,
        pointerEvents: "none",
      }}
    >
      <Link
        to={`/level/${level.id}?chapterTitle=${encodeURIComponent(chapterTitle)}&chapter=${chapterId}`}
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
        {level.id}
      </Link>
    </div>
  );
}
