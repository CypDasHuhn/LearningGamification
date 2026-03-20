export type AuthCookiePayload = {
  token: string;
  userId: number;
  userName: string;
};

const COOKIE_TOKEN = "auth_token";
const COOKIE_USER_ID = "auth_user_id";
const COOKIE_USER_NAME = "auth_user_name";
const COOKIE_GUEST = "auth_guest";
const COOKIE_MAX_AGE_DAYS = 7;

function buildSetCookie(name: string, value: string): string {
  const maxAgeSeconds = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  return `${name}=${encodeURIComponent(value)}; path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function buildDeleteCookie(name: string): string {
  return `${name}=; path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Kapselt Server-seitiges Setzen von Auth-Cookies für Redirects.
 * Liefert ein Headers-Objekt, das man direkt in react-router Redirect werfen kann.
 */
export function setCookieFunction({
  token,
  userId,
  userName,
}: AuthCookiePayload): Headers {
  const headers = new Headers();
  headers.append("Set-Cookie", buildSetCookie(COOKIE_TOKEN, token));
  headers.append("Set-Cookie", buildSetCookie(COOKIE_USER_ID, String(userId)));
  headers.append("Set-Cookie", buildSetCookie(COOKIE_USER_NAME, userName));
  headers.append("Set-Cookie", buildDeleteCookie(COOKIE_GUEST));
  return headers;
}

