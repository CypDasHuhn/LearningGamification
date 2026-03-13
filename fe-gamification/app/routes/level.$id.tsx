import type { Route } from "./+types/level.$id";

import { MOCK_LEVEL_DATA } from "../mock/Mockdata";
import { Level } from "../level/Level";

export function loader({ params }: Route.LoaderArgs) {
  const levelId = Number(params.id);
  const levelData = MOCK_LEVEL_DATA[levelId];

  if (!levelData) {
    throw new Response("Level nicht gefunden", { status: 404 });
  }

  return levelData;
}

export default function LevelRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Level
      questionSetId={loaderData.questionSetId}
      title={loaderData.title}
      questionList={loaderData.questions}
      chapterTitle={loaderData.title}
    />
  );
}
