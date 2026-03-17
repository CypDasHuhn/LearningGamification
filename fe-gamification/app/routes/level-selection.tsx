import {
  fetchLevels,
  questionSetsToLevels,
} from "~/level-selection/level-selection.server";
import { apiGetServer } from "~/lib/api-server";
import { LevelSelection } from "../level-selection/level-selection";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/level-selection";
import type { ThemeQuestionSetResponse } from "~/lib/api";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const themeId = url.searchParams.get("chapter");
  const cookieHeader = request.headers.get("Cookie");

  if (themeId) {
    const id = parseInt(themeId, 10);
    if (!Number.isNaN(id)) {
      const sets = await apiGetServer<ThemeQuestionSetResponse[]>(
        cookieHeader,
        `/themes/${id}/question-sets`,
      );
      if (sets && sets.length > 0) {
        return { levels: questionSetsToLevels(sets) };
      }
    }
  }

  const levels = await fetchLevels();
  return { levels };
}

export default function LevelSelectionRoute() {
  const { levels } = useLoaderData<typeof loader>();
  return <LevelSelection levels={levels} />;
}
