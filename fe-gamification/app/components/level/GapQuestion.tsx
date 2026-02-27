import { useState } from "react";
import {
  QUESTION_KEYFRAMES,
  COLORS,
  PIXEL_SHADOW,
  INSET_SHADOW,
  type AnswerState,
  QuestionHeader,
  FeedbackBar,
} from "./QuestionShared";

export type CodeLine = { type: "code"; tokens: CodeToken[] } | { type: "gap" };

export type CodeToken = {
  text: string;
  color?: string;
};

export type GapFillQuestion = {
  instruction: string;
  codeLines: CodeLine[];
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackWrong: string;
};

type GapFillQuestionProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
  data: GapFillQuestion;
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
        padding: "10px 12px",
        background: bg,
        border: `3px solid ${borderColor}`,
        boxShadow: state ? "none" : PIXEL_SHADOW,
        color: textColor,
        fontSize: 9,
        textAlign: "left",
        cursor: state ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "background 0.15s, border-color 0.15s",
        lineHeight: 1.6,
      }}
    >
      <span
        style={{
          minWidth: 20,
          height: 20,
          background: borderColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 7,
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

export function GapFillQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data,
  onAnswer,
  onLeave,
}: GapFillQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selectedIndex === data.correctIndex;

  const filledWord = revealed
    ? data.options[data.correctIndex]
    : selectedIndex !== null
      ? data.options[selectedIndex]
      : null;

  const gapBorderColor = filledWord
    ? revealed && isCorrect
      ? COLORS.correctBorder
      : revealed
        ? COLORS.wrongBorder
        : COLORS.skyBright
    : COLORS.amber;

  const gapTextColor = filledWord
    ? revealed && isCorrect
      ? COLORS.correctText
      : revealed
        ? COLORS.wrongText
        : COLORS.selectedText
    : "transparent";

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
          stars={revealed && isCorrect ? 2 : 0}
          onLeave={onLeave}
        />

        <div
          style={{
            padding: "20px 16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p
            className="q-pixel"
            style={{ fontSize: 10, color: COLORS.textBright, lineHeight: 2 }}
          >
            {data.instruction}
          </p>

          {/* Code block */}
          <div
            style={{
              padding: "14px 16px",
              background: "#0c0a09",
              border: `3px solid ${COLORS.rim2}`,
              boxShadow: INSET_SHADOW,
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 2.2,
              color: COLORS.textDim,
            }}
          >
            {data.codeLines.map((line, lineIndex) => (
              <div key={lineIndex}>
                {line.type === "gap" ? (
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 70,
                      borderBottom: `2px solid ${gapBorderColor}`,
                      color: gapTextColor,
                      textAlign: "center",
                      animation: filledWord
                        ? "snapIn 0.3s ease both"
                        : "blink 1s step-end infinite",
                      marginBottom: -2,
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                  >
                    {filledWord ?? "▮"}
                  </span>
                ) : (
                  line.tokens.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      style={{ color: token.color ?? COLORS.textBright }}
                    >
                      {token.text}
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
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

const EXAMPLE_QUESTION: GapFillQuestion = {
  instruction: "Vervollständige den Code:",
  codeLines: [
    {
      type: "code",
      tokens: [{ text: "fetch", color: COLORS.skyBright }, { text: "(url)" }],
    },
    { type: "gap" },
    {
      type: "code",
      tokens: [
        { text: "  ." },
        { text: "then", color: COLORS.skyBright },
        { text: "(data => log(data))" },
      ],
    },
  ],
  options: ["catch", "then", "await", "finally"],
  correctIndex: 1,
  feedbackCorrect: "✓ RICHTIG! .then() verkettet Promises.",
  feedbackWrong: "✗ FALSCH! .then() ist die richtige Methode.",
};

export default function GapFillPreview() {
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
        <GapFillQuestion
          levelNum={7}
          questionNum={3}
          totalQuestions={5}
          data={EXAMPLE_QUESTION}
          onAnswer={(correct) => console.log("answered:", correct)}
        />
      </div>
    </div>
  );
}
