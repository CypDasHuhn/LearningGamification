type TreeProps = { x: number; y: number; scale?: number };

export function TreeSVG({ x, y, scale = 1 }: TreeProps) {
  const lobeRadius = 11 * scale;
  const lobeOffset = lobeRadius * 1.05;
  return (
    <g>
      <circle cx={x} cy={y - lobeOffset} r={lobeRadius} fill="#1e5820" />
      <circle cx={x + lobeOffset} cy={y} r={lobeRadius} fill="#1e5820" />
      <circle cx={x} cy={y + lobeOffset} r={lobeRadius} fill="#1e5820" />
      <circle cx={x - lobeOffset} cy={y} r={lobeRadius} fill="#1e5820" />
      <circle cx={x} cy={y} r={lobeRadius * 0.88} fill="#265e26" />
    </g>
  );
}

type RockProps = { x: number; y: number; scale?: number };

export function RockSVG({ x, y, scale = 1 }: RockProps) {
  return (
    <g>
      <ellipse
        cx={x + 4 * scale}
        cy={y + 4 * scale}
        rx={13 * scale}
        ry={8 * scale}
        fill="rgba(0,0,0,0.16)"
      />
      <ellipse cx={x} cy={y} rx={13 * scale} ry={8 * scale} fill="#7c7468" />
      <ellipse
        cx={x - 2 * scale}
        cy={y - 2 * scale}
        rx={4.5 * scale}
        ry={3 * scale}
        fill="#b0a898"
      />
    </g>
  );
}

type FlowerProps = { x: number; y: number; color: string };

export function FlowerSVG({ x, y, color }: FlowerProps) {
  return (
    <g opacity={0.85}>
      {[0, 1, 2, 3].map((petalIndex) => {
        const angle = (petalIndex * Math.PI) / 2;
        return (
          <circle
            key={petalIndex}
            cx={x + Math.cos(angle) * 5}
            cy={y + Math.sin(angle) * 5}
            r={3}
            fill={color}
          />
        );
      })}
      <circle cx={x} cy={y} r={2.2} fill="#fde68a" />
    </g>
  );
}

export function RiverSVG() {
  const riverHighlightXPositions = [80, 450, 820, 1200, 1580];
  const lilyPadXPositions = [182, 704, 1108, 1648];

  return (
    <g>
      <path
        d="M -5,33 C 110,20 240,70 405,54 C 570,38 710,78 900,62 C 1090,46 1230,84 1410,67 C 1590,50 1710,74 1845,60 L 1845,108 C 1710,122 1590,98 1410,115 C 1230,132 1090,94 900,110 C 710,126 570,86 405,102 C 240,118 110,68 -5,85 Z"
        fill="#2563eb"
        opacity={0.88}
      />
      <path
        d="M -5,52 C 110,44 240,72 405,63 C 570,54 710,76 900,68 C 1090,60 1230,80 1410,73 C 1590,66 1710,78 1845,72 L 1845,88 C 1710,95 1590,90 1410,96 C 1230,102 1090,88 900,95 C 710,101 570,83 405,92 C 240,100 110,74 -5,82 Z"
        fill="#1e40af"
        opacity={0.45}
      />
      {riverHighlightXPositions.map((xPosition, index) => (
        <path
          key={index}
          d={`M ${xPosition},${62 + (index % 2) * 6} Q ${xPosition + 80},${55 + (index % 2) * 6} ${xPosition + 160},${62 + (index % 2) * 6}`}
          stroke="rgba(255,255,255,0.28)"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
      {lilyPadXPositions.map((xPosition, index) => (
        <ellipse
          key={index}
          cx={xPosition}
          cy={68 + (index % 2) * 5}
          rx={10}
          ry={6}
          fill="#166534"
          opacity={0.75}
        />
      ))}
    </g>
  );
}
