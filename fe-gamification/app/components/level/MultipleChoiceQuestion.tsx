import { useState } from "react";
import {
  QUESTION_KEYFRAMES,
  COLORS,
  PIXEL_SHADOW,
  type AnswerState,
  QuestionHeader,
  FeedbackBar,
} from "./QuestionShared";

export type MultipleChoiceQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackWrong: string;
};

type MultipleChoiceQuestionProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
  data: MultipleChoiceQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onLeave?: () => void;
};

type OptionButtonProps = {
  label: string;
  text: string;
  state: AnswerState;
  onClick: () => void;
};

function OptionButton({ label, text, state, onClick }: OptionButtonProps) {
  const bg =
    state === "correct"
      ? COLORS.correctBg
      : state === "wrong"
        ? COLORS.wrongBg
        : state === "selected"
          ? COLORS.selectedBg
          : COLORS.bgMid;

  const borderColor =
    state === "correct"
      ? COLORS.correctBorder
      : state === "wrong"
        ? COLORS.wrongBorder
        : state === "selected"
          ? COLORS.selectedBorder
          : COLORS.rim2;

  const textColor =
    state === "correct"
      ? COLORS.correctText
      : state === "wrong"
        ? COLORS.wrongText
        : state === "selected"
          ? COLORS.selectedText
          : COLORS.textMid;

  const animClass =
    state === "correct"
      ? " q-anim-correct"
      : state === "wrong"
        ? " q-anim-wrong"
        : "";

  return (
    <button
      onClick={onClick}
      className={`q-pixel${animClass}`}
      style={{
        width: "100%",
        padding: "12px 14px",
        background: bg,
        border: `3px solid ${borderColor}`,
        boxShadow: state ? "none" : PIXEL_SHADOW,
        color: textColor,
        fontSize: 9,
        textAlign: "left",
        cursor: state ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "background 0.15s, border-color 0.15s",
        lineHeight: 1.6,
      }}
    >
      <span
        style={{
          minWidth: 22,
          height: 22,
          background: borderColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 8,
          color: bg,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {text}
    </button>
  );
}

export function MultipleChoiceQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data,
  onAnswer,
  onLeave,
}: MultipleChoiceQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selectedIndex === data.correctIndex;

  function handleSelect(index: number) {
    if (revealed) return;
    setSelectedIndex(index);
    setRevealed(true);
    onAnswer(index === data.correctIndex);
  }

  function getState(index: number): AnswerState {
    if (!revealed) return selectedIndex === index ? "selected" : null;
    if (index === data.correctIndex) return "correct";
    if (index === selectedIndex) return "wrong";
    return null;
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
          stars={revealed && isCorrect ? 1 : 0}
          onLeave={onLeave}
        />

        <div style={{ padding: "20px 16px 12px" }}>
          <p
            className="q-pixel"
            style={{
              fontSize: 10,
              color: COLORS.textBright,
              lineHeight: 2,
              marginBottom: 20,
            }}
          >
            {data.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.options.map((option, index) => (
              <OptionButton
                key={index}
                label={"ABCD"[index]}
                text={option}
                state={getState(index)}
                onClick={() => handleSelect(index)}
              />
            ))}
          </div>
        </div>

        {revealed && (
          <div style={{ padding: "0 16px 16px" }}>
            <FeedbackBar
              isCorrect={isCorrect}
              correctText={data.feedbackCorrect}
              wrongText={data.feedbackWrong}
            />
          </div>
        )}
      </div>
    </>
  );
}

const EXAMPLE_QUESTION: MultipleChoiceQuestion = {
  question: "Which method removes the\nlast element of an array?",
  options: ["array.shift()", "array.pop()", "array.remove()", "array.splice()"],
  correctIndex: 1,
  feedbackCorrect: "✓ RICHTIG! pop() entfernt das letzte Element.",
  feedbackWrong: "✗ FALSCH! Die richtige Antwort ist array.pop()",
};

export default function MultipleChoicePreview() {
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
        <MultipleChoiceQuestion
          levelNum={3}
          questionNum={2}
          totalQuestions={5}
          data={EXAMPLE_QUESTION}
          onAnswer={(correct) => console.log("answered:", correct)}
        />
      </div>
    </div>
  );
}
