import { Link } from "react-router";
import { IngameHeader } from "~/components/ingame-header";

export default function Einstellungen() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <IngameHeader siteName="Einstellungen" />

      <div className="flex-1 flex flex-col items-center gap-6 px-4 py-8">
        <Link to="/" className="mt-4 block w-full max-w-md">
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
