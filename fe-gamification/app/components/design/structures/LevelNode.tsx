import { Link } from "react-router";
import type { Level } from "../../types";
import { NODE_RADIUS } from "../../mapConstants";

function StarRow({ starsEarned }: { starsEarned: number }) {
  const starValues = [1, 2, 3];
  return (
    <div className="flex gap-0.5">
      {starValues.map((starValue) => (
        <span
          key={starValue}
          style={{
            fontSize: "11px",
            color: starValue <= starsEarned ? "#fbbf24" : "#292524",
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
      className="absolute flex flex-col items-center"
      style={{
        left: level.x,
        top: level.y - NODE_RADIUS - 26,
        transform: "translateX(-50%)",
        width: NODE_RADIUS * 2 + 24,
        pointerEvents: "none",
      }}
    >
      <div className="h-6.5 flex items-end justify-center w-full pb-1"></div>

      {isLocked ? (
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: NODE_RADIUS * 2,
            height: NODE_RADIUS * 2,
            fontSize: "22px",
          }}
        >
          🔒
        </div>
      ) : (
        <Link
          to={`/level/${level.id}`}
          className="flex items-center justify-center rounded-full font-pixel text-sm hover:scale-110 active:scale-95 transition-transform"
          style={{
            width: NODE_RADIUS * 2,
            height: NODE_RADIUS * 2,
            color: "#1c1917",
            textShadow: "1px 1px 0 rgba(255,255,255,0.7)",
            pointerEvents: "all",
          }}
        >
          {level.id}
        </Link>
      )}

      <div
        className="mt-1.5 font-pixel text-center leading-tight px-1"
        style={{
          fontSize: "7px",
          color: isLocked ? "#d6d3d1" : "#1c1917",
          textShadow: isLocked
            ? "1px 1px 0 rgba(0,0,0,0.8)"
            : "1px 1px 0 rgba(255,255,255,0.8)",
          maxWidth: NODE_RADIUS * 2 + 20,
        }}
      >
        {level.title}
      </div>

      {!isLocked && (
        <div className="mt-0.5">
          <StarRow starsEarned={Math.max(0, level.stars)} />
        </div>
      )}
    </div>
  );
}
