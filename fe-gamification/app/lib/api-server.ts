import { parseAuthFromCookieHeader } from "./auth-cookies";

const API_BASE =
  (typeof process !== "undefined" ? process.env?.BACKEND_URL : undefined) ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:8080";

/**
 * Performs an authenticated GET request from a server-side loader.
 *
 * Reads the Bearer token from the incoming HTTP `Cookie` header so the
 * browser's `document.cookie` API is never touched (SSR-safe).
 *
 * @param cookieHeader - The value of the `Cookie` request header
 *   (typically `request.headers.get("Cookie")`).
 * @param path - API path relative to `VITE_API_URL` (e.g. `"/themes"`).
 * @returns Parsed JSON response typed as `T`, or `null` when:
 *   - no auth token is present in the cookies,
 *   - the HTTP response status is not OK, or
 *   - a network/parse error occurs.
 * @remarks
 * The caller cannot distinguish between "no auth", "API error", and
 * "network error" — all three return `null`. Use server-side redirects
 * or fallback data at the call site accordingly.
 */
export async function apiGetServer<T>(
  cookieHeader: string | null,
  path: string,
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
