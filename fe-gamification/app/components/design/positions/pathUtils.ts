import type { Level } from "../../types";

/**
 * A single sampled point along a Bezier path between level nodes.
 * Both coordinates are in map-canvas pixels.
 */
export type PathSample = { x: number; y: number };

/**
 * Builds discrete sample points along the cubic Bezier curves that connect
 * each pair of consecutive levels.
 *
 * The curve for each segment uses the midpoint x-coordinate as both control
 * points, producing a smooth S-curve transition between different y-positions
 * while keeping the movement horizontal at each node.
 *
 * Consecutive duplicate points (within 0.01 px) are filtered out to keep the
 * array compact.
 *
 * @param levels - Ordered array of level/chapter positions.
 * @param samplesPerSegment - Number of sample steps per level-to-level segment.
 *   Higher values produce smoother character movement. Defaults to `150`.
 * @returns Array of path samples ordered from the first level to the last.
 */
export function buildPathSamples(
  levels: Level[],
  samplesPerSegment = 150,
): PathSample[] {
  const allPoints: PathSample[] = [];

  for (let levelIndex = 1; levelIndex < levels.length; levelIndex++) {
    const previousLevel = levels[levelIndex - 1];
    const currentLevel  = levels[levelIndex];
    const controlPointX = (previousLevel.x + currentLevel.x) / 2;

    for (let t = 0; t <= 1; t += 1 / samplesPerSegment) {
      const inversT = 1 - t;
      // Cubic Bezier: P0=(prev.x,prev.y), P1=(mid,prev.y), P2=(mid,cur.y), P3=(cur.x,cur.y)
      // This keeps the path horizontal at each node and produces a smooth S-curve in Y.
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

/**
 * Returns the index of the sample point whose x-coordinate is closest to
 * the given level's x-coordinate.
 *
 * Used to snap the character's starting position to the nearest path point
 * when initialising the map screen.
 *
 * @param samples - Pre-computed path sample array from {@link buildPathSamples}.
 * @param level - Target level whose x-position is used as the search key.
 * @returns Index into `samples` of the closest match, or `0` if the array is empty.
 */
export function findClosestSampleIndex(
  samples: PathSample[],
  level: Level,
): number {
  let closestIndex    = 0;
  let closestDistance = Infinity;

  for (let index = 0; index < samples.length; index++) {
    const distance = Math.abs(samples[index].x - level.x);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex    = index;
    }
  }

  return closestIndex;
}

/**
 * Generates an SVG `d` attribute string connecting all levels with cubic
 * Bezier curves, matching the control-point strategy used by
 * {@link buildPathSamples}.
 *
 * @param levels - Ordered array of level/chapter positions.
 * @returns SVG path data string ready for use in a `<path d="…">` element,
 *   or `""` when `levels` is empty.
 */
export function buildSvgPathD(levels: Level[]): string {
  if (levels.length === 0) return "";

  let pathData = `M ${levels[0].x} ${levels[0].y}`;

  for (let index = 1; index < levels.length; index++) {
    const previousLevel = levels[index - 1];
    const currentLevel  = levels[index];
    const controlPointX = (previousLevel.x + currentLevel.x) / 2;
    pathData += ` C ${controlPointX},${previousLevel.y} ${controlPointX},${currentLevel.y} ${currentLevel.x},${currentLevel.y}`;
  }

  return pathData;
}

/**
 * Returns the element from `items` whose `.x` property is closest to `targetX`.
 *
 * Replaces inline `Array.reduce` patterns scattered across the map screens.
 * Falls back to `items[0]` when the array contains only one element.
 *
 * @param items - Non-empty array of objects with an `x` coordinate.
 * @param targetX - The x-coordinate to search for.
 * @returns The item with the smallest `|item.x - targetX|`.
 *
 * @example
 * const nearest = findNearestByX(levels, characterPosition.x);
 */
export function findNearestByX<T extends { x: number }>(
  items: T[],
  targetX: number,
): T {
  return items.reduce((nearest, item) =>
    Math.abs(item.x - targetX) < Math.abs(nearest.x - targetX) ? item : nearest,
  );
}
