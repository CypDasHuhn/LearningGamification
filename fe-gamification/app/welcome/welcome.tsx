import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { AuthDialog } from "~/components/AuthDialog";
import type { AuthMode } from "~/components/AuthDialog";

const SPLASH_TEXTS = [
  "Lernen macht süchtig!",
  "Level up dein Wissen",
  "Auch mal Pause machen!",
  "XP sammeln statt vergessen",
  "Achievement unlocked: Hier gelandet",
];

function randomSplash() {
  return SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)];
}

const MAIN_MENU_ITEMS = [
  { to: "/chapter-selection", label: "Lernen starten", icon: "▶", requiresAuth: true },
  { to: "/fortschritt",       label: "Fortschritt",    icon: "📊", requiresAuth: false },
  { to: "/rangliste",         label: "Rangliste",      icon: "🏆", requiresAuth: false },
] as const;

const FOOTER_LINKS = [
  { to: "/einstellungen", label: "Einstellungen..." },
] as const;

const BUTTON_CLASS =
  "menu-button block w-full py-4 px-6 font-pixel text-base sm:text-lg text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 rounded hover:brightness-110 active:scale-[0.98] transition-all text-center";
const BUTTON_STYLE = {
  boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)",
};

export function Welcome() {
  const [splash, setSplash] = useState(SPLASH_TEXTS[0]);
  const [dialogMode, setDialogMode] = useState<AuthMode | null>(null);

  const { isAuth, loading, error, clearError, login, register, loginAsGuest, logout } =
    useAuth();

  useEffect(() => {
    setSplash(randomSplash());
  }, []);

  function openDialog(mode: AuthMode) {
    clearError();
    setDialogMode(mode);
  }

  function closeDialog() {
    clearError();
    setDialogMode(null);
  }

  function handleSubmit(userName: string, password: string) {
    if (dialogMode === "login") login(userName, password);
    else if (dialogMode === "register") register(userName, password);
  }

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      {/* Splash text */}
      <div
        className="absolute top-8 right-8 md:top-12 md:right-12 text-amber-600 dark:text-amber-400 font-pixel text-sm md:text-base transform rotate-12 drop-shadow-md select-none"
        style={{ textShadow: "2px 2px 0 #000" }}
      >
        {splash}
      </div>

      {/* Auth button */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-10">
        {isAuth ? (
          <button
            type="button"
            onClick={logout}
            className="font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            Abmelden
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openDialog("login")}
            className="font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            Anmelden / Registrierung
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        <header className="mb-10 md:mb-14 text-center">
          <h1
            className="font-pixel text-2xl sm:text-3xl md:text-4xl text-stone-800 dark:text-stone-100 tracking-wide"
            style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 rgba(255,255,255,0.3)" }}
          >
            LEARNING
          </h1>
          <p
            className="font-pixel text-lg sm:text-xl md:text-2xl text-stone-600 dark:text-stone-300 mt-1"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            GAMIFICATION
          </p>
        </header>

        <nav className="w-full max-w-[320px] space-y-3">
          {MAIN_MENU_ITEMS.map(({ to, label, icon, requiresAuth }) =>
            requiresAuth && !isAuth ? (
              <button
                key={to}
                type="button"
                onClick={() => openDialog("login")}
                className={BUTTON_CLASS}
                style={BUTTON_STYLE}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </button>
            ) : (
              <Link key={to} to={to} className={BUTTON_CLASS} style={BUTTON_STYLE}>
                <span className="mr-2">{icon}</span>
                {label}
              </Link>
            ),
          )}
        </nav>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 py-4 bg-stone-900/50 dark:bg-stone-950/70 border-t-2 border-stone-700 dark:border-stone-800">
        {FOOTER_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="footer-btn font-pixel text-xs sm:text-sm text-stone-300 hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors"
          >
            {label}
          </Link>
        ))}
      </footer>

      <div className="flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs">
        <span>Learning Gamification v1.0</span>
        <span className="opacity-80">© 2025</span>
      </div>

      <AuthDialog
        mode={dialogMode ?? "login"}
        isOpen={dialogMode !== null}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onSwitchMode={() => openDialog(dialogMode === "login" ? "register" : "login")}
        onGuestLogin={loginAsGuest}
        error={error}
        loading={loading}
      />
    </main>
  );
}
