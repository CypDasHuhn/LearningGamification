import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, redirect } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import {
  parseAuthFromCookieHeader,
  isGuestFromCookieHeader,
} from "~/lib/auth-cookies";

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const hasAuth = parseAuthFromCookieHeader(cookieHeader) !== null;
  const isGuest = isGuestFromCookieHeader(cookieHeader);
  if (!hasAuth && !isGuest) {
    return redirect("/");
  }
  return null;
}

const CHAPTERS = [
  {
    chapter: 1 as const,
    node: { x: 18, y: 72 },
    title: "Einführung",
  },
  {
    chapter: 2 as const,
    node: { x: 50, y: 52 },
    title: "Variablen",
  },
  {
    chapter: 3 as const,
    node: { x: 82, y: 34 },
    title: "Schleifen",
  },
] as const;

type ChapterId = (typeof CHAPTERS)[number]["chapter"];

function chapterPathD() {
  if (CHAPTERS.length === 0) return "";
  let d = `M ${CHAPTERS[0].node.x} ${CHAPTERS[0].node.y}`;
  for (let i = 1; i < CHAPTERS.length; i++) {
    const p = CHAPTERS[i - 1].node;
    const c = CHAPTERS[i].node;
    const mx = (p.x + c.x) / 2;
    d += ` C ${mx},${p.y} ${mx},${c.y} ${c.x},${c.y}`;
  }
  return d;
}

const PATH_D = chapterPathD();

function JetSprite() {
  return (
    <div
      className="relative w-12 h-8"
      style={{
        filter: "drop-shadow(2px 4px 0 rgba(0,0,0,0.45))",
      }}
    >
      <div className="absolute left-0 top-2 w-9 h-4 rounded-r-full bg-sky-300" />
      <div className="absolute left-7 top-0 w-5 h-6 rounded-full bg-sky-400" />
      <div className="absolute left-1 top-3 w-7 h-[3px] rounded-full bg-sky-500" />
      <div className="absolute left-4 top-5 w-6 h-[3px] rounded-full bg-sky-500" />
      <div className="absolute right-1 top-2 w-2 h-3 rounded-full bg-amber-300" />
      <div className="absolute -left-1 top-2 w-2 h-3 rounded-full bg-sky-500" />
    </div>
  );
}

function NodeCircle({
  x,
  y,
  label,
  color,
  size = "md",
  href,
  scale = 1,
  isActive = false,
  onClick,
}: {
  x: number;
  y: number;
  label?: number | null;
  color: "black" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  href?: string;
  scale?: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-20 h-20 text-2xl sm:text-3xl",
  };
  const colorClasses = {
    black: "bg-stone-900 text-amber-100 border-stone-950",
    red: "bg-sky-500 text-slate-900 border-sky-700",
    orange: "bg-amber-400 text-slate-900 border-amber-500",
  };
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
  };
  const baseClass = `absolute flex items-center justify-center rounded-full border-4 font-pixel shadow-[0_6px_0_rgba(15,23,42,0.7)] transition-transform duration-300 z-10 ${sizeClasses[size]} ${colorClasses[color]} ${
    isActive ? "ring-4 ring-sky-300 shadow-[0_0_0_4px_rgba(15,23,42,0.85)]" : ""
  }`;

  const content = label != null ? label : null;

  if (href) {
    return (
      <Link
        to={href}
        onClick={onClick}
        className={`${baseClass} hover:scale-110 active:scale-95`}
        style={style}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} hover:scale-110 active:scale-95`}
      style={style}
    >
      {content}
    </button>
  );
}

export default function ChapterSelection() {
  const navigate = useNavigate();
  const [activeChapter, setActiveChapter] = useState<ChapterId>(CHAPTERS[0].chapter);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveChapter((prev) => {
          const idx = CHAPTERS.findIndex((c) => c.chapter === prev);
          const next = CHAPTERS[(idx + 1) % CHAPTERS.length];
          return next.chapter;
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveChapter((prev) => {
          const idx = CHAPTERS.findIndex((c) => c.chapter === prev);
          const next =
            CHAPTERS[(idx - 1 + CHAPTERS.length) % CHAPTERS.length];
          return next.chapter;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        navigate(`/level-selection?chapter=${activeChapter}`);
      }
    },
    [activeChapter, navigate],
  );

  useEffect(() => {
    mapRef.current?.focus();
  }, []);

  const currentNode = CHAPTERS.find((c) => c.chapter === activeChapter) ?? CHAPTERS[0];

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500 dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-900">
      <IngameHeader siteName="Chapter Selection" />

      <div className="flex-1 flex justify-center items-center min-h-0 p-4">
        <div
          ref={mapRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative w-full max-w-3xl aspect-[3/2] rounded-3xl border-4 border-stone-900 shadow-[0_16px_0_rgba(15,23,42,0.85)] bg-emerald-600 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
          aria-label="Kapitelkarte. Mit Pfeiltasten Kapitel wechseln, mit Enter öffnen."
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <linearGradient id="bgStripes" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#15803d" />
                <stop offset="0.5" stopColor="#16a34a" />
                <stop offset="1" stopColor="#15803d" />
              </linearGradient>
            </defs>

            <rect width="100" height="100" fill="url(#bgStripes)" />
            <rect
              x="0"
              y="0"
              width="40"
              height="100"
              fill="#166534"
              opacity="0.35"
            />
            <rect
              x="55"
              y="0"
              width="45"
              height="100"
              fill="#16a34a"
              opacity="0.22"
            />

            <path
              d={PATH_D}
              fill="none"
              stroke="#3b2410"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={PATH_D}
              fill="none"
              stroke="#d1902a"
              strokeWidth="6.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={PATH_D}
              fill="none"
              stroke="#facc6b"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {[{ x: 28, y: 18 }, { x: 12, y: 52 }, { x: 64, y: 80 }, { x: 90, y: 60 }].map(
              (t, i) => (
                <g key={i}>
                  <circle cx={t.x} cy={t.y} r={4.2} fill="#14532d" />
                  <circle cx={t.x - 2} cy={t.y - 2} r={3.1} fill="#15803d" />
                  <circle cx={t.x + 1.5} cy={t.y + 1.2} r={2.7} fill="#16a34a" />
                </g>
              ),
            )}
            {[{ x: 40, y: 60 }, { x: 70, y: 20 }, { x: 84, y: 46 }].map(
              (r, i) => (
                <g key={i} opacity="0.9">
                  <ellipse
                    cx={r.x + 1}
                    cy={r.y + 1.5}
                    rx="3.8"
                    ry="2.4"
                    fill="rgba(0,0,0,0.25)"
                  />
                  <ellipse cx={r.x} cy={r.y} rx="3.8" ry="2.4" fill="#737373" />
                </g>
              ),
            )}
          </svg>

          <div className="absolute inset-0">
            {CHAPTERS.map(({ chapter, node }) => (
              <NodeCircle
                key={chapter}
                x={node.x}
                y={node.y}
                label={chapter}
                color="orange"
                size="lg"
                href={`/level-selection?chapter=${chapter}`}
                scale={chapter === activeChapter ? 1.1 : 1}
                isActive={chapter === activeChapter}
                onClick={() => setActiveChapter(chapter)}
              />
            ))}

            <div
              className="absolute transition-all duration-300 ease-out"
              style={{
                left: `${currentNode.node.x}%`,
                top: `${currentNode.node.y - 10}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <JetSprite />
              <div className="mt-1 text-center font-pixel text-[7px] text-amber-100 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                ↵ ENTER
              </div>
            </div>
          </div>

          <div className="absolute left-3 bottom-3 px-2 py-1 rounded bg-stone-900/70 text-amber-100 font-pixel text-[7px] shadow-[0_3px_0_rgba(0,0,0,0.7)]">
            ← → Kapitel wählen · ↵ starten
          </div>
          <div className="absolute right-3 top-3 px-2 py-1 rounded bg-stone-900/60 text-amber-100 font-pixel text-[7px]">
            {currentNode.title}
          </div>
        </div>
      </div>
    </div>
  );
}
