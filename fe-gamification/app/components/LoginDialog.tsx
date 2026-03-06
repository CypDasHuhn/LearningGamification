import type { FormEvent } from "react";

export function LoginDialog({
  isOpen,
  onClose,
  onSubmit,
  onSwitchToRegister,
  onGuestLogin,
  error,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userName: string, password: string) => void;
  onSwitchToRegister: () => void;
  onGuestLogin: () => void;
  error: string | null;
  loading: boolean;
}) {
  if (!isOpen) return null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const userName = (form.elements.namedItem("userName") as HTMLInputElement)?.value?.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    if (userName && password) onSubmit(userName, password);
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md font-pixel"
      >
        <div className="bg-stone-100 dark:bg-stone-800 rounded-lg shadow-xl px-6 py-6 sm:px-8 sm:py-8 border-4 border-stone-700 dark:border-stone-600 box-border min-w-0">
          <h2
            id="login-dialog-title"
            className="text-lg font-semibold mb-6 text-stone-800 dark:text-stone-100"
          >
            Anmelden
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="login-userName"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
              >
                Benutzername
              </label>
              <input
                id="login-userName"
                name="userName"
                type="text"
                autoComplete="username"
                required
                className="w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                placeholder="deinname"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
              >
                Passwort
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-4 mt-4">
              <button
                type="button"
                onClick={onGuestLogin}
                className="w-full py-3 px-4 bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 text-stone-800 dark:text-stone-100 rounded border-2 border-stone-500 dark:border-stone-500 transition-colors"
              >
                Als Gast fortfahren
              </button>
              <p className="text-xs text-stone-600 dark:text-stone-400 text-center pt-1">
                Noch kein Konto?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="underline text-amber-600 dark:text-amber-400 hover:no-underline"
                >
                  Registrieren
                </button>
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-w-0 sm:flex-none px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded border-2 border-stone-500"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-w-0 sm:flex-none px-3 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-900 rounded border-2 border-amber-700"
                >
                  {loading ? "…" : "Anmelden"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
