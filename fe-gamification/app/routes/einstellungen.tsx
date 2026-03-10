import { Link } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import { useMusicSettings } from "~/contexts/MusicSettingsContext";

export default function Einstellungen() {
  const { musicEnabled, setMusicEnabled } = useMusicSettings();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <IngameHeader siteName="Einstellungen" />

      <div className="flex-1 flex flex-col items-center gap-6 px-4 py-8">
        <div
          className="w-full max-w-md rounded-2xl border-4 border-stone-800 bg-stone-700 dark:bg-stone-800 p-5"
          style={{
            boxShadow:
              "inset 2px 2px 0 rgba(255,255,255,0.08), 4px 4px 0 rgba(0,0,0,0.3)",
          }}
        >
          <h2 className="font-pixel text-stone-100 text-sm sm:text-base mb-4">
            🔊 Sound &amp; Musik
          </h2>

          <label className="flex items-center justify-between gap-4 cursor-pointer group">
            <span className="font-pixel text-stone-200 text-xs sm:text-sm">
              Retro-Hintergrundmusik
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={musicEnabled}
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`relative w-12 h-7 rounded-full border-2 border-stone-600 transition-colors ${
                musicEnabled
                  ? "bg-amber-500 border-amber-600"
                  : "bg-stone-600 border-stone-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-stone-200 border-2 border-stone-400 transition-transform ${
                  musicEnabled ? "left-6" : "left-0.5"
                }`}
                style={{
                  boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.4)",
                }}
              />
            </button>
          </label>

          <p className="font-pixel text-[10px] text-stone-400 mt-3">
            Hintergrundmusik: &quot;HappyNES&quot; von Shane Ivers / Silverman
            Sound (CC BY 4.0)
          </p>
        </div>

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
