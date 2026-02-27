/**
 * Generischer API-Helfer für Backend-Aufrufe.
 * Basis-URL und Auth-Header (Token aus Cookies) werden zentral gesetzt.
 */

import { getAuthFromCookies } from "./auth-cookies";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Wenn true, wird kein Authorization-Header aus Cookies gesetzt. */
  skipAuth?: boolean;
}

/**
 * Führt einen API-Request aus.
 * Setzt automatisch Content-Type: application/json und bei Bedarf Authorization: Bearer <token>.
 */
export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  if (!skipAuth) {
    const auth = getAuthFromCookies();
    if (auth?.token) {
      reqHeaders["Authorization"] = `Bearer ${auth.token}`;
    }
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? text;
    } catch {
      // message bleibt text
    }
    throw new Error(message || `API Fehler: ${res.status}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
}

// --- Auth-Endpoints ---

export interface AuthRequestBody {
  userName: string;
  password: string;
}

export interface AuthResponseBody {
  token: string;
  userId: number;
  userName: string;
}

/** Registrierung: POST /auth/register */
export async function register(userName: string, password: string): Promise<AuthResponseBody> {
  return apiRequest<AuthResponseBody>("/auth/register", {
    method: "POST",
    body: { userName, password } as AuthRequestBody,
    skipAuth: true,
  });
}

/** Login: POST /auth/login */
export async function login(userName: string, password: string): Promise<AuthResponseBody> {
  return apiRequest<AuthResponseBody>("/auth/login", {
    method: "POST",
    body: { userName, password } as AuthRequestBody,
    skipAuth: true,
  });
}
