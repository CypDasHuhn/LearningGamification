import { Link } from "react-router";
import type { Level } from "../../types";
import { NODE_RADIUS } from "../../mapConstants";

function StarRow({ starsEarned }: { starsEarned: number }) {
  const starValues = [1, 2, 3];
  return (
    <div className="flex gap-1">
      {starValues.map((starValue) => (
        <span
          key={starValue}
          style={{
            fontSize: "20px",
            color: starValue <= starsEarned ? "#fbbf24" : "#44403c",
            textShadow: starValue <= starsEarned ? "1px 1px 0 #000" : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

type LevelNodeProps = {
  level: Level;
  isCurrent: boolean;
  isCharacterHere: boolean;
  chapterTitle?: string;
  chapterId?: string;
};

export function LevelNode({
  level,
  isCurrent,
  isCharacterHere,
  chapterTitle = "",
  chapterId = "",
}: LevelNodeProps) {
  const isLocked = level.stars === -1;

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
      {isLocked ? (
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: NODE_RADIUS * 2,
            height: NODE_RADIUS * 2,
            fontSize: "28px",
          }}
        >
          🔒
        </div>
      ) : (
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
      )}
    </div>
  );
}
