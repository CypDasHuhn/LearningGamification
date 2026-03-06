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
};

export function LevelNode({
  level,
  isCurrent,
  isCharacterHere,
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
          to={`/level/${level.id}`}
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

      {!isLocked && <StarRow starsEarned={Math.max(0, level.stars)} />}

      <div
        className="font-pixel text-center leading-snug px-1"
        style={{
          fontSize: "14px",
          color: isLocked ? "#d6d3d1" : "#1c1917",
          textShadow: isLocked
            ? "1px 1px 0 rgba(0,0,0,0.8)"
            : "1px 1px 0 rgba(255,255,255,0.9)",
          maxWidth: NODE_RADIUS * 2 + 44,
        }}
      >
        {level.title}
      </div>
    </div>
  );
}
