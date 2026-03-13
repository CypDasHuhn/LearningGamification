import { ArrowLeft, User2 } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { getAuthFromCookies, isGuestFromCookies } from "~/lib/auth-cookies";

type IngameHeaderProps = {
  siteName: string;
  username?: string;
  backTo?: string;
  backLabel?: string;
};

function getDisplayName(override?: string): string {
  if (override) return override;
  if (typeof document === "undefined") return "Gast";
  const auth = getAuthFromCookies();
  if (auth) return auth.userName;
  if (isGuestFromCookies()) return "Gast";
  return "Gast";
}

export function IngameHeader({ siteName, username, backTo = "/", backLabel = "MENÜ" }: IngameHeaderProps) {
  const [displayName, setDisplayName] = useState("Gast");

  useEffect(() => {
    setDisplayName(getDisplayName(username));
  }, [username]);

  return (
    <header className="shrink-0 bg-linear-to-b from-sky-500 via-sky-600 to-sky-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b-4 border-b-slate-900 shadow-[0_8px_0_rgba(15,23,42,0.9)]">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <Link to={backTo} className="group">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-md border-[3px] border-slate-900 bg-sky-700/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-xs font-pixel text-amber-100 shadow-[0_3px_0_rgba(15,23,42,0.9)] group-hover:-translate-y-0.5 group-hover:shadow-[0_5px_0_rgba(15,23,42,0.9)] group-active:translate-y-0 group-active:shadow-[0_2px_0_rgba(15,23,42,0.9)] transition-all"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{backLabel}</span>
          </button>
        </Link>

        <h1
          className="flex-1 text-center font-pixel text-xs sm:text-base text-sky-50 truncate px-2"
          style={{
            textShadow: "2px 2px 0 #0f172a, -1px -1px 0 rgba(255,255,255,0.18)",
          }}
        >
          {siteName.toUpperCase()}
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2 rounded-md border-[3px] border-slate-900 bg-sky-800/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-xs font-pixel text-amber-50 shadow-[0_3px_0_rgba(15,23,42,0.9)]">
          <span className="max-w-20 sm:max-w-30 truncate">{displayName}</span>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-400 blur-[3px] opacity-60" />
            <div className="relative flex items-center justify-center rounded-full bg-rose-500 h-5 w-5 sm:h-6 sm:w-6 border-2 border-slate-900 text-slate-50">
              <User2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
