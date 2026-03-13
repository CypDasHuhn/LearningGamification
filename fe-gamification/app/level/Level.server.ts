import type { LevelData } from "~/components/types";
import { MOCK_LEVEL_DATA } from "../mock/Mockdata";
import { parseAuthFromCookieHeader } from "~/lib/auth-cookies";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function fetchLevelData(
  levelId: number,
  cookieHeader?: string | null,
): Promise<LevelData | null> {
  const auth = parseAuthFromCookieHeader(cookieHeader ?? null);

  if (auth?.token) {
    try {
      const res = await fetch(`${API_BASE}/question-sets/${levelId}/questions`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const questions = await res.json();
        const mockEntry = MOCK_LEVEL_DATA[levelId];
        return {
          questionSetId: levelId,
          title: mockEntry?.title ?? `Level ${levelId}`,
          questions,
        };
      }
    } catch {
      // server not reachable — fall through to mock
    }
  }

  const mock = MOCK_LEVEL_DATA[levelId];
  return mock ? { questionSetId: mock.questionSetId, title: mock.title, questions: mock.questions } : null;
}
