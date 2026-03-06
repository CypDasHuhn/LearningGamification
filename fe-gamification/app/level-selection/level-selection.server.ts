import type { Level } from "~/components/types";
import { MOCK_LEVELS } from "../mock/Mockdata";

export async function fetchLevels(): Promise<Level[]> {
  // TODO: Replace with real API call when the backend is ready:
  // const res = await fetch("/api/levels");
  // if (!res.ok) throw new Error("Failed to fetch levels");
  // return res.json();

  return MOCK_LEVELS;
}
