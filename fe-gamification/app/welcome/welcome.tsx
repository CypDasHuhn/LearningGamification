import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useClientAuth } from "~/hooks/useClientAuth";

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

const mainMenuItems = [
  { to: "/chapter-selection", label: "Lernen starten", icon: "▶" },
  { to: "/fortschritt", label: "Fortschritt", icon: "📊" },
  { to: "/rangliste", label: "Rangliste", icon: "🏆" },
];

const footerMenuItems = [
  { to: "/einstellungen", label: "Einstellungen..." },
  { href: "https://reactrouter.com/docs", label: "Docs", external: true },
  { href: "https://rmx.as/discord", label: "Discord", external: true },
];

const buttonClass =
  "menu-button block w-full py-4 px-6 font-pixel text-base sm:text-lg text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 dark:border-stone-800 rounded hover:brightness-110 active:scale-[0.98] transition-all text-center";
const buttonStyle = {
  boxShadow:
    "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)",
};

export function Welcome() {
  const [splash, setSplash] = useState(SPLASH_TEXTS[0]);
  const navigate = useNavigate();

  const { isAuth, logout, loginAsGuest } = useClientAuth();

  useEffect(() => {
    setSplash(randomSplash());
  }, []);

  function handleGuestLogin() {
    loginAsGuest(() => navigate("/chapter-selection"));
  }

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      {/* Splash-Text oben rechts */}
      <div
        className="absolute top-8 right-8 md:top-12 md:right-12 text-amber-600 dark:text-amber-400 font-pixel text-sm md:text-base transform rotate-12 drop-shadow-md select-none"
        style={{ textShadow: "2px 2px 0 #000" }}
      >
        {splash}
      </div>

      {/* Anmelden / Registrierung oder Abmelden */}
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
          <div className="flex flex-col gap-2">
            <Link
              to="/login"
              className="font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer text-center"
            >
              Anmelden
            </Link>
            <Link
              to="/register"
              className="font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer text-center"
            >
              Registrieren
            </Link>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer text-center"
            >
              Als Gast fortfahren
            </button>
          </div>
        )}
      </div>

      {/* Zentrierter Inhalt */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        <header className="mb-10 md:mb-14 text-center">
          <h1
            className="font-pixel text-2xl sm:text-3xl md:text-4xl text-stone-800 dark:text-stone-100 tracking-wide"
            style={{
              textShadow: "3px 3px 0 #000, -1px -1px 0 rgba(255,255,255,0.3)",
            }}
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
          {mainMenuItems.map(({ to, label, icon }) =>
            to === "/chapter-selection" && !isAuth ? (
              <Link
                key={to}
                className={buttonClass}
                style={buttonStyle}
                to="/login"
              >
                <span className="mr-2">{icon}</span>
                {label}
              </Link>
            ) : (
              <Link
                key={to}
                to={to}
                className={buttonClass}
                style={buttonStyle}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </Link>
            ),
          )}
        </nav>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 py-4 bg-stone-900/50 dark:bg-stone-950/70 border-t-2 border-stone-700 dark:border-stone-800">
        {footerMenuItems.map((item) =>
          "external" in item && item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="footer-btn font-pixel text-xs sm:text-sm text-stone-300 hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={(item as { to: string }).to}
              className="footer-btn font-pixel text-xs sm:text-sm text-stone-300 hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors"
            >
              {item.label}
            </Link>
          ),
        )}
      </footer>

      <div className="flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs">
        <span>Learning Gamification v1.0</span>
        <span className="opacity-80">© 2025</span>
      </div>
    </main>
  );
}
