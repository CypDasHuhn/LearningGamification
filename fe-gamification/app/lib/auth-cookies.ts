/**
 * Auth-Daten in Cookies speichern und auslesen.
 * Token, userId und userName werden für API-Aufrufe und UI genutzt.
 */

const COOKIE_TOKEN = "auth_token";
const COOKIE_USER_ID = "auth_user_id";
const COOKIE_USER_NAME = "auth_user_name";
const COOKIE_GUEST = "auth_guest";
export interface AuthCookies {
  token: string;
  userId: number;
  userName: string;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  const value = match ? match[1] : null;
  return value ? decodeURIComponent(value) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

/** Auth-Daten in Cookies speichern (nach Login/Registrierung). */
export function setAuthCookies(data: AuthCookies): void {
  setCookie(COOKIE_TOKEN, data.token);
  setCookie(COOKIE_USER_ID, String(data.userId));
  setCookie(COOKIE_USER_NAME, data.userName);
  deleteCookie(COOKIE_GUEST);
}

/** Auth-Daten aus Cookies lesen (im Browser). */
export function getAuthFromCookies(): AuthCookies | null {
  const token = getCookie(COOKIE_TOKEN);
  const userId = getCookie(COOKIE_USER_ID);
  const userName = getCookie(COOKIE_USER_NAME);
  if (!token || !userId || !userName) return null;
  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) return null;
  return { token, userId: id, userName };
}

/** Gast-Session setzen (kein Backend-Login). */
export function setGuestCookies(): void {
  setCookie(COOKIE_GUEST, "true");
  deleteCookie(COOKIE_TOKEN);
  deleteCookie(COOKIE_USER_ID);
  deleteCookie(COOKIE_USER_NAME);
}

/** Prüfen, ob ein Gast eingeloggt ist. */
export function isGuestFromCookies(): boolean {
  return getCookie(COOKIE_GUEST) === "true";
}

/** Ist jemand eingeloggt (User oder Gast)? */
export function isAuthenticated(): boolean {
  return getAuthFromCookies() !== null || isGuestFromCookies();
}

/** Alle Auth-Cookies löschen (Logout). */
export function clearAuthCookies(): void {
  deleteCookie(COOKIE_TOKEN);
  deleteCookie(COOKIE_USER_ID);
  deleteCookie(COOKIE_USER_NAME);
  deleteCookie(COOKIE_GUEST);
}

/** Cookie-String parsen (für Server/Loader, z. B. aus request.headers.get("Cookie")). */
export function parseAuthFromCookieHeader(cookieHeader: string | null): AuthCookies | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((s) => s.trim());
  const get = (name: string) => {
    const prefix = name + "=";
    const part = parts.find((p) => p.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
  };
  const token = get(COOKIE_TOKEN);
  const userId = get(COOKIE_USER_ID);
  const userName = get(COOKIE_USER_NAME);
  if (!token || !userId || !userName) return null;
  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) return null;
  return { token, userId: id, userName };
}

/** Prüfen, ob in einem Cookie-Header eine Gast-Session gesetzt ist. */
export function isGuestFromCookieHeader(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${COOKIE_GUEST}=true`);
}
