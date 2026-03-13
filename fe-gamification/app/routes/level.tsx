import { data, redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/level";
import { fetchLevelData } from "../level/Level.server";
import { Level } from "../level/Level";

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

  return { levelData, chapterTitle };
}

export default function LevelRoute() {
  const { levelData, chapterTitle } = useLoaderData<typeof loader>();
  return (
    <Level
      questionSetId={levelData.questionSetId}
      title={levelData.title}
      chapterTitle={chapterTitle}
      questionList={levelData.questions}
    />
  );
}
