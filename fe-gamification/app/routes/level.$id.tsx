import { useNavigate } from "react-router";
import type { Route } from "./+types/level.$id";

import { LEVEL_QUESTIONS } from "../components/level/QuestionData";
import { MultipleChoiceQuestion } from "../components/level/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "../components/level/TrueFalseQuestion";
import { GapFillQuestion } from "../components/level/GapQuestion";

export function loader({ params }: Route.LoaderArgs) {
  const levelId = Number(params.id);
  const question = LEVEL_QUESTIONS[levelId];

  if (!question) {
    throw new Response("Level nicht gefunden", { status: 404 });
  }

  return { levelId, question };
}

export default function LevelRoute({ loaderData }: Route.ComponentProps) {
  const { levelId, question } = loaderData;
  const navigate = useNavigate();

  function handleAnswer(isCorrect: boolean) {
    console.log(`Level ${levelId} answered — correct: ${isCorrect}`);
  }

  function handleLeave() {
    navigate("/level-selection");
  }

  const sharedProps = {
    levelNum: levelId,
    questionNum: 1,
    totalQuestions: 5,
    onAnswer: handleAnswer,
    onLeave: handleLeave,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #bae6fd, #bbf7d0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {question.type === "multiple-choice" && (
          <MultipleChoiceQuestion {...sharedProps} data={question.data} />
        )}
        {question.type === "true-false" && (
          <TrueFalseQuestion {...sharedProps} data={question.data} />
        )}
        {question.type === "gap-fill" && (
          <GapFillQuestion {...sharedProps} data={question.data} />
        )}
      </div>
    </div>
  );
}
