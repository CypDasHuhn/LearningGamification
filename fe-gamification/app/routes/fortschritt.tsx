import { Link } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import { useClientAuth } from "~/hooks/useClientAuth";

const MOCK_PROGRESS = [
  {
    chapter: "Kapitel 1",
    title: "Grundlagen",
    levels: 8,
    completed: 8,
    xp: 320,
  },
  {
    chapter: "Kapitel 2",
    title: "Variablen & Typen",
    levels: 6,
    completed: 5,
    xp: 190,
  },
  {
    chapter: "Kapitel 3",
    title: "Kontrollstrukturen",
    levels: 7,
    completed: 2,
    xp: 80,
  },
  { chapter: "Kapitel 4", title: "Funktionen", levels: 5, completed: 0, xp: 0 },
];

const TOTAL_XP = MOCK_PROGRESS.reduce((sum, c) => sum + c.xp, 0);
const TOTAL_LEVELS = MOCK_PROGRESS.reduce((sum, c) => sum + c.levels, 0);
const COMPLETED_LEVELS = MOCK_PROGRESS.reduce((sum, c) => sum + c.completed, 0);

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div
      className="w-full h-3 rounded bg-stone-900 border-2 border-stone-800 overflow-hidden"
      style={{ boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.5)" }}
    >
      <div
        className="h-full rounded bg-amber-400 transition-all"
        style={{
          width: `${pct}%`,
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
        }}
      />
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500">
      <IngameHeader siteName="Fortschritt" />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-6">
        <div
          className="w-full max-w-md rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 overflow-hidden"
          style={{
            boxShadow:
              "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)",
          }}
        >
          <div className="bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center">
            <h2
              className="font-pixel text-sm sm:text-base text-amber-100"
              style={{ textShadow: "2px 2px 0 #0f172a" }}
            >
              🔒 KEIN ZUGRIFF
            </h2>
          </div>

          <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
            <p
              className="font-pixel text-[10px] sm:text-xs text-stone-300 leading-relaxed"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              Du musst angemeldet sein,
              <br />
              um deinen Fortschritt
              <br />
              sehen zu können.
            </p>

            <Link
              to="/"
              className="mt-2 block w-full py-3 px-6 font-pixel text-xs sm:text-sm text-stone-200 bg-amber-700 border-4 border-stone-800 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all text-center"
              style={{
                boxShadow:
                  "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)",
              }}
            >
              → Zum Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Progress page — requires an active session (real user or guest). */
export default function Fortschritt() {
  const { loading, isAuth } = useClientAuth();

  // Avoid layout shift before cookie check resolves
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500">
        <IngameHeader siteName="Fortschritt" />
      </div>
    );
  }

  if (!isAuth) {
    return <NotLoggedIn />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500">
      <IngameHeader siteName="Fortschritt" />

      <div className="flex-1 flex flex-col items-center gap-5 px-4 py-6 sm:py-8">
        {/* Übersichts-Karte */}
        <div
          className="w-full max-w-md rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 overflow-hidden"
          style={{
            boxShadow:
              "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)",
          }}
        >
          <div className="bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center">
            <h2
              className="font-pixel text-sm sm:text-base text-amber-100"
              style={{ textShadow: "2px 2px 0 #0f172a" }}
            >
              📊 MEIN FORTSCHRITT
            </h2>
            <p className="font-pixel text-[8px] sm:text-[9px] text-stone-400 mt-1">
              GESAMT-ÜBERSICHT
            </p>
          </div>

          {/* Statistiken */}
          <div className="grid grid-cols-3 divide-x-2 divide-stone-800 border-b-4 border-stone-800">
            {[
              { label: "XP", value: TOTAL_XP.toLocaleString("de-DE") },
              { label: "Level", value: `${COMPLETED_LEVELS}/${TOTAL_LEVELS}` },
              {
                label: "Kapitel",
                value: `${MOCK_PROGRESS.filter((c) => c.completed === c.levels).length}/${MOCK_PROGRESS.length}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center py-3 px-2 bg-stone-700 dark:bg-stone-800"
              >
                <span
                  className="font-pixel text-base sm:text-lg text-amber-300"
                  style={{ textShadow: "1px 1px 0 #000" }}
                >
                  {value}
                </span>
                <span className="font-pixel text-[7px] sm:text-[8px] text-stone-400 uppercase mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Gesamt-Fortschrittsbalken */}
          <div className="px-4 py-3 bg-stone-600 dark:bg-stone-700 border-b-4 border-stone-800">
            <div className="flex justify-between mb-1.5">
              <span className="font-pixel text-[8px] sm:text-[9px] text-stone-300 uppercase">
                Gesamtfortschritt
              </span>
              <span className="font-pixel text-[8px] sm:text-[9px] text-amber-300">
                {Math.round((COMPLETED_LEVELS / TOTAL_LEVELS) * 100)}%
              </span>
            </div>
            <ProgressBar value={COMPLETED_LEVELS} max={TOTAL_LEVELS} />
          </div>
        </div>

        {/* Kapitel-Karte */}
        <div
          className="w-full max-w-md mb-5 rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 overflow-hidden"
          style={{
            boxShadow:
              "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)",
          }}
        >
          <div className="bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center">
            <h2
              className="font-pixel text-sm sm:text-base text-amber-100"
              style={{ textShadow: "2px 2px 0 #0f172a" }}
            >
              📚 KAPITEL
            </h2>
          </div>

          {/* Tabellen-Header */}
          <div className="grid grid-cols-[1fr_80px_56px] sm:grid-cols-[1fr_96px_64px] gap-2 px-4 py-2 bg-stone-600 dark:bg-stone-700 border-b-2 border-stone-800 font-pixel text-[8px] sm:text-[9px] text-stone-400 uppercase tracking-wide">
            <span>Kapitel</span>
            <span className="text-center">Level</span>
            <span className="text-right">XP</span>
          </div>

          <ul className="divide-y-2 divide-stone-800 dark:divide-stone-700">
            {MOCK_PROGRESS.map(({ chapter, title, levels, completed, xp }) => {
              const done = completed === levels;
              const started = completed > 0;
              return (
                <li
                  key={chapter}
                  className="px-4 py-3 bg-stone-700 odd:bg-stone-600 dark:bg-stone-800 dark:odd:bg-stone-700"
                >
                  <div className="grid grid-cols-[1fr_80px_56px] sm:grid-cols-[1fr_96px_64px] gap-2 items-center mb-2">
                    <div>
                      <span className="font-pixel text-[8px] sm:text-[9px] text-stone-400 block">
                        {chapter}
                      </span>
                      <span className="font-pixel text-xs sm:text-sm text-stone-100 truncate block">
                        {title}
                      </span>
                    </div>
                    <span className="font-pixel text-xs sm:text-sm text-stone-200 text-center">
                      {done ? (
                        <span className="text-emerald-400">✓ {levels}</span>
                      ) : (
                        `${completed}/${levels}`
                      )}
                    </span>
                    <span className="font-pixel text-xs sm:text-sm text-amber-300 text-right">
                      {xp > 0 ? xp.toLocaleString("de-DE") : "—"}
                    </span>
                  </div>
                  {started && <ProgressBar value={completed} max={levels} />}
                  {!started && (
                    <div
                      className="w-full h-3 rounded bg-stone-900 border-2 border-stone-800"
                      style={{ boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.5)" }}
                    >
                      <span className="sr-only">Noch nicht begonnen</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <Link to="/" className="block w-full max-w-md">
          <button
            type="button"
            className="menu-button block w-full py-3 px-6 font-pixel text-sm sm:text-base text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 dark:border-stone-800 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all text-center"
            style={{
              boxShadow:
                "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)",
            }}
          >
            ← Zurück zum Menü
          </button>
        </Link>
      </div>
    </div>
  );
}
