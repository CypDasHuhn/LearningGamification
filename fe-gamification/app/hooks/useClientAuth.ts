import { useEffect, useState } from "react";
import {
  getAuthFromCookies,
  isAuthenticated,
  clearAuthCookies,
  setGuestCookies,
  type AuthCookies,
} from "~/lib/auth-cookies";

/** Return value of {@link useClientAuth}. */
export interface UseClientAuthResult {
  /** `true` until client-side cookie state has been read. */
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
 * Uses a hydration-safe two-phase model:
 * - initial render (SSR + first client pass): `loading=true`, guest defaults
 * - post-mount effect: reads cookies and updates auth state
 *
 * This avoids SSR/client markup mismatches on pages that display user names.
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
  }>({ loading: true, isAuth: false, auth: null });

  useEffect(() => {
    setState({
      loading: false,
      isAuth: isAuthenticated(),
      auth: getAuthFromCookies(),
    });
  }, []);

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
