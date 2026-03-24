import { getAuthFromCookies } from "./auth-cookies";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/** HTTP methods supported by the API client. */
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Options for {@link apiRequest}. */
export interface ApiRequestOptions {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, the `Authorization` header is omitted even if a token is present in cookies. */
  skipAuth?: boolean;
}

/**
 * Generic API client that auto-injects the Bearer token from cookies.
 *
 * - Relative `endpoint` values are prefixed with `VITE_API_URL` (defaults to `http://localhost:8080`).
 * - Absolute URLs (starting with `http`) are used as-is.
 * - JSON responses are parsed; non-JSON responses are returned as a raw string
 *   cast to `T` — callers expecting non-string T for non-JSON endpoints must handle this.
 *
 * @param endpoint - API path (e.g. `/auth/login`) or full URL.
 * @param options - Optional method, body, extra headers, and auth skip flag.
 * @returns Resolved response typed as `T`.
 * @throws {Error} When the HTTP response status is not OK; message is extracted
 *   from the response body's `.message`, `.error`, or raw text field.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
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
      // message stays as raw text
    }
    throw new Error(message || `API error: ${res.status}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  // Non-JSON response: returned as a raw string cast to T.
  // Callers that expect a non-string T for a non-JSON endpoint must handle this.
  return res.text() as unknown as Promise<T>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Builds a URL query string from a key/value map, omitting undefined values.
 *
 * @param params - Key/value pairs; entries with `undefined` value are skipped.
 * @returns A query string like `"?limit=10"`, or `""` when all values are undefined.
 */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] != null,
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

/** Request body for login and registration. */
export interface AuthRequestBody {
  userName: string;
  password: string;
}

/** Response body returned by login and registration endpoints. */
export interface AuthResponseBody {
  token: string;
  userId: number;
  userName: string;
}

/**
 * Registers a new user account.
 *
 * @param userName - Desired username.
 * @param password - Plain-text password (HTTPS assumed at the transport layer).
 * @returns Auth data including the session token.
 * @remarks Caller is responsible for persisting the token via {@link setAuthCookies}.
 */
export async function register(
  userName: string,
  password: string,
): Promise<AuthResponseBody> {
  return apiRequest<AuthResponseBody>("/auth/register", {
    method: "POST",
    body: { userName, password } as AuthRequestBody,
    skipAuth: true,
  });
}

/**
 * Authenticates an existing user.
 *
 * @param userName - Account username.
 * @param password - Plain-text password.
 * @returns Auth data including the session token.
 * @remarks Caller is responsible for persisting the token via {@link setAuthCookies}.
 */
export async function login(
  userName: string,
  password: string,
): Promise<AuthResponseBody> {
  return apiRequest<AuthResponseBody>("/auth/login", {
    method: "POST",
    body: { userName, password } as AuthRequestBody,
    skipAuth: true,
  });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

/** A single row in the leaderboard, as returned by `GET /leaderboard`. */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  points: number;
  completedQuestions: number;
  lastCompletedAt: number;
  /** True when this entry belongs to the currently authenticated user. */
  currentUser: boolean;
}

/**
 * Fetches the global leaderboard.
 *
 * @param limit - Maximum number of entries to return (omit for server default).
 * @returns Ranked list of users sorted by points descending.
 */
export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  return apiRequest<LeaderboardEntry[]>(`/leaderboard${buildQuery({ limit })}`);
}

// ─── Themes (chapters) ────────────────────────────────────────────────────────

/** A theme (chapter) as returned by `GET /themes`. */
export interface ThemeResponse {
  themeId: number;
  name: string;
  description: string | null;
  questionCount: number;
}

/** A question set (level) belonging to a theme, as returned by `GET /themes/{id}/question-sets`. */
export interface ThemeQuestionSetResponse {
  questionSetId: number;
  title: string;
  teamId: number;
  questionCount: number;
}

/**
 * Fetches all available themes (chapters).
 *
 * @returns Array of themes ordered by the server.
 */
export async function getThemes(): Promise<ThemeResponse[]> {
  return apiRequest<ThemeResponse[]>("/themes");
}

/**
 * Fetches the question sets (levels) belonging to a specific theme.
 *
 * @param themeId - ID of the parent theme.
 * @returns Ordered list of question sets for that theme.
 */
export async function getThemeQuestionSets(
  themeId: number,
): Promise<ThemeQuestionSetResponse[]> {
  return apiRequest<ThemeQuestionSetResponse[]>(`/themes/${themeId}/question-sets`);
}

// ─── Question sets ────────────────────────────────────────────────────────────

/** Summary of a question as returned by `GET /question-sets/{id}/questions`. */
export interface QuestionSummaryResponse {
  questionId: number;
  questionType: string;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  allowsMultiple: boolean;
  completed: boolean;
}

/**
 * Fetches question summaries for a question set.
 *
 * @param questionSetId - ID of the question set (level).
 * @returns List of question summaries without full answer data.
 */
export async function getQuestionSetQuestions(
  questionSetId: number,
): Promise<QuestionSummaryResponse[]> {
  return apiRequest<QuestionSummaryResponse[]>(`/question-sets/${questionSetId}/questions`);
}

// ─── Questions ────────────────────────────────────────────────────────────────

/** A multiple-choice answer option as returned by the questions endpoints. */
export interface McAnswerResponse {
  answerId: number;
  optionText: string;
  optionOrder: number;
}

/** A single gap option within a gap-fill field. */
export interface GapOptionResponse {
  gapOptionId: number;
  optionText: string;
  optionOrder: number;
}

/** A single gap (blank) within a gap-fill question, including its answer options. */
export interface GapFieldResponse {
  gapId: number;
  gapIndex: number;
  options: GapOptionResponse[];
}

/** Full question data including answer options, as returned by `GET /questions`. */
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

/**
 * Fetches full questions, optionally filtered by question set.
 *
 * @param questionSetId - When provided, returns only questions belonging to this set.
 * @returns Array of full question objects with answer options included.
 */
export async function getQuestions(questionSetId?: number): Promise<QuestionResponse[]> {
  return apiRequest<QuestionResponse[]>(`/questions${buildQuery({ questionSetId })}`);
}

/** Answer options for a single question, as returned by `GET /questions/{id}/answers`. */
export interface QuestionAnswersResponse {
  questionId: number;
  questionType: string;
  allowsMultiple: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
}

/**
 * Fetches the answer options for a single question.
 *
 * @param questionId - ID of the question.
 * @returns Answer options split by question type.
 */
export async function getQuestionAnswers(
  questionId: number,
): Promise<QuestionAnswersResponse> {
  return apiRequest<QuestionAnswersResponse>(`/questions/${questionId}/answers`);
}

/** Request body for submitting a question answer. */
export interface SubmitAnswerRequest {
  selectedAnswerIds?: number[];
  gapAnswers?: { gapId: number; selectedOptionId: number }[];
}

/** Result of submitting an answer, as returned by `POST /questions/{id}/submit`. */
export interface SubmitAnswerResponse {
  questionId: number;
  questionType: string;
  isCorrect: boolean;
  awardedPoints: number;
  completed: boolean;
}

/**
 * Submits the user's answer for a question.
 *
 * @param questionId - ID of the question being answered.
 * @param body - Selected answer IDs or gap answer mappings.
 * @returns Correctness result and awarded points.
 */
export async function submitQuestionAnswer(
  questionId: number,
  body: SubmitAnswerRequest,
): Promise<SubmitAnswerResponse> {
  return apiRequest<SubmitAnswerResponse>(`/questions/${questionId}/submit`, {
    method: "POST",
    body,
  });
}
