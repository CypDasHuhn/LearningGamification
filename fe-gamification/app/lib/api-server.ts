/**
 * Server-seitige API-Aufrufe für Loader (ohne document.cookie).
 * Nutzt den Cookie-Header der Request, um das Auth-Token zu lesen.
 */

import { parseAuthFromCookieHeader } from "./auth-cookies";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * GET-Request an die Backend-API mit Auth aus dem Request-Cookie.
 * Gibt null zurück, wenn kein Token vorhanden oder die Anfrage fehlschlägt.
 */
export async function apiGetServer<T>(
  cookieHeader: string | null,
  path: string
): Promise<T | null> {
  const auth = parseAuthFromCookieHeader(cookieHeader);
  if (!auth?.token) return null;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
