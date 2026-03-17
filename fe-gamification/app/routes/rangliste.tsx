import { Link } from "react-router";
import { useEffect, useState } from "react";
import { IngameHeader } from "~/components/ingame-header";
import { getLeaderboard, type LeaderboardEntry } from "~/lib/api";

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function Rangliste() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeaderboard()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Fehler beim Laden");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500">
      <IngameHeader siteName="Rangliste" />

      <div className="flex-1 flex flex-col items-center gap-5 px-4 py-6 sm:py-8">
        <div
          className="w-full max-w-md mb-5 rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 shadow-[0_16px_0_rgba(15,23,42,0.85)] overflow-hidden"
          style={{
            boxShadow:
              "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)",
          }}
        >
          {/* Titel-Bereich */}
          <div className="bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center">
            <h2
              className="font-pixel text-sm sm:text-base text-amber-100"
              style={{ textShadow: "2px 2px 0 #0f172a" }}
            >
              🏆 TOP SPIELER
            </h2>
            <p className="font-pixel text-[8px] sm:text-[9px] text-stone-400 mt-1">
              NACH PUNKTEN
            </p>
          </div>

          {/* Tabellen-Header */}
          <div className="grid grid-cols-[56px_1fr_72px] sm:grid-cols-[64px_1fr_80px] gap-2 px-4 py-2 bg-stone-600 dark:bg-stone-700 border-b-2 border-stone-800 font-pixel text-[8px] sm:text-[9px] text-stone-400 uppercase tracking-wide">
            <span>#</span>
            <span>Name</span>
            <span className="text-right">Punkte</span>
          </div>

          {/* Einträge */}
          <ul className="divide-y-2 divide-stone-800 dark:divide-stone-700">
            {loading && (
              <li className="px-4 py-6 text-center font-pixel text-sm text-stone-400">
                Lade Rangliste…
              </li>
            )}
            {error && (
              <li className="px-4 py-6 text-center font-pixel text-sm text-amber-200">
                {error}
              </li>
            )}
            {!loading && !error && entries.length === 0 && (
              <li className="px-4 py-6 text-center font-pixel text-sm text-stone-400">
                Noch keine Einträge.
              </li>
            )}
            {!loading &&
              !error &&
              entries.map(({ rank, userId, userName, points, currentUser }) => (
                <li
                  key={userId}
                  className={`grid grid-cols-[56px_1fr_72px] sm:grid-cols-[64px_1fr_80px] gap-2 px-4 py-2.5 sm:py-3 items-center border-l-4 transition-colors ${
                    currentUser
                      ? "bg-amber-900/50 border-amber-400 dark:bg-amber-900/40"
                      : "bg-stone-700 odd:bg-stone-600 dark:bg-stone-800 dark:odd:bg-stone-700 border-transparent hover:bg-amber-900/40"
                  }`}
                >
                  <span className="font-pixel text-sm sm:text-base text-stone-200 flex items-center gap-1">
                    {RANK_ICONS[rank] ?? rank}
                  </span>
                  <span className="font-pixel text-xs sm:text-sm text-stone-100 truncate">
                    {userName}
                    {currentUser && (
                      <span className="ml-1 text-amber-300" aria-hidden="true">
                        (du)
                      </span>
                    )}
                  </span>
                  <span className="font-pixel text-xs sm:text-sm text-amber-300 text-right">
                    {points.toLocaleString("de-DE")}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <Link to="/" className="mt-6 block w-full max-w-md">
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
