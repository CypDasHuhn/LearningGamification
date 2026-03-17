import type { Level } from "~/components/types";
import { MOCK_LEVELS } from "../mock/Mockdata";
import type { ThemeQuestionSetResponse } from "~/lib/api";

/** Positionen für Level-Nodes auf der Karte (wie MOCK_LEVELS). */
function levelPositions(n: number): { x: number; y: number }[] {
  if (n <= 0) return [];
  const xStart = 125;
  const xEnd = 1605;
  const yBase = [295, 215, 280, 200, 268, 208, 275, 210];
  return Array.from({ length: n }, (_, i) => ({
    x: n === 1 ? xStart : Math.round(xStart + (i / (n - 1)) * (xEnd - xStart)),
    y: yBase[i % yBase.length] ?? 215,
  }));
}

export function questionSetsToLevels(
  sets: ThemeQuestionSetResponse[],
): Level[] {
  if (sets.length === 0) return [];
  const positions = levelPositions(sets.length);
  return sets.map((s, i) => ({
    id: s.questionSetId,
    title: s.title,
    x: positions[i].x,
    y: positions[i].y,
    stars: i === 0 ? 0 : -1,
  }));
}

export async function fetchLevels(): Promise<Level[]> {
  return MOCK_LEVELS;
}
