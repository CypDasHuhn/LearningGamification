import { NODE_RADIUS } from "../../mapConstants";

type PlatformSVGProps = {
  x: number;
  y: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  isCharacterNearby: boolean;
};

export function PlatformSVG({
  x,
  y,
  isCompleted,
  isCurrent,
  isLocked,
  isCharacterNearby,
}: PlatformSVGProps) {
  const rimColor = isLocked
    ? "#6b6156"
    : isCompleted
      ? "#b8860b"
      : isCurrent
        ? "#0369a1"
        : "#7c6a4e";

  const surfaceColor = isLocked
    ? "#a09088"
    : isCompleted
      ? "#e8b840"
      : isCurrent
        ? "#38bdf8"
        : "#d4bfa0";

  return (
    <g>
      <circle
        cx={x + 5}
        cy={y + 7}
        r={NODE_RADIUS + 5}
        fill="rgba(0,0,0,0.25)"
      />
      <circle cx={x} cy={y} r={NODE_RADIUS + 4} fill={rimColor} />
      <circle cx={x} cy={y} r={NODE_RADIUS} fill={surfaceColor} />
      <circle cx={x - 10} cy={y - 7} r={3} fill="rgba(0,0,0,0.07)" />
      <circle cx={x + 8} cy={y + 8} r={2.5} fill="rgba(0,0,0,0.07)" />
      <circle cx={x + 4} cy={y - 13} r={2} fill="rgba(0,0,0,0.05)" />
      <circle cx={x - 9} cy={y - 11} r={8} fill="rgba(255,255,255,0.22)" />
      {isCurrent && (
        <circle
          cx={x}
          cy={y}
          r={NODE_RADIUS + 10}
          fill="none"
          stroke="rgba(56,189,248,0.45)"
          strokeWidth={5}
        />
      )}
      {isCharacterNearby && !isLocked && (
        <circle
          cx={x}
          cy={y}
          r={NODE_RADIUS + 13}
          fill="none"
          stroke="rgba(252,211,77,0.75)"
          strokeWidth={3}
          strokeDasharray="6 4"
        />
      )}
    </g>
  );
}
