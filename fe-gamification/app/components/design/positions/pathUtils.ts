import type { Level } from "../../types";

export type PathSample = { x: number; y: number };

export function buildPathSamples(
  levels: Level[],
  samplesPerSegment = 150,
): PathSample[] {
  const allPoints: PathSample[] = [];

  for (let levelIndex = 1; levelIndex < levels.length; levelIndex++) {
    const previousLevel = levels[levelIndex - 1];
    const currentLevel = levels[levelIndex];
    const controlPointX = (previousLevel.x + currentLevel.x) / 2;

    for (let t = 0; t <= 1; t += 1 / samplesPerSegment) {
      const inversT = 1 - t;
      const x =
        inversT * inversT * inversT * previousLevel.x +
        3 * inversT * inversT * t * controlPointX +
        3 * inversT * t * t * controlPointX +
        t * t * t * currentLevel.x;
      const y =
        inversT * inversT * inversT * previousLevel.y +
        3 * inversT * inversT * t * previousLevel.y +
        3 * inversT * t * t * currentLevel.y +
        t * t * t * currentLevel.y;
      allPoints.push({ x, y });
    }
  }

  return allPoints.filter(
    (point, index) =>
      index === 0 ||
      Math.abs(point.x - allPoints[index - 1].x) > 0.01 ||
      Math.abs(point.y - allPoints[index - 1].y) > 0.01,
  );
}

export function findClosestSampleIndex(
  samples: PathSample[],
  level: Level,
): number {
  let closestIndex = 0;
  let closestDistance = Infinity;

  for (let index = 0; index < samples.length; index++) {
    const distance = Math.abs(samples[index].x - level.x);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

export function buildSvgPathD(levels: Level[]): string {
  if (levels.length === 0) return "";

  let pathData = `M ${levels[0].x} ${levels[0].y}`;

  for (let index = 1; index < levels.length; index++) {
    const previousLevel = levels[index - 1];
    const currentLevel = levels[index];
    const controlPointX = (previousLevel.x + currentLevel.x) / 2;
    pathData += ` C ${controlPointX},${previousLevel.y} ${controlPointX},${currentLevel.y} ${currentLevel.x},${currentLevel.y}`;
  }

  return pathData;
}
