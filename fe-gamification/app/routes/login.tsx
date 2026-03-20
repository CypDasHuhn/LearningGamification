import { Form, Link, useActionData, useNavigation } from "react-router";
import { asyncPipe } from "~/utils/async-pipe";
import {
  withLoginData,
  routeByLoginIntent,
} from "~/functions/register-pipe";

export const action = asyncPipe(withLoginData, routeByLoginIntent);

type ActionData = {
  success?: boolean;
  error?: string;
  intent?: "login" | "register" | string;
};

export default function Login() {
  const actionData = useActionData() as ActionData | undefined;
  const error =
    actionData?.success === false && actionData.intent === "login"
      ? actionData.error ?? null
      : null;

  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md font-pixel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-stone-800 dark:text-stone-100 text-2xl font-semibold">
              Anmelden
            </h1>
            <Link to="/" className="text-amber-700 dark:text-amber-300 underline">
              ← Menü
            </Link>
          </div>

          <Form method="post" action="/login" className="flex flex-col gap-4">
            <input type="hidden" name="intent" value="login" />

            <label className="flex flex-col gap-1">
              <span className="text-sm text-stone-700 dark:text-stone-300">
                Benutzername
              </span>
              <input
                type="text"
                name="userName"
                required
                className="w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                placeholder="deinname"
                autoComplete="username"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-stone-700 dark:text-stone-300">
                Passwort
              </span>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3 items-center justify-between pt-2">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Noch kein Konto?{" "}
                <Link
                  to="/register"
                  className="underline text-amber-600 dark:text-amber-400 hover:no-underline"
                >
                  Registrieren
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-900 rounded border-2 border-amber-700"
              >
                {loading ? "…" : "Anmelden"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

