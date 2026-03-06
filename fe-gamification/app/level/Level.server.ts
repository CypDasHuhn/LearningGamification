import type { LevelData } from "~/components/types";
import { MOCK_LEVEL_DATA } from "../mock/Mockdata";

export async function fetchLevelData(
  levelId: number,
): Promise<LevelData | null> {
  // TODO: Replace with real API call when the backend is ready:
  // const res = await fetch(`/api/levels/${levelId}`);
  // if (res.status === 404) return null;
  // if (!res.ok) throw new Error("Failed to fetch level data");
  // return res.json();

  return MOCK_LEVEL_DATA[levelId] ?? null;
}
