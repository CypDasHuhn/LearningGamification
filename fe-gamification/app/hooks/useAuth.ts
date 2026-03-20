import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getAuthFromCookies,
  isGuestFromCookies,
  setAuthCookies,
  setGuestCookies,
  clearAuthCookies,
} from "~/lib/auth-cookies";
import { login as apiLogin, register as apiRegister } from "~/lib/api";

/**
 * Centralises all authentication state and operations.
 *
 * Reads the initial auth state from cookies so the UI reflects the current
 * session without a round-trip. All API calls are handled here; consumers
 * only deal with plain function calls and derived state.
 */
export function useAuth() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuth(getAuthFromCookies() !== null || isGuestFromCookies());
  }, []);

  function clearError() {
    setError(null);
  }

  async function login(userName: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(userName, password);
      setAuthCookies(data);
      setIsAuth(true);
      navigate("/chapter-selection");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  async function register(userName: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRegister(userName, password);
      setAuthCookies(data);
      setIsAuth(true);
      navigate("/chapter-selection");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registrierung fehlgeschlagen",
      );
    } finally {
      setLoading(false);
    }
  }

  function loginAsGuest() {
    setGuestCookies();
    setIsAuth(true);
    navigate("/chapter-selection");
  }

  function logout() {
    clearAuthCookies();
    setIsAuth(false);
  }

  return { isAuth, loading, error, clearError, login, register, loginAsGuest, logout };
}
