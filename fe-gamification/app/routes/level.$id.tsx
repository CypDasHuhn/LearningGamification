import { data, redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/level.$id";
import { fetchLevelData } from "../level/Level.server";
import { Level } from "../level/Level";

/**
 * Server loader for `/level/:id`.
 *
 * Validates the `id` param, fetches question data via {@link fetchLevelData},
 * and extracts the `chapterTitle` and `chapter` search params so they can be
 * forwarded to the {@link Level} component for back-navigation and the header banner.
 *
 * Throws a 404 `data` response when no level is found, and redirects to
 * `/level-selection` when the param is not a valid number.
 */
export async function loader({ params, request }: Route.LoaderArgs) {
  const levelId = Number(params.id);

  if (Number.isNaN(levelId)) {
    throw redirect("/level-selection");
  }

  const levelData = await fetchLevelData(levelId, request.headers.get("Cookie"));

  if (!levelData) {
    throw data("Level nicht gefunden", { status: 404 });
  }

  const url = new URL(request.url);
  const chapterTitle = url.searchParams.get("chapterTitle") ?? "";
  const chapterId = url.searchParams.get("chapter") ?? "";

  return { levelData, chapterTitle, chapterId };
}

/** Route component for `/level/:id` — renders the {@link Level} experience. */
export default function LevelRoute() {
  const { levelData, chapterTitle, chapterId } = useLoaderData<typeof loader>();
  return (
    <Level
      questionSetId={levelData.questionSetId}
      title={levelData.title}
      chapterTitle={chapterTitle}
      chapterId={chapterId}
      questionList={levelData.questions}
    />
  );
}
