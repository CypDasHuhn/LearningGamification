import { useState } from "react";
import {
  QUESTION_KEYFRAMES,
  COLORS,
  PIXEL_SHADOW,
  INSET_SHADOW,
  QuestionHeader,
  FeedbackBar,
} from "./QuestionShared";

/** Data model for a true/false question. */
export type TrueFalseQuestion = {
  statement: string;
  correctAnswer: boolean;
  feedbackCorrect: string;
  feedbackWrong: string;
};

type TrueFalseQuestionProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
  data: TrueFalseQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onSubmit?: (selectedIsTrue: boolean) => void;
};

/** Renders a true/false question card with WAHR / FALSCH buttons. */
export function TrueFalseQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data,
  onAnswer,
  onSubmit,
}: TrueFalseQuestionProps) {
  const [answer, setAnswer] = useState<boolean | null>(null);

  const revealed = answer !== null;
  const isCorrect = answer === data.correctAnswer;

  function handleAnswer(value: boolean) {
    if (revealed) return;
    setAnswer(value);
    onSubmit?.(value);
    onAnswer(value === data.correctAnswer);
  }

  return (
    <>
      <style>{QUESTION_KEYFRAMES}</style>
      <div
        className="q-fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          background: COLORS.bgDeep,
          border: `4px solid ${COLORS.rim2}`,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        <QuestionHeader
          levelNum={levelNum}
          questionNum={questionNum}
          totalQuestions={totalQuestions}
        />

        <div
          style={{
            padding: "20px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Statement card */}
          <div
            style={{
              padding: "18px 16px",
              background: COLORS.bgMid,
              border: `3px solid ${COLORS.rim2}`,
              boxShadow: INSET_SHADOW,
            }}
          >
            <p
              className="q-pixel"
              style={{
                fontSize: 10,
                color: COLORS.textBright,
                lineHeight: 2.2,
                margin: 0,
              }}
            >
              {data.statement}
            </p>
          </div>

          {/* WAHR / FALSCH buttons */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {([true, false] as const).map((value) => {
              const isWahrButton = value === true;
              const wasChosen = answer === value;
              const isThisCorrect = value === data.correctAnswer;

              const bg = !revealed
                ? isWahrButton
                  ? COLORS.correctBg
                  : COLORS.wrongBg
                : wasChosen && isThisCorrect
                  ? COLORS.correctBg
                  : wasChosen && !isThisCorrect
                    ? COLORS.wrongBg
                    : isThisCorrect
                      ? COLORS.correctBg
                      : COLORS.bgDeep;

              const borderColor = !revealed
                ? isWahrButton
                  ? COLORS.correctBorder
                  : COLORS.wrongBorder
                : isThisCorrect
                  ? COLORS.correctBorder
                  : wasChosen
                    ? COLORS.wrongBorder
                    : COLORS.rim1;

              const textColor = !revealed
                ? isWahrButton
                  ? COLORS.correctText
                  : COLORS.wrongText
                : isThisCorrect
                  ? COLORS.correctText
                  : wasChosen
                    ? COLORS.wrongText
                    : COLORS.textFaint;

              const animClass =
                revealed && wasChosen
                  ? isCorrect
                    ? " q-anim-correct"
                    : " q-anim-wrong"
                  : "";

              return (
                <button
                  key={String(value)}
                  onClick={() => handleAnswer(value)}
                  className={`q-pixel${animClass}`}
                  style={{
                    padding: "22px 12px",
                    background: bg,
                    border: `3px solid ${borderColor}`,
                    boxShadow: revealed ? "none" : PIXEL_SHADOW,
                    color: textColor,
                    fontSize: 13,
                    cursor: revealed ? "default" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                >
                  <span style={{ fontSize: 24 }}>
                    {isWahrButton ? "✓" : "✗"}
                  </span>
                  {isWahrButton ? "WAHR" : "FALSCH"}
                </button>
              );
            })}
          </div>

          {revealed && (
            <FeedbackBar
              isCorrect={isCorrect}
              correctText={data.feedbackCorrect}
              wrongText={data.feedbackWrong}
            />
          )}
        </div>
      </div>
    </>
  );
}

const EXAMPLE_QUESTION: TrueFalseQuestion = {
  statement:
    "Eine const-Variable in\nJavaScript kann nicht\nneu zugewiesen werden.",
  correctAnswer: true,
  feedbackCorrect: "✓ RICHTIG! const verhindert Neuzuweisung.",
  feedbackWrong: "✗ FALSCH! const kann nicht neu zugewiesen werden.",
};

export default function TrueFalsePreview() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(to bottom, #bae6fd, #bbf7d0)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <TrueFalseQuestion
          levelNum={5}
          questionNum={1}
          totalQuestions={5}
          data={EXAMPLE_QUESTION}
          onAnswer={(correct) => console.log("answered:", correct)}
        />
      </div>
    </div>
  );
}
