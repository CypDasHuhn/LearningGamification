import { data, redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/level";
import { fetchLevelData } from "../level/Level.server";
import { Level } from "../level/Level";

export async function loader({ params }: Route.LoaderArgs) {
  const levelId = Number(params.id);

  if (Number.isNaN(levelId)) {
    throw redirect("/level-selection");
  }

  const levelData = await fetchLevelData(levelId);

  if (!levelData) {
    throw data("Level nicht gefunden", { status: 404 });
  }

  return { levelData };
}

export default function LevelRoute() {
  const { levelData } = useLoaderData<typeof loader>();
  return <Level levelData={levelData} />;
}
