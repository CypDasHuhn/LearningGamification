import { fetchLevels } from "~/level-selection/level-selection.server";
import { LevelSelection } from "../level-selection/level-selection";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/level-selection";

export async function loader({}: Route.LoaderArgs) {
  const levels = await fetchLevels();
  return { levels };
}

export default function LevelSelectionRoute() {
  const { levels } = useLoaderData<typeof loader>();
  return <LevelSelection levels={levels} />;
}
