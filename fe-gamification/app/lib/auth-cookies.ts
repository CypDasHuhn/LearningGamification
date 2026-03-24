// All JSDoc is in English for consistency across the codebase.

/** Cookie name constants — centralised so renaming only requires one change. */
const COOKIE_TOKEN     = "auth_token";
const COOKIE_USER_ID   = "auth_user_id";
const COOKIE_USER_NAME = "auth_user_name";
const COOKIE_GUEST     = "auth_guest";

/** Authenticated user data stored in browser cookies after a successful login. */
export interface AuthCookies {
  token: string;
  userId: number;
  userName: string;
}

// ─── Internal cookie helpers ──────────────────────────────────────────────────

/**
 * Writes a cookie with `path=/` and `SameSite=Lax`.
 * The value is URI-encoded to handle special characters safely.
 *
 * @param name - Cookie name.
 * @param value - Cookie value (will be `encodeURIComponent`-encoded).
 */
function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

/**
 * Reads a cookie by exact name from `document.cookie`.
 *
 * Uses a regex anchored at the start of the string or after `"; "` to
 * guarantee exact name matching (prevents `"auth_token"` from matching
 * a hypothetical `"long_auth_token"` cookie).
 *
 * @param name - Cookie name to look up.
 * @returns Decoded cookie value, or `null` if not found.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"),
  );
  const value = match ? match[1] : null;
  return value ? decodeURIComponent(value) : null;
}

/**
 * Deletes a cookie by setting its `max-age` to 0.
 *
 * @param name - Cookie name to remove.
 */
function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Persists auth data in cookies after a successful login or registration.
 * Clears any existing guest session cookie.
 *
 * @param data - Auth data returned by the login / register endpoint.
 */
export function setAuthCookies(data: AuthCookies): void {
  setCookie(COOKIE_TOKEN, data.token);
  setCookie(COOKIE_USER_ID, String(data.userId));
  setCookie(COOKIE_USER_NAME, data.userName);
  deleteCookie(COOKIE_GUEST);
}

/**
 * Reads the authenticated user's data from browser cookies.
 *
 * @returns `AuthCookies` when all three auth cookies are present and valid,
 *   or `null` if the user is not logged in (or is a guest).
 */
export function getAuthFromCookies(): AuthCookies | null {
  const token    = getCookie(COOKIE_TOKEN);
  const userId   = getCookie(COOKIE_USER_ID);
  const userName = getCookie(COOKIE_USER_NAME);
  if (!token || !userId || !userName) return null;
  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) return null;
  return { token, userId: id, userName };
}

/**
 * Creates a guest session by setting the guest flag cookie.
 * Clears any existing user auth cookies.
 */
export function setGuestCookies(): void {
  setCookie(COOKIE_GUEST, "true");
  deleteCookie(COOKIE_TOKEN);
  deleteCookie(COOKIE_USER_ID);
  deleteCookie(COOKIE_USER_NAME);
}

/**
 * Returns `true` when a guest session cookie is active.
 *
 * @remarks Only valid in browser contexts; always returns `false` on the server.
 */
export function isGuestFromCookies(): boolean {
  return getCookie(COOKIE_GUEST) === "true";
}

/**
 * Returns `true` when any session (real user or guest) is active.
 * This is the canonical check to use for auth-gating UI.
 *
 * @remarks Only valid in browser contexts; always returns `false` on the server.
 */
export function isAuthenticated(): boolean {
  return getAuthFromCookies() !== null || isGuestFromCookies();
}

/**
 * Removes all auth and guest cookies (logout).
 */
export function clearAuthCookies(): void {
  deleteCookie(COOKIE_TOKEN);
  deleteCookie(COOKIE_USER_ID);
  deleteCookie(COOKIE_USER_NAME);
  deleteCookie(COOKIE_GUEST);
}

/**
 * Parses auth data from an HTTP `Cookie` header string (server-side use).
 *
 * Intended for use in React Router loaders where `document.cookie` is
 * unavailable. Splits the header on `";"`, trims whitespace, and finds
 * the exact cookie by name prefix.
 *
 * @param cookieHeader - The raw value of the `Cookie` HTTP header, or `null`.
 * @returns Parsed `AuthCookies`, or `null` if the required cookies are missing.
 */
export function parseAuthFromCookieHeader(cookieHeader: string | null): AuthCookies | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((s) => s.trim());
  const get = (name: string): string | null => {
    const prefix = name + "=";
    const part = parts.find((p) => p.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
  };
  const token    = get(COOKIE_TOKEN);
  const userId   = get(COOKIE_USER_ID);
  const userName = get(COOKIE_USER_NAME);
  if (!token || !userId || !userName) return null;
  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) return null;
  return { token, userId: id, userName };
}

/**
 * Returns `true` when a guest session cookie is present in a raw `Cookie` header.
 * Used in server-side loaders for auth-gating routes.
 *
 * @param cookieHeader - The raw `Cookie` header value, or `null`.
 */
export function isGuestFromCookieHeader(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${COOKIE_GUEST}=true`);
}
