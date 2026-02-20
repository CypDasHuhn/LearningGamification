import type { FormEvent } from "react";

export function LoginDialog({
  isOpen,
  onClose,
  onLogin,
  onGuestLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (e: FormEvent) => void;
  onGuestLogin: () => void;
}) {
  if (!isOpen) return null;

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"
      >
        <h2
          id="login-dialog-title"
          className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
        >
          Anmelden
        </h2>
        <form onSubmit={onLogin} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              E-Mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="name@beispiel.de"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Passwort
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <button
              type="button"
              onClick={onGuestLogin}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-md"
            >
              Als Gast spielen
            </button>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Anmelden
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
