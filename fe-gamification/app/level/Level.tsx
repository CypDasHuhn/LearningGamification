import { useState } from "react";
import { Link } from "react-router";

import type { QuestionResponse } from "~/components/types";
import { MultipleChoiceQuestion } from "~/components/level/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "~/components/level/TrueFalseQuestion";
import { GapFillQuestion } from "~/components/level/GapQuestion";
import type { CodeToken, GapAnswer } from "~/components/level/GapQuestion";

type LevelProps = {
  questionSetId: number;
  title: string;
  questionList: QuestionResponse[];
};

type LevelPhase =
  | { phase: "question"; currentIndex: number; correctCount: number }
  | { phase: "result"; correctCount: number; total: number };

function computeStars(correctCount: number, total: number): number {
  const ratio = correctCount / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio > 0) return 1;
  return 0;
}

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          style={{
            fontSize: 28,
            filter: stars >= n ? "none" : "grayscale(1) opacity(0.3)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ResultScreen({
  title,
  correctCount,
  total,
}: {
  title: string;
  correctCount: number;
  total: number;
}) {
  const stars = computeStars(correctCount, total);
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
      <StarDisplay stars={stars} />
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
          to="/level-selection"
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
          to="/level-selection"
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

export function Level({ questionSetId, title, questionList }: LevelProps) {
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

  function handleLeave() {
    window.history.back();
  }

  function renderQuestion(q: QuestionResponse) {
    const shared = {
      levelNum: questionSetId,
      questionNum: state.phase === "question" ? state.currentIndex + 1 : 1,
      totalQuestions: total,
      onAnswer: (isCorrect: boolean) => advance(isCorrect),
      onLeave: handleLeave,
    };

    switch (q.questionType) {
      case "MC": {
        const sorted = [...q.mcAnswers].sort(
          (a, b) => a.optionOrder - b.optionOrder,
        );
        return (
          <MultipleChoiceQuestion
            {...shared}
            data={{
              question: q.startText ?? "",
              options: sorted.map((a) => a.optionText),
              correctIndices: [],
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!",
            }}
          />
        );
      }

      case "TF": {
        return (
          <TrueFalseQuestion
            {...shared}
            data={{
              statement: q.startText ?? "",
              correctAnswer: true,
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!",
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
            correctIndex: 0,
          };
        });
        return (
          <GapFillQuestion
            {...shared}
            data={{
              instruction: q.startText ?? "",
              codeLines,
              gaps,
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!",
            }}
          />
        );
      }
    }
  }

  return (
    <main
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
        {state.phase === "question" ? (
          renderQuestion(questionList[state.currentIndex])
        ) : (
          <ResultScreen
            title={title}
            correctCount={state.correctCount}
            total={state.total}
          />
        )}
      </div>
    </main>
  );
}
