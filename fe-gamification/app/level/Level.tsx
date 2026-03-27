import { useState } from "react";
import { Link } from "react-router";
import { IngameHeader } from "~/components/ingame-header";
import { submitQuestionAnswer } from "~/lib/api";

import type { QuestionResponse } from "~/components/types";
import { MultipleChoiceQuestion } from "~/components/level/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "~/components/level/TrueFalseQuestion";
import { GapFillQuestion } from "~/components/level/GapQuestion";
import type { CodeToken, GapAnswer } from "~/components/level/GapQuestion";

/** Props for {@link Level}. */
type LevelProps = {
  questionSetId: number;
  title: string;
  chapterTitle: string;
  chapterId?: string;
  questionList: QuestionResponse[];
};

/** Discriminated-union state machine for the level flow. */
type LevelPhase =
  | { phase: "question"; currentIndex: number; correctCount: number }
  | { phase: "result"; correctCount: number; total: number };


function ResultScreen({
  title,
  correctCount,
  total,
  chapterId,
}: {
  title: string;
  correctCount: number;
  total: number;
  chapterId?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: "40px 24px",
        background: "#1e293b",
        border: "4px solid #334155",
        boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
        color: "#f8fafc",
        fontFamily: "'Press Start 2P', monospace",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 10, color: "#94a3b8" }}>LEVEL ABGESCHLOSSEN</p>
      <h2 style={{ fontSize: 14, margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 2 }}>
        {correctCount} / {total} RICHTIG
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          to={chapterId ? `/level-selection?chapter=${chapterId}` : "/level-selection"}
          style={{
            padding: "10px 18px",
            background: "#0f172a",
            border: "3px solid #334155",
            color: "#94a3b8",
            fontSize: 8,
            textDecoration: "none",
            boxShadow: "3px 3px 0 rgba(0,0,0,0.5)",
          }}
        >
          ← ZURÜCK
        </Link>
        <Link
          to={chapterId ? `/level-selection?chapter=${chapterId}` : "/level-selection"}
          style={{
            padding: "10px 18px",
            background: "#166534",
            border: "3px solid #15803d",
            color: "#bbf7d0",
            fontSize: 8,
            textDecoration: "none",
            boxShadow: "3px 3px 0 rgba(0,0,0,0.5)",
          }}
        >
          NÄCHSTES LEVEL →
        </Link>
      </div>
    </div>
  );
}

function resolveTrueFalseAnswerId(
  question: QuestionResponse,
  selectedIsTrue: boolean,
): number | null {
  const sorted = [...question.mcAnswers].sort((a, b) => a.optionOrder - b.optionOrder);
  const normalize = (value: string) => value.trim().toLowerCase();

  const trueCandidate = sorted.find((answer) => {
    const text = normalize(answer.optionText);
    return text === "true" || text === "wahr";
  });
  const falseCandidate = sorted.find((answer) => {
    const text = normalize(answer.optionText);
    return text === "false" || text === "falsch";
  });

  const fallbackTrue = sorted[0];
  const fallbackFalse = sorted.find((answer) => answer.answerId !== fallbackTrue?.answerId);

  const selectedAnswer = selectedIsTrue
    ? (trueCandidate ?? fallbackTrue)
    : (falseCandidate ?? fallbackFalse);

  return selectedAnswer?.answerId ?? null;
}

/**
 * Full level experience: cycles through all questions then shows a result screen.
 *
 * @param questionSetId - The numeric level/question-set ID shown in the header.
 * @param title - Fallback title when `chapterTitle` is empty.
 * @param chapterTitle - Chapter name displayed in the ingame header banner.
 * @param chapterId - Used to build back/next links to the correct chapter's level-selection.
 * @param questionList - Ordered questions fetched by the server loader.
 */
export function Level({ questionSetId, title, chapterTitle, chapterId = "", questionList }: LevelProps) {
  const total = questionList.length;

  const [state, setState] = useState<LevelPhase>({
    phase: "question",
    currentIndex: 0,
    correctCount: 0,
  });

  function advance(isCorrect: boolean) {
    if (state.phase !== "question") return;
    const newCorrectCount = state.correctCount + (isCorrect ? 1 : 0);
    const nextIndex = state.currentIndex + 1;
    setTimeout(() => {
      if (nextIndex >= total) {
        setState({ phase: "result", correctCount: newCorrectCount, total });
      } else {
        setState({
          phase: "question",
          currentIndex: nextIndex,
          correctCount: newCorrectCount,
        });
      }
    }, 1200);
  }

  function renderQuestion(q: QuestionResponse) {
    const shared = {
      levelNum: questionSetId,
      questionNum: state.phase === "question" ? state.currentIndex + 1 : 1,
      totalQuestions: total,
      onAnswer: (isCorrect: boolean) => advance(isCorrect),
    };

    switch (q.questionType) {
      case "MC": {
        const sorted = [...q.mcAnswers].sort(
          (a, b) => a.optionOrder - b.optionOrder,
        );
        return (
          <MultipleChoiceQuestion
            key={q.questionId}
            {...shared}
            data={{
              question: q.startText ?? "",
              options: sorted.map((a) => a.optionText),
              allowsMultiple: q.allowsMultiple,
              correctIndices: [],
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!",
            }}
            onSubmit={async (selectedIndices) => {
              const selectedAnswerIds = selectedIndices
                .map((index) => sorted[index]?.answerId)
                .filter((answerId): answerId is number => typeof answerId === "number");
              const result = await submitQuestionAnswer(q.questionId, {
                selectedAnswerIds,
              });
              return result.isCorrect;
            }}
          />
        );
      }

      case "TF": {
        return (
          <TrueFalseQuestion
            key={q.questionId}
            {...shared}
            data={{
              statement: q.startText ?? "",
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!",
            }}
            onSubmit={async (selectedIsTrue) => {
              const selectedAnswerId = resolveTrueFalseAnswerId(q, selectedIsTrue);
              if (selectedAnswerId === null) {
                throw new Error("Die Wahr/Falsch-Antworten sind nicht korrekt konfiguriert.");
              }
              const result = await submitQuestionAnswer(q.questionId, {
                selectedAnswerIds: [selectedAnswerId],
              });
              return result.isCorrect;
            }}
          />
        );
      }

      case "GAP": {
        const sortedGaps = [...q.gapFields].sort(
          (a, b) => a.gapIndex - b.gapIndex,
        );
        const codeLines: CodeToken[][] = sortedGaps.map((gf) => [
          { type: "gap", gapId: gf.gapId },
        ]);
        const gaps: GapAnswer[] = sortedGaps.map((gf) => {
          const opts = [...gf.options].sort(
            (a, b) => a.optionOrder - b.optionOrder,
          );
          return {
            gapId: gf.gapId,
            options: opts.map((o) => o.optionText),
          };
        });
        return (
          <GapFillQuestion
            key={q.questionId}
            {...shared}
            data={{
              instruction: q.startText ?? "",
              codeLines,
              gaps,
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!",
            }}
            onSubmit={async (gapSelections) => {
              const gapAnswers = sortedGaps.map((gapField) => {
                const sortedOptions = [...gapField.options].sort(
                  (a, b) => a.optionOrder - b.optionOrder,
                );
                const selectedIndex = gapSelections[gapField.gapId];
                const selectedOption = sortedOptions[selectedIndex];
                if (!selectedOption) {
                  throw new Error("Bitte alle Lücken auswählen.");
                }
                return {
                  gapId: gapField.gapId,
                  selectedOptionId: selectedOption.gapOptionId,
                };
              });

              const result = await submitQuestionAnswer(q.questionId, {
                gapAnswers,
              });
              return result.isCorrect;
            }}
          />
        );
      }

      default: {
        // Exhaustiveness guard — TypeScript will error here if a new
        // QuestionType variant is added without a matching case above.
        const _exhaustive: never = q.questionType;
        console.warn("Unbekannter questionType:", _exhaustive);
        return null;
      }
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #bae6fd, #bbf7d0)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <IngameHeader
        siteName={chapterTitle ? `${chapterTitle} - Level ${questionSetId}` : title}
        backTo={chapterId ? `/level-selection?chapter=${chapterId}` : "/level-selection"}
        backLabel="LEVEL AUSWAHL"
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {state.phase === "question" ? (
          renderQuestion(questionList[state.currentIndex])
        ) : (
          <ResultScreen
            title={title}
            correctCount={state.correctCount}
            total={state.total}
            chapterId={chapterId}
          />
        )}
      </div>
      </div>
    </main>
  );
}
