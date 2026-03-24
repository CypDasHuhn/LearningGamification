import { useState } from "react";
import {
  getAuthFromCookies,
  isAuthenticated,
  clearAuthCookies,
  setGuestCookies,
  type AuthCookies,
} from "~/lib/auth-cookies";

/** Return value of {@link useClientAuth}. */
export interface UseClientAuthResult {
  /**
   * `true` only during the server-side render phase before cookies can be read.
   * Use this to suppress a content flash (show a skeleton or "Gast" placeholder)
   * until the real auth state is known.
   */
  loading: boolean;
  /**
   * `true` when any session is active — covers both real users and guests.
   * Equivalent to calling {@link isAuthenticated} on the client.
   */
  isAuth: boolean;
  /**
   * Full auth data when a real user is logged in.
   * `null` for guests and during SSR.
   */
  auth: AuthCookies | null;
  /** Clears all auth cookies and sets `isAuth` to `false`. */
  logout: () => void;
  /**
   * Sets a guest-session cookie and sets `isAuth` to `true`.
   *
   * @param onSuccess - Optional callback invoked after state is updated.
   *   Use this for immediate `navigate()` calls that must run after the
   *   state change (e.g. `loginAsGuest(() => navigate("/chapter-selection"))`).
   */
  loginAsGuest: (onSuccess?: () => void) => void;
}

/**
 * SSR-safe hook for reading and mutating client-side authentication state.
 *
 * Reads cookies synchronously via a lazy `useState` initialiser, so there
 * is no `useEffect`-based hydration flash — the correct auth state is
 * available on the very first render in the browser.
 *
 * On the server (SSR), `document` is undefined, so `loading` is `true` and
 * all other fields are at their zero value until the first client render.
 *
 * @example
 * const { isAuth, auth, logout } = useClientAuth();
 * if (isAuth) return <Dashboard name={auth?.userName ?? "Gast"} />;
 */
export function useClientAuth(): UseClientAuthResult {
  const [state, setState] = useState<{
    loading: boolean;
    isAuth: boolean;
    auth: AuthCookies | null;
  }>(() => {
    // SSR guard: `document` does not exist on the server.
    if (typeof document === "undefined") {
      return { loading: true, isAuth: false, auth: null };
    }
    return {
      loading: false,
      isAuth: isAuthenticated(),
      auth: getAuthFromCookies(),
    };
  });

  function logout(): void {
    clearAuthCookies();
    setState({ loading: false, isAuth: false, auth: null });
  }

  function loginAsGuest(onSuccess?: () => void): void {
    setGuestCookies();
    setState({ loading: false, isAuth: true, auth: null });
    onSuccess?.();
  }

  return { ...state, logout, loginAsGuest };
}
