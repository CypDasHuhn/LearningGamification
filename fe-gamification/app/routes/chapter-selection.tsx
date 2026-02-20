import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router";
import { IngameHeader } from "~/components/ingame-header";

const CENTER = { x: 50, y: 50 };

// Äste räumlich getrennt, damit sie sich nicht berühren (eigene Sektoren)
const BRANCHES = [
  {
    chapter: 1,
    node: { x: 26, y: 20 },
    levels: [
      { level: 1, x: 12, y: 6 },
      { level: 2, x: 18, y: 4 },
      { level: 3, x: 24, y: 8 },
      { level: 4, x: 30, y: 6 },
    ],
  },
  {
    chapter: 2,
    node: { x: 78, y: 50 },
    levels: [
      { level: 1, x: 90, y: 34 },
      { level: 2, x: 94, y: 50 },
      { level: 3, x: 90, y: 66 },
      { level: 4, x: 84, y: 76 },
    ],
  },
  {
    chapter: 3,
    node: { x: 26, y: 80 },
    levels: [
      { level: 1, x: 12, y: 94 },
      { level: 2, x: 6, y: 88 },
      { level: 3, x: 12, y: 82 },
      { level: 4, x: 20, y: 90 },
    ],
  },
] as const;

function NodeCircle({
  x,
  y,
  label,
  color,
  size = "md",
  href,
  scale = 1,
}: {
  x: number;
  y: number;
  label?: number | null;
  color: "black" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  href?: string;
  scale?: number;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl",
  };
  const colorClasses = {
    black: "bg-black text-white border-black",
    red: "bg-red-500 text-white border-red-600",
    orange: "bg-orange-400 text-white border-orange-500",
  };
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
  };
  const baseClass = `absolute flex items-center justify-center rounded-full border-2 font-bold shadow-md transition-transform duration-300 z-10 ${sizeClasses[size]} ${colorClasses[color]}`;

  const content = label != null ? label : null;

  if (href) {
    return (
      <Link
        to={href}
        className={`${baseClass} hover:scale-110 active:scale-95 cursor-pointer`}
        style={style}
      >
        {content}
      </Link>
    );
  }
  return (
    <div className={baseClass} style={style} aria-hidden>
      {content}
    </div>
  );
}

export default function ChapterSelection() {
  const [hoveredBranch, setHoveredBranch] = useState<1 | 2 | 3 | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getBranchScale = (chapter: 1 | 2 | 3) => {
    if (hoveredBranch === null) return 1;
    if (hoveredBranch === chapter) return 1.2;
    return 0.82;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let best: 1 | 2 | 3 = 1;
    let bestDist = Infinity;
    BRANCHES.forEach((b) => {
      const dx = x - b.node.x;
      const dy = y - b.node.y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        best = b.chapter;
      }
    });
    setHoveredBranch(best);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredBranch(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <IngameHeader siteName="Chapter Selection" />

      <div className="flex-1 flex justify-center items-center min-h-0 p-4 overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-[min(96vmin,640px)] h-[min(96vmin,640px)] shrink-0 touch-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Kapitel- und Levelauswahl"
        >
          {/* Linien (SVG) */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {BRANCHES.map(({ node, levels }) => (
              <g key={node.x}>
                <line
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={node.x}
                  y2={node.y}
                  stroke="#dc2626"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                {levels.map((lev) => (
                  <line
                    key={lev.level}
                    x1={node.x}
                    y1={node.y}
                    x2={lev.x}
                    y2={lev.y}
                    stroke="#ea580c"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            ))}
          </svg>

          {/* Alle Knoten in einer Ebene – kein Überlappen, alle klickbar */}
          <div className="absolute inset-0">
            <NodeCircle x={CENTER.x} y={CENTER.y} color="black" size="lg" />
            {BRANCHES.map(({ chapter, node, levels }) => {
              const scale = getBranchScale(chapter);
              return (
                <React.Fragment key={chapter}>
                  <NodeCircle
                    x={node.x}
                    y={node.y}
                    label={chapter}
                    color="red"
                    size="md"
                    href={`/level-selection?chapter=${chapter}`}
                    scale={scale}
                  />
                  {levels.map((lev) => (
                    <NodeCircle
                      key={`${chapter}-${lev.level}`}
                      x={lev.x}
                      y={lev.y}
                      label={lev.level}
                      color="orange"
                      size="sm"
                      href={`/level-selection?chapter=${chapter}&level=${lev.level}`}
                      scale={scale}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
