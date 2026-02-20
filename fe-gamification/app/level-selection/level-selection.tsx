// app/level-selection/level-selection.tsx
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Level = {
  id: number;
  x: number;
  y: number;
  /** -1 = locked, 0 = current/unlocked, 1-3 = completed with stars */
  stars: number;
  title: string;
};

// ─── Map constants ────────────────────────────────────────────────────────────

const MAP_W = 1840;
const MAP_H = 430;
const NODE_R = 36;
const CHAR_SPEED = 4; // samples to advance per animation frame
const CHARACTER_Y_OFFSET = -54; // px above the path Y so the character stands on the path

// ─── Decoration data ──────────────────────────────────────────────────────────

const TREES: [number, number, number][] = [
  [50, 362, 1.1],
  [148, 375, 0.95],
  [242, 358, 1.0],
  [345, 372, 1.15],
  [438, 360, 0.9],
  [530, 376, 1.05],
  [622, 362, 1.1],
  [715, 374, 0.9],
  [808, 360, 1.0],
  [900, 378, 0.95],
  [990, 364, 1.1],
  [1082, 376, 0.88],
  [1174, 362, 1.0],
  [1268, 375, 1.12],
  [1358, 360, 0.93],
  [1452, 375, 1.05],
  [1542, 362, 1.1],
  [1636, 374, 0.92],
  [1726, 360, 1.0],
  [1800, 372, 0.95],
  [95, 400, 0.82],
  [192, 410, 0.78],
  [290, 398, 0.85],
  [490, 404, 0.8],
  [590, 398, 0.88],
  [688, 408, 0.75],
  [880, 400, 0.8],
  [998, 410, 0.82],
  [1096, 400, 0.78],
  [1292, 408, 0.88],
  [1492, 400, 0.8],
  [1688, 408, 0.82],
  [1790, 396, 0.78],
  [72, 155, 0.82],
  [178, 140, 0.9],
  [285, 160, 0.78],
  [485, 146, 0.88],
  [575, 162, 0.75],
  [672, 148, 0.85],
  [865, 158, 0.8],
  [992, 143, 0.9],
  [1092, 160, 0.75],
  [1202, 146, 0.85],
  [1325, 158, 0.8],
  [1452, 144, 0.9],
  [1565, 162, 0.75],
  [1672, 148, 0.85],
  [1758, 158, 0.8],
  [18, 248, 0.72],
  [1818, 240, 0.72],
  [35, 318, 0.78],
  [1810, 314, 0.72],
];

const ROCKS: [number, number, number][] = [
  [255, 322, 0.9],
  [852, 332, 0.8],
  [1308, 318, 1.0],
  [1658, 326, 0.85],
  [402, 175, 0.7],
  [1058, 168, 0.8],
  [1485, 176, 0.75],
  [740, 340, 0.85],
];

const FLOWERS: [number, number, string][] = [
  [185, 322, "#f87171"],
  [358, 178, "#f472b6"],
  [625, 334, "#fb923c"],
  [848, 168, "#a78bfa"],
  [1108, 328, "#f87171"],
  [1358, 175, "#f472b6"],
  [1608, 336, "#fb923c"],
  [1775, 168, "#4ade80"],
  [450, 338, "#fbbf24"],
  [1210, 170, "#38bdf8"],
  [970, 338, "#4ade80"],
];

// ─── Path helpers ─────────────────────────────────────────────────────────────

/** Dense sample points along the cubic bezier path so movement feels smooth */
function buildPathSamples(levels: Level[], samplesPerSegment = 150) {
  const points: { x: number; y: number }[] = [];
  for (let i = 1; i < levels.length; i++) {
    const p = levels[i - 1];
    const c = levels[i];
    const mx = (p.x + c.x) / 2;
    for (let t = 0; t <= 1; t += 1 / samplesPerSegment) {
      const mt = 1 - t;
      const x =
        mt * mt * mt * p.x +
        3 * mt * mt * t * mx +
        3 * mt * t * t * mx +
        t * t * t * c.x;
      const y =
        mt * mt * mt * p.y +
        3 * mt * mt * t * p.y +
        3 * mt * t * t * c.y +
        t * t * t * c.y;
      points.push({ x, y });
    }
  }
  return points.filter(
    (pt, i) =>
      i === 0 ||
      Math.abs(pt.x - points[i - 1].x) > 0.01 ||
      Math.abs(pt.y - points[i - 1].y) > 0.01,
  );
}

/** Return the sample index whose x is closest to the given level's x */
function sampleIdxForLevel(samples: { x: number; y: number }[], level: Level) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < samples.length; i++) {
    const d = Math.abs(samples[i].x - level.x);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

// ─── SVG sub-components ───────────────────────────────────────────────────────

function TreeSVG({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const r = 11 * s,
    o = r * 1.05;
  return (
    <g>
      <circle cx={x} cy={y - o} r={r} fill="#1e5820" />
      <circle cx={x + o} cy={y} r={r} fill="#1e5820" />
      <circle cx={x} cy={y + o} r={r} fill="#1e5820" />
      <circle cx={x - o} cy={y} r={r} fill="#1e5820" />
      <circle cx={x} cy={y} r={r * 0.88} fill="#265e26" />
    </g>
  );
}

function RockSVG({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <ellipse
        cx={x + 4 * s}
        cy={y + 4 * s}
        rx={13 * s}
        ry={8 * s}
        fill="rgba(0,0,0,0.16)"
      />
      <ellipse cx={x} cy={y} rx={13 * s} ry={8 * s} fill="#7c7468" />
      <ellipse
        cx={x - 2 * s}
        cy={y - 2 * s}
        rx={4.5 * s}
        ry={3 * s}
        fill="#b0a898"
      />
    </g>
  );
}

function FlowerSVG({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g opacity={0.85}>
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2;
        return (
          <circle
            key={i}
            cx={x + Math.cos(a) * 5}
            cy={y + Math.sin(a) * 5}
            r={3}
            fill={color}
          />
        );
      })}
      <circle cx={x} cy={y} r={2.2} fill="#fde68a" />
    </g>
  );
}

function River() {
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
      {[80, 450, 820, 1200, 1580].map((x, i) => (
        <path
          key={i}
          d={`M ${x},${62 + (i % 2) * 6} Q ${x + 80},${55 + (i % 2) * 6} ${x + 160},${62 + (i % 2) * 6}`}
          stroke="rgba(255,255,255,0.28)"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
      {[182, 704, 1108, 1648].map((x, i) => (
        <ellipse
          key={i}
          cx={x}
          cy={68 + (i % 2) * 5}
          rx={10}
          ry={6}
          fill="#166534"
          opacity={0.75}
        />
      ))}
    </g>
  );
}

function PlatformSVG({
  x,
  y,
  done,
  active,
  locked,
  charNearby,
}: {
  x: number;
  y: number;
  done: boolean;
  active: boolean;
  locked: boolean;
  charNearby: boolean;
}) {
  const outer = locked
    ? "#6b6156"
    : done
      ? "#b8860b"
      : active
        ? "#0369a1"
        : "#7c6a4e";
  const inner = locked
    ? "#a09088"
    : done
      ? "#e8b840"
      : active
        ? "#38bdf8"
        : "#d4bfa0";
  return (
    <g>
      <circle cx={x + 5} cy={y + 7} r={NODE_R + 5} fill="rgba(0,0,0,0.25)" />
      <circle cx={x} cy={y} r={NODE_R + 4} fill={outer} />
      <circle cx={x} cy={y} r={NODE_R} fill={inner} />
      <circle cx={x - 10} cy={y - 7} r={3} fill="rgba(0,0,0,0.07)" />
      <circle cx={x + 8} cy={y + 8} r={2.5} fill="rgba(0,0,0,0.07)" />
      <circle cx={x + 4} cy={y - 13} r={2} fill="rgba(0,0,0,0.05)" />
      <circle cx={x - 9} cy={y - 11} r={8} fill="rgba(255,255,255,0.22)" />
      {active && (
        <circle
          cx={x}
          cy={y}
          r={NODE_R + 10}
          fill="none"
          stroke="rgba(56,189,248,0.45)"
          strokeWidth={5}
        />
      )}
      {charNearby && !locked && (
        <circle
          cx={x}
          cy={y}
          r={NODE_R + 13}
          fill="none"
          stroke="rgba(252,211,77,0.75)"
          strokeWidth={3}
          strokeDasharray="6 4"
        />
      )}
    </g>
  );
}

// ─── Pixel art character ──────────────────────────────────────────────────────
/**
 * 8×18 "pixel" sprite, each pixel rendered as a 3×3 div.
 * Leg animation is done with two alternating leg columns via CSS.
 */
const PX = 3; // pixel size in real px

function Pixel({
  col,
  row,
  color,
  w = 1,
  h = 1,
}: {
  col: number;
  row: number;
  color: string;
  w?: number;
  h?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: col * PX,
        top: row * PX,
        width: w * PX,
        height: h * PX,
        background: color,
      }}
    />
  );
}

function PixelCharacter({
  facingLeft,
  walking,
}: {
  facingLeft: boolean;
  walking: boolean;
}) {
  const SKIN = "#f5c89a";
  const HAIR = "#3d2b1f";
  const SHIRT = "#e63946";
  const PANTS = "#1d3557";
  const BOOT = "#3a2010";
  const EYE = "#1c1917";
  const BELT = "#8b6914";

  return (
    <div
      style={{
        position: "relative",
        width: 8 * PX,
        height: 18 * PX,
        transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
        filter: "drop-shadow(1px 3px 0 rgba(0,0,0,0.55))",
      }}
    >
      {/* Hair */}
      <Pixel col={1} row={0} color={HAIR} w={6} />
      <Pixel col={0} row={1} color={HAIR} />
      <Pixel col={7} row={1} color={HAIR} />
      {/* Head */}
      <Pixel col={1} row={1} color={SKIN} w={6} />
      <Pixel col={0} row={2} color={SKIN} w={8} />
      <Pixel col={0} row={3} color={SKIN} w={8} />
      {/* Eyes */}
      <Pixel col={2} row={2} color={EYE} />
      <Pixel col={5} row={2} color={EYE} />
      {/* Shirt / body */}
      <Pixel col={1} row={4} color={SHIRT} w={6} h={4} />
      {/* Arms */}
      <Pixel col={0} row={4} color={SKIN} h={3} />
      <Pixel col={7} row={4} color={SKIN} h={3} />
      {/* Belt */}
      <Pixel col={1} row={8} color={BELT} w={6} />
      {/* Pants + boots – walking animates via CSS class on wrapper */}
      {walking ? (
        <>
          {/* Left leg (front) */}
          <Pixel col={1} row={9} color={PANTS} w={3} h={3} />
          <Pixel col={1} row={12} color={PANTS} w={3} h={1} />
          <Pixel col={1} row={13} color={BOOT} w={3} h={2} />
          {/* Right leg (back) */}
          <Pixel col={4} row={9} color={PANTS} w={3} h={3} />
          <Pixel col={4} row={12} color={PANTS} w={3} h={1} />
          <Pixel col={4} row={13} color={BOOT} w={3} h={2} />
        </>
      ) : (
        <>
          <Pixel col={1} row={9} color={PANTS} w={6} h={4} />
          <Pixel col={1} row={13} color={BOOT} w={3} h={2} />
          <Pixel col={4} row={13} color={BOOT} w={3} h={2} />
        </>
      )}
    </div>
  );
}

// ─── Keyframes injected once ──────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes charBob {
  0%,100% { transform: translateY(0px) translateX(-50%); }
  50%      { transform: translateY(-3px) translateX(-50%); }
}
@keyframes charIdle {
  0%,100% { transform: translateY(0px) translateX(-50%); }
  50%      { transform: translateY(-1px) translateX(-50%); }
}
`;

// ─── Overlay node label ───────────────────────────────────────────────────────

function StarRow({ earned }: { earned: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          style={{
            fontSize: "11px",
            color: s <= earned ? "#fbbf24" : "#292524",
            textShadow: s <= earned ? "1px 1px 0 #000" : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function LevelNode({
  level,
  isCurrent,
  charIsHere,
}: {
  level: Level;
  isCurrent: boolean;
  charIsHere: boolean;
}) {
  const locked = level.stars === -1;
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: level.x,
        top: level.y - NODE_R - 26,
        transform: "translateX(-50%)",
        width: NODE_R * 2 + 24,
        pointerEvents: "none",
      }}
    >
      <div className="h-6.5 flex items-end justify-center w-full pb-1">
        {charIsHere && !locked ? (
          <span
            className="font-pixel animate-bounce"
            style={{
              fontSize: "7px",
              color: "#4ade80",
              textShadow: "1px 1px 0 #000",
            }}
          >
            ↵ ENTER
          </span>
        ) : isCurrent ? (
          <span
            className="font-pixel animate-bounce"
            style={{
              fontSize: "7px",
              color: "#fcd34d",
              textShadow: "1px 1px 0 #000",
            }}
          >
            ▼ JETZT
          </span>
        ) : null}
      </div>
      {locked ? (
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: NODE_R * 2, height: NODE_R * 2, fontSize: "22px" }}
        >
          🔒
        </div>
      ) : (
        <Link
          to={`/level/${level.id}`}
          className="flex items-center justify-center rounded-full font-pixel text-sm hover:scale-110 active:scale-95 transition-transform"
          style={{
            width: NODE_R * 2,
            height: NODE_R * 2,
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
          color: locked ? "#d6d3d1" : "#1c1917",
          textShadow: locked
            ? "1px 1px 0 rgba(0,0,0,0.8)"
            : "1px 1px 0 rgba(255,255,255,0.8)",
          maxWidth: NODE_R * 2 + 20,
        }}
      >
        {level.title}
      </div>
      {!locked && (
        <div className="mt-0.5">
          <StarRow earned={Math.max(0, level.stars)} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LevelSelection({ levels }: { levels: Level[] }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const rafRef = useRef<number>(0);
  const keysRef = useRef({ left: false, right: false });

  // Build path samples once
  const samples = useRef<{ x: number; y: number }[]>([]);
  if (samples.current.length === 0 && levels.length > 1) {
    samples.current = buildPathSamples(levels, 150);
  }
  const S = samples.current;

  // Index of the last unlocked level
  const lastUnlockedIdx = levels.reduce(
    (acc, l, i) => (l.stars !== -1 ? i : acc),
    0,
  );
  const maxSampleIdx =
    S.length > 0 ? sampleIdxForLevel(S, levels[lastUnlockedIdx]) : 0;

  // Character position as sample index (stored in ref for the game loop, mirrored in state for render)
  const initialCharIdx =
    S.length > 0
      ? sampleIdxForLevel(
          S,
          levels.find((l) => l.stars === 0) ?? levels[lastUnlockedIdx],
        )
      : 0;
  const charIdxRef = useRef<number>(initialCharIdx);

  const [charIdx, setCharIdx] = useState<number>(initialCharIdx);
  const [facingLeft, setFacingLeft] = useState(false);
  const [walking, setWalking] = useState(false);
  const facingLeftRef = useRef(false);

  // Derived character world position
  const charPos = S[charIdx] ?? { x: levels[0]?.x ?? 0, y: levels[0]?.y ?? 0 };

  // Which level node is the character standing on?
  const nearestLevel = levels.reduce(
    (best, l) =>
      Math.abs(l.x - charPos.x) < Math.abs(best.x - charPos.x) ? l : best,
    levels[0],
  );
  const charIsOnNode =
    nearestLevel && Math.abs(nearestLevel.x - charPos.x) < NODE_R;

  // pathD (computed from prop)
  const pathD = (() => {
    if (levels.length === 0) return "";
    let d = `M ${levels[0].x} ${levels[0].y}`;
    for (let i = 1; i < levels.length; i++) {
      const p = levels[i - 1],
        c = levels[i],
        mx = (p.x + c.x) / 2;
      d += ` C ${mx},${p.y} ${mx},${c.y} ${c.x},${c.y}`;
    }
    return d;
  })();

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (S.length === 0) return;
    function loop() {
      const { left, right } = keysRef.current;
      let moved = false;

      if (right && !left) {
        const next = Math.min(charIdxRef.current + CHAR_SPEED, maxSampleIdx);
        if (next !== charIdxRef.current) {
          charIdxRef.current = next;
          setCharIdx(next);
          if (facingLeftRef.current) {
            facingLeftRef.current = false;
            setFacingLeft(false);
          }
          moved = true;
        }
      } else if (left && !right) {
        const next = Math.max(charIdxRef.current - CHAR_SPEED, 0);
        if (next !== charIdxRef.current) {
          charIdxRef.current = next;
          setCharIdx(next);
          if (!facingLeftRef.current) {
            facingLeftRef.current = true;
            setFacingLeft(true);
          }
          moved = true;
        }
      }

      setWalking(moved);

      // Keep character in viewport
      if (moved && scrollRef.current && S[charIdxRef.current]) {
        const cw = scrollRef.current.clientWidth;
        const target = S[charIdxRef.current].x - cw / 2;
        scrollRef.current.scrollLeft +=
          (target - scrollRef.current.scrollLeft) * 0.08;
      }

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [S, maxSampleIdx]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        keysRef.current.left = true;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        keysRef.current.right = true;
      }
      if (e.key === "Enter") {
        const pos = S[charIdxRef.current];
        if (!pos) return;
        const nearest = levels.reduce(
          (best, l) =>
            Math.abs(l.x - pos.x) < Math.abs(best.x - pos.x) ? l : best,
          levels[0],
        );
        if (
          nearest &&
          nearest.stars !== -1 &&
          Math.abs(nearest.x - pos.x) < NODE_R
        ) {
          navigate(`/level/${nearest.id}`);
        }
      }
    }
    function onUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [levels, navigate, S]);

  // ── Drag scroll ────────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    drag.current = {
      active: true,
      startX: e.pageX - (scrollRef.current?.offsetLeft ?? 0),
      scrollLeft: scrollRef.current?.scrollLeft ?? 0,
    };
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current.active || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft =
      drag.current.scrollLeft -
      (e.pageX - scrollRef.current.offsetLeft - drag.current.startX) * 1.4;
  }
  function stopDrag() {
    drag.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }

  const currentLevel = levels.find((l) => l.stars === 0);

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900">
      <style>{KEYFRAMES}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link
          to="/"
          className="font-pixel text-xs text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.4)" }}
        >
          ← ZURÜCK
        </Link>
        <h1
          className="font-pixel text-base sm:text-xl text-stone-800 dark:text-stone-100"
          style={{
            textShadow: "2px 2px 0 #000, -1px -1px 0 rgba(255,255,255,0.2)",
          }}
        >
          LEVEL AUSWAHL
        </h1>
        <div className="w-16" />
      </header>

      {/* Map area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="flex items-center w-full gap-2 px-2">
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })
            }
            className="shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all"
            style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
            aria-label="Scroll left"
          >
            ◀
          </button>

          <div
            ref={scrollRef}
            className="flex-1 overflow-x-scroll overflow-y-hidden select-none rounded-xl border-4 border-stone-800/40"
            style={{ cursor: "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            <div className="relative" style={{ width: MAP_W, height: MAP_H }}>
              {/* ── SVG world ── */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={MAP_W}
                height={MAP_H}
              >
                <rect width={MAP_W} height={MAP_H} fill="#3d7a20" />
                <rect
                  x={0}
                  y={0}
                  width={600}
                  height={MAP_H}
                  fill="#448c22"
                  opacity={0.25}
                />
                <rect
                  x={700}
                  y={0}
                  width={500}
                  height={MAP_H}
                  fill="#3a7018"
                  opacity={0.2}
                />
                <rect
                  x={1300}
                  y={0}
                  width={540}
                  height={MAP_H}
                  fill="#448c22"
                  opacity={0.22}
                />
                <River />
                {ROCKS.map(([x, y, s], i) => (
                  <RockSVG key={i} x={x} y={y} s={s} />
                ))}
                {FLOWERS.map(([x, y, c], i) => (
                  <FlowerSVG key={i} x={x} y={y} color={c} />
                ))}

                {/* Dirt path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#3d2208"
                  strokeWidth={30}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#c8922a"
                  strokeWidth={22}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#e8c070"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Platforms */}
                {levels.map((level) => (
                  <PlatformSVG
                    key={level.id}
                    x={level.x}
                    y={level.y}
                    done={level.stars > 0}
                    active={currentLevel?.id === level.id}
                    locked={level.stars === -1}
                    charNearby={charIsOnNode && nearestLevel?.id === level.id}
                  />
                ))}

                {/* Trees on top of everything */}
                {TREES.map(([x, y, s], i) => (
                  <TreeSVG key={i} x={x} y={y} s={s} />
                ))}
              </svg>

              {/* ── HTML overlay: node labels ── */}
              {levels.map((level) => (
                <LevelNode
                  key={level.id}
                  level={level}
                  isCurrent={currentLevel?.id === level.id}
                  charIsHere={charIsOnNode && nearestLevel?.id === level.id}
                />
              ))}

              {/* ── Pixel character ── */}
              {S.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: charPos.x,
                    top: charPos.y + CHARACTER_Y_OFFSET,
                    // translateX(-50%) centering is baked into the animation so it doesn't get lost
                    animation: walking
                      ? "charBob 0.3s ease-in-out infinite"
                      : "charIdle 1.8s ease-in-out infinite",
                    pointerEvents: "none",
                    zIndex: 20,
                    willChange: "transform",
                  }}
                >
                  <PixelCharacter facingLeft={facingLeft} walking={walking} />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })
            }
            className="shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all"
            style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>

        {/* Controls hint */}
        <p
          className="mt-3 font-pixel text-stone-600 dark:text-stone-400 opacity-60"
          style={{ fontSize: "8px" }}
        >
          ← → BEWEGEN &nbsp;|&nbsp; ↵ LEVEL STARTEN
        </p>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 py-4 bg-stone-900/50 dark:bg-stone-950/70 border-t-2 border-stone-700 dark:border-stone-800">
        <Link
          to="/einstellungen"
          className="font-pixel text-xs sm:text-sm text-stone-300 hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors"
        >
          Einstellungen...
        </Link>
      </footer>

      <div className="flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs">
        <span>Learning Gamification v1.0</span>
        <span className="opacity-80">© 2025</span>
      </div>
    </main>
  );
}
