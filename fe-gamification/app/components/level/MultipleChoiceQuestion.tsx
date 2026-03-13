import { useState } from "react";
import {
  QUESTION_KEYFRAMES,
  COLORS,
  PIXEL_SHADOW,
  INSET_SHADOW,
  QuestionHeader,
  FeedbackBar,
} from "./QuestionShared";

export type MultipleChoiceQuestion = {
  question: string;
  options: string[];
  correctIndices: number[];
  feedbackCorrect: string;
  feedbackWrong: string;
};

type MultipleChoiceQuestionProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
  data: MultipleChoiceQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onSubmit?: (selectedIndices: number[]) => void;
};

type ButtonState = "idle" | "selected" | "correct" | "wrong" | "missed";

function optionLabel(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
}

type OptionButtonProps = {
  label: string;
  text: string;
  state: ButtonState;
  isMulti: boolean;
  onClick: () => void;
};

function OptionButton({
  label,
  text,
  state,
  isMulti,
  onClick,
}: OptionButtonProps) {
  const bg =
    state === "correct"
      ? COLORS.correctBg
      : state === "wrong"
        ? COLORS.wrongBg
        : state === "missed"
          ? "#1a1000"
          : state === "selected"
            ? COLORS.selectedBg
            : COLORS.bgMid;

  const borderColor =
    state === "correct"
      ? COLORS.correctBorder
      : state === "wrong"
        ? COLORS.wrongBorder
        : state === "missed"
          ? COLORS.amberDark
          : state === "selected"
            ? COLORS.selectedBorder
            : COLORS.rim2;

  const textColor =
    state === "correct"
      ? COLORS.correctText
      : state === "wrong"
        ? COLORS.wrongText
        : state === "missed"
          ? COLORS.amber
          : state === "selected"
            ? COLORS.selectedText
            : COLORS.textMid;

  const isLocked =
    state === "correct" || state === "wrong" || state === "missed";

  const animStyle: React.CSSProperties =
    state === "correct"
      ? { animation: "answerCorrect 0.4s ease" }
      : state === "wrong"
        ? { animation: "answerWrong 0.4s ease" }
        : {};

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 16px",
        background: bg,
        border: `3px solid ${borderColor}`,
        boxShadow: isLocked ? "none" : PIXEL_SHADOW,
        color: textColor,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 10,
        textAlign: "left",
        cursor: isLocked ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "background 0.15s, border-color 0.15s",
        lineHeight: 1.8,
        ...animStyle,
      }}
    >
      <span
        style={{
          minWidth: 26,
          height: 26,
          background: borderColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          color: bg,
          flexShrink: 0,
        }}
      >
        {label}
      </span>

      {isMulti && (
        <span
          style={{
            minWidth: 18,
            height: 18,
            border: `2px solid ${borderColor}`,
            background:
              state === "selected" || state === "correct"
                ? borderColor
                : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: bg,
            flexShrink: 0,
          }}
        >
          {state === "selected" || state === "correct" ? "✓" : ""}
        </span>
      )}

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
  onSubmit,
}: MultipleChoiceQuestionProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);

  const correctIndices: number[] = Array.isArray(data.correctIndices)
    ? data.correctIndices
    : [(data as unknown as { correctIndex: number }).correctIndex ?? 0];

  const isMulti = correctIndices.length > 1;
  const isCorrect =
    revealed &&
    selected.size === correctIndices.length &&
    correctIndices.every((i) => selected.has(i));

  function toggleOption(index: number) {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (isMulti) {
        next.has(index) ? next.delete(index) : next.add(index);
      } else {
        next.clear();
        next.add(index);
      }
      return next;
    });
  }

  function handleConfirm() {
    if (revealed || selected.size === 0) return;
    setRevealed(true);
    const selectedIndices = [...selected];
    onSubmit?.(selectedIndices);
    const correct =
      selected.size === correctIndices.length &&
      correctIndices.every((i) => selected.has(i));
    onAnswer(correct);
  }

  function getState(index: number): ButtonState {
    const isCorrectOption = correctIndices.includes(index);
    const wasSelected = selected.has(index);
    if (!revealed) return wasSelected ? "selected" : "idle";
    if (isCorrectOption && wasSelected) return "correct";
    if (!isCorrectOption && wasSelected) return "wrong";
    if (isCorrectOption && !wasSelected) return "missed";
    return "idle";
  }

  return (
    <>
      <style>{QUESTION_KEYFRAMES}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: COLORS.bgDeep,
          border: `4px solid ${COLORS.rim2}`,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          overflow: "hidden",
          animation: "fadeSlideIn 0.35s ease both",
        }}
      >
        <QuestionHeader
          levelNum={levelNum}
          questionNum={questionNum}
          totalQuestions={totalQuestions}
        />

        <div style={{ padding: "24px 20px 16px" }}>
          {isMulti && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: COLORS.bgMid,
                border: `2px solid ${COLORS.amber}`,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 8,
                color: COLORS.amber,
                lineHeight: 1.8,
              }}
            >
              ★ Mehrere Antworten möglich
            </div>
          )}

          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 12,
              color: COLORS.textBright,
              lineHeight: 2.2,
              marginBottom: 20,
            }}
          >
            {data.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.options.map((option, index) => (
              <OptionButton
                key={index}
                label={optionLabel(index)}
                text={option}
                state={getState(index)}
                isMulti={isMulti}
                onClick={() => toggleOption(index)}
              />
            ))}
          </div>
        </div>

        {!revealed && (
          <div style={{ padding: "0 20px 16px" }}>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              style={{
                width: "100%",
                padding: "16px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
                background: selected.size > 0 ? COLORS.amberDark : COLORS.bgMid,
                border: `3px solid ${selected.size > 0 ? COLORS.amber : COLORS.rim1}`,
                boxShadow: selected.size > 0 ? PIXEL_SHADOW : "none",
                color: selected.size > 0 ? COLORS.amberLight : COLORS.textFaint,
                cursor: selected.size > 0 ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              BESTÄTIGEN ↵
            </button>
          </div>
        )}

        {revealed && (
          <div style={{ padding: "0 20px 20px" }}>
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

const EXAMPLE_SINGLE: MultipleChoiceQuestion = {
  question: "Which method removes the\nlast element of an array?",
  options: [
    "array.shift()",
    "array.pop()",
    "array.remove()",
    "array.splice()",
    "array.delete()",
  ],
  correctIndices: [1],
  feedbackCorrect: "✓ RICHTIG! pop() entfernt das letzte Element.",
  feedbackWrong: "✗ FALSCH! Die richtige Antwort ist array.pop()",
};

const EXAMPLE_MULTI: MultipleChoiceQuestion = {
  question: "Welche sind gültige Wege\neine Variable zu deklarieren?",
  options: [
    "var x = 1",
    "let x = 1",
    "const x = 1",
    "variable x = 1",
    "def x = 1",
    "val x = 1",
  ],
  correctIndices: [0, 1, 2],
  feedbackCorrect: "✓ RICHTIG! var, let und const sind alle gültig.",
  feedbackWrong: "✗ FALSCH! var, let und const sind korrekt.",
};

export default function MultipleChoicePreview() {
  const [showMulti, setShowMulti] = useState(false);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #bae6fd, #bbf7d0)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 16,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {([false, true] as const).map((multi) => (
          <button
            key={String(multi)}
            onClick={() => setShowMulti(multi)}
            style={{
              padding: "8px 16px",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              background: showMulti === multi ? COLORS.amberDark : COLORS.bgMid,
              border: `3px solid ${showMulti === multi ? COLORS.amber : COLORS.rim2}`,
              color: showMulti === multi ? COLORS.amberLight : COLORS.textDim,
              cursor: "pointer",
            }}
          >
            {multi ? "MULTI-SELECT" : "SINGLE"}
          </button>
        ))}
      </div>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <MultipleChoiceQuestion
          key={String(showMulti)}
          levelNum={3}
          questionNum={2}
          totalQuestions={5}
          data={showMulti ? EXAMPLE_MULTI : EXAMPLE_SINGLE}
          onAnswer={(c) => console.log("answered:", c)}
        />
      </div>
    </div>
  );
}
