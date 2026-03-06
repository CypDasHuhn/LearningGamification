import type {
  AuthRequest,
  AuthResponse,
  UserResponse,
  ThemeResponse,
  ThemeQuestionSetResponse,
  QuestionSummaryResponse,
  QuestionResponse,
  QuestionAnswersResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  LeaderboardEntryResponse,
  ErrorResponse,
} from "~/components/types";

const BASE_URL = "http://localhost:8080";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public body: ErrorResponse,
  ) {
    super(body.message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err: ErrorResponse = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const auth = {
  register(data: AuthRequest): Promise<AuthResponse> {
    return request("POST", "/auth/register", data);
  },
  login(data: AuthRequest): Promise<AuthResponse> {
    return request("POST", "/auth/login", data);
  },
  me(): Promise<UserResponse> {
    return request("GET", "/auth/me");
  },
};

export const themes = {
  list(): Promise<ThemeResponse[]> {
    return request("GET", "/themes");
  },
  questionSets(themeId: number): Promise<ThemeQuestionSetResponse[]> {
    return request("GET", `/themes/${themeId}/question-sets`);
  },
};

export const questionSets = {
  questions(questionSetId: number): Promise<QuestionSummaryResponse[]> {
    return request("GET", `/question-sets/${questionSetId}/questions`);
  },
};

export const questions = {
  list(questionSetId?: number): Promise<QuestionResponse[]> {
    const query =
      questionSetId !== undefined ? `?questionSetId=${questionSetId}` : "";
    return request("GET", `/questions${query}`);
  },
  answers(questionId: number): Promise<QuestionAnswersResponse> {
    return request("GET", `/questions/${questionId}/answers`);
  },
  submit(
    questionId: number,
    body: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    return request("POST", `/questions/${questionId}/answer`, body);
  },
};

export const leaderboard = {
  list(limit?: number): Promise<LeaderboardEntryResponse[]> {
    const query = limit !== undefined ? `?limit=${limit}` : "";
    return request("GET", `/leaderboard${query}`);
  },
};

export async function loginAndStore(data: AuthRequest): Promise<AuthResponse> {
  const res = await auth.login(data);
  setAuthToken(res.token);
  return res;
}

export async function registerAndStore(
  data: AuthRequest,
): Promise<AuthResponse> {
  const res = await auth.register(data);
  setAuthToken(res.token);
  return res;
}

export { ApiError };
