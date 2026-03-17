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

// --- Leaderboard ---

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  points: number;
  completedQuestions: number;
  lastCompletedAt: number;
  currentUser: boolean;
}

/** Leaderboard abrufen: GET /leaderboard?limit=... */
export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const query = limit != null ? `?limit=${limit}` : "";
  return apiRequest<LeaderboardEntry[]>(`/leaderboard${query}`);
}

// --- Themes (Kapitel) ---

export interface ThemeResponse {
  themeId: number;
  name: string;
  description: string | null;
  questionCount: number;
}

export interface ThemeQuestionSetResponse {
  questionSetId: number;
  title: string;
  teamId: number;
  questionCount: number;
}

/** Alle Themen/Kapitel: GET /themes */
export async function getThemes(): Promise<ThemeResponse[]> {
  return apiRequest<ThemeResponse[]>("/themes");
}

/** Question-Sets (Levels) eines Themas: GET /themes/{themeId}/question-sets */
export async function getThemeQuestionSets(
  themeId: number
): Promise<ThemeQuestionSetResponse[]> {
  return apiRequest<ThemeQuestionSetResponse[]>(
    `/themes/${themeId}/question-sets`
  );
}

// --- Question Sets ---

/** Frage-Zusammenfassungen eines Sets: GET /question-sets/{questionSetId}/questions */
export interface QuestionSummaryResponse {
  questionId: number;
  questionType: string;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  allowsMultiple: boolean;
  completed: boolean;
}

export async function getQuestionSetQuestions(
  questionSetId: number
): Promise<QuestionSummaryResponse[]> {
  return apiRequest<QuestionSummaryResponse[]>(
    `/question-sets/${questionSetId}/questions`
  );
}

// --- Questions ---

export interface McAnswerResponse {
  answerId: number;
  optionText: string;
  optionOrder: number;
}

export interface GapOptionResponse {
  gapOptionId: number;
  optionText: string;
  optionOrder: number;
}

export interface GapFieldResponse {
  gapId: number;
  gapIndex: number;
  options: GapOptionResponse[];
}

export interface QuestionResponse {
  questionId: number;
  questionSetId: number;
  questionType: string;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  allowsMultiple: boolean;
  completed: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
}

/** Alle Fragen (optional gefiltert nach questionSetId): GET /questions?questionSetId=... */
export async function getQuestions(questionSetId?: number): Promise<QuestionResponse[]> {
  const query =
    questionSetId != null ? `?questionSetId=${questionSetId}` : "";
  return apiRequest<QuestionResponse[]>(`/questions${query}`);
}

export interface QuestionAnswersResponse {
  questionId: number;
  questionType: string;
  allowsMultiple: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
}

/** Antwortoptionen einer Frage: GET /questions/{questionId}/answers */
export async function getQuestionAnswers(
  questionId: number
): Promise<QuestionAnswersResponse> {
  return apiRequest<QuestionAnswersResponse>(
    `/questions/${questionId}/answers`
  );
}

export interface SubmitAnswerRequest {
  selectedAnswerIds?: number[];
  gapAnswers?: { gapId: number; selectedOptionId: number }[];
}

export interface SubmitAnswerResponse {
  questionId: number;
  questionType: string;
  isCorrect: boolean;
  awardedPoints: number;
  completed: boolean;
}

/** Antwort abgeben: POST /questions/{questionId}/submit */
export async function submitQuestionAnswer(
  questionId: number,
  body: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  return apiRequest<SubmitAnswerResponse>(
    `/questions/${questionId}/submit`,
    { method: "POST", body }
  );
}
