import { useState } from "react";
import {
  QUESTION_KEYFRAMES,
  COLORS,
  PIXEL_SHADOW,
  INSET_SHADOW,
  QuestionHeader,
  FeedbackBar,
  type ButtonState,
  getButtonColors,
} from "./QuestionShared";

/** A single token in a code-display line: either literal text or a fill-in gap. */
export type CodeToken =
  | { type: "text"; text: string; color?: string }
  | { type: "gap"; gapId: number };

/** The correct answer and distractors for one gap within a {@link GapFillQuestion}. */
export type GapAnswer = {
  gapId: number;
  options: string[];
  correctIndex: number;
};

/** Data model for a gap-fill (cloze) question. */
export type GapFillQuestion = {
  instruction: string;
  codeLines: CodeToken[][];
  gaps: GapAnswer[];
  feedbackCorrect: string;
  feedbackWrong: string;
};

type GapFillQuestionProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
  data: GapFillQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onSubmit?: (gapSelections: Record<number, number>) => void;
};

function optionLabel(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
}

type GapState = "idle" | "selected" | "correct" | "wrong";

function gapColors(state: GapState, hasValue: boolean) {
  if (state === "correct")
    return { border: COLORS.correctBorder, text: COLORS.correctText };
  if (state === "wrong")
    return { border: COLORS.wrongBorder, text: COLORS.wrongText };
  if (state === "selected")
    return { border: COLORS.skyBright, text: COLORS.selectedText };
  return {
    border: hasValue ? COLORS.skyBright : COLORS.amber,
    text: "transparent",
  };
}

type OptionButtonProps = {
  label: string;
  text: string;
  isActive: boolean;
  isLocked: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
};

function OptionButton({
  label,
  text,
  isActive,
  isLocked,
  isCorrect,
  onClick,
}: OptionButtonProps) {
  const state: ButtonState =
    isCorrect === true  ? "correct"  :
    isCorrect === false ? "wrong"    :
    isActive            ? "selected" :
    "idle";
  const { bg, borderColor, textColor, animStyle } = getButtonColors(state);

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "13px 15px",
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
      {text}
    </button>
  );
}

type GapChipProps = {
  value: string | null;
  state: GapState;
  isActive: boolean;
  onClick: () => void;
};

function GapChip({ value, state, isActive, onClick }: GapChipProps) {
  const { border, text } = gapColors(state, value !== null);
  const isLocked = state === "correct" || state === "wrong";

  return (
    <span
      onClick={isLocked ? undefined : onClick}
      style={{
        display: "inline-block",
        minWidth: 80,
        padding: "0 8px",
        borderBottom: `3px solid ${border}`,
        borderTop: isActive ? `1px solid ${border}` : "none",
        color: text,
        fontFamily: "monospace",
        fontSize: 14,
        textAlign: "center",
        cursor: isLocked ? "default" : "pointer",
        background: isActive ? "rgba(56,189,248,0.08)" : "transparent",
        animation:
          value && state === "idle"
            ? "snapIn 0.25s ease both"
            : state === "idle" && !value
              ? "blink 1s step-end infinite"
              : "none",
        transition: "border-color 0.2s, color 0.2s",
        verticalAlign: "middle",
        marginBottom: -2,
        userSelect: "none",
      }}
    >
      {value ?? "▮"}
    </span>
  );
}

/**
 * Renders a gap-fill (cloze) question card. The user selects an answer for
 * each gap from a list of options below the code display.
 */
export function GapFillQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data,
  onAnswer,
  onSubmit,
}: GapFillQuestionProps) {
  const [activeGapId, setActiveGapId] = useState<number>(
    data.gaps[0]?.gapId ?? 0,
  );
  const [gapSelections, setGapSelections] = useState<
    Record<number, number | null>
  >(Object.fromEntries(data.gaps.map((g) => [g.gapId, null])));
  const [revealed, setRevealed] = useState(false);

  const activeGap =
    data.gaps.find((g) => g.gapId === activeGapId) ?? data.gaps[0];
  const allFilled = data.gaps.every((g) => gapSelections[g.gapId] !== null);

  const isCorrect =
    revealed &&
    data.gaps.every((g) => gapSelections[g.gapId] === g.correctIndex);

  function getGapState(gapId: number): GapState {
    const gap = data.gaps.find((g) => g.gapId === gapId)!;
    const selection = gapSelections[gapId];
    if (!revealed) return selection !== null ? "selected" : "idle";
    if (selection === gap.correctIndex) return "correct";
    return "wrong";
  }

  function handleOptionSelect(optionIndex: number) {
    if (revealed) return;
    setGapSelections((prev) => ({ ...prev, [activeGapId]: optionIndex }));

    const nextEmpty = data.gaps.find(
      (g) => g.gapId !== activeGapId && gapSelections[g.gapId] === null,
    );
    if (nextEmpty) setActiveGapId(nextEmpty.gapId);
  }

  function handleConfirm() {
    if (revealed || !allFilled) return;
    setRevealed(true);
    const filledSelections = gapSelections as Record<number, number>;
    onSubmit?.(filledSelections);
    const correct = data.gaps.every(
      (g) => gapSelections[g.gapId] === g.correctIndex,
    );
    onAnswer(correct);
  }

  function getOptionState(optionIndex: number): {
    isActive: boolean;
    isLocked: boolean;
    isCorrect: boolean | null;
  } {
    const selection = gapSelections[activeGapId];
    if (!revealed)
      return {
        isActive: selection === optionIndex,
        isLocked: false,
        isCorrect: null,
      };
    return {
      isActive: false,
      isLocked: true,
      isCorrect:
        optionIndex === activeGap.correctIndex
          ? true
          : selection === optionIndex
            ? false
            : null,
    };
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

        <div
          style={{
            padding: "24px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              color: COLORS.textBright,
              lineHeight: 2,
            }}
          >
            {data.instruction}
          </p>

          <div
            style={{
              padding: "16px 18px",
              background: "#0c0a09",
              border: `3px solid ${COLORS.rim2}`,
              boxShadow: INSET_SHADOW,
              fontFamily: "monospace",
              fontSize: 14,
              lineHeight: 2.4,
              color: COLORS.textDim,
            }}
          >
            {data.codeLines.map((line, lineIndex) => (
              <div key={lineIndex}>
                {line.map((token, tokenIndex) => {
                  if (token.type === "text") {
                    return (
                      <span
                        key={tokenIndex}
                        style={{ color: token.color ?? COLORS.textBright }}
                      >
                        {token.text}
                      </span>
                    );
                  }
                  const gap = data.gaps.find((g) => g.gapId === token.gapId)!;
                  const selection = gapSelections[token.gapId];
                  const gapState = getGapState(token.gapId);
                  const value =
                    selection !== null ? gap.options[selection] : null;
                  return (
                    <GapChip
                      key={tokenIndex}
                      value={value}
                      state={gapState}
                      isActive={activeGapId === token.gapId && !revealed}
                      onClick={() => setActiveGapId(token.gapId)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {data.gaps.length > 1 && !revealed && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {data.gaps.map((g, i) => {
                const isFilled = gapSelections[g.gapId] !== null;
                const isSelected = activeGapId === g.gapId;
                return (
                  <button
                    key={g.gapId}
                    onClick={() => setActiveGapId(g.gapId)}
                    style={{
                      padding: "8px 14px",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 8,
                      background: isSelected ? COLORS.selectedBg : COLORS.bgMid,
                      border: `2px solid ${isSelected ? COLORS.selectedBorder : isFilled ? COLORS.correctBorder : COLORS.rim2}`,
                      color: isSelected
                        ? COLORS.selectedText
                        : isFilled
                          ? COLORS.correctText
                          : COLORS.textDim,
                      cursor: "pointer",
                    }}
                  >
                    LÜCKE {i + 1} {isFilled ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeGap.options.map((option, index) => {
              const {
                isActive,
                isLocked,
                isCorrect: optIsCorrect,
              } = getOptionState(index);
              return (
                <OptionButton
                  key={index}
                  label={optionLabel(index)}
                  text={option}
                  isActive={isActive}
                  isLocked={isLocked}
                  isCorrect={optIsCorrect}
                  onClick={() => handleOptionSelect(index)}
                />
              );
            })}
          </div>
        </div>

        {!revealed && (
          <div style={{ padding: "0 20px 16px" }}>
            <button
              onClick={handleConfirm}
              disabled={!allFilled}
              style={{
                width: "100%",
                padding: "16px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
                background: allFilled ? COLORS.amberDark : COLORS.bgMid,
                border: `3px solid ${allFilled ? COLORS.amber : COLORS.rim1}`,
                boxShadow: allFilled ? PIXEL_SHADOW : "none",
                color: allFilled ? COLORS.amberLight : COLORS.textFaint,
                cursor: allFilled ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              {allFilled
                ? "BESTÄTIGEN ↵"
                : `NOCH ${data.gaps.filter((g) => gapSelections[g.gapId] === null).length} LÜCKE(N) OFFEN`}
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

const EXAMPLE_SINGLE_GAP: GapFillQuestion = {
  instruction: "Vervollständige den Code:",
  codeLines: [
    [
      { type: "text", text: "fetch", color: COLORS.skyBright },
      { type: "text", text: "(url)" },
    ],
    [{ type: "gap", gapId: 0 }],
    [
      { type: "text", text: "  ." },
      { type: "text", text: "then", color: COLORS.skyBright },
      { type: "text", text: "(data => log(data))" },
    ],
  ],
  gaps: [
    {
      gapId: 0,
      options: ["catch", "then", "await", "finally"],
      correctIndex: 1,
    },
  ],
  feedbackCorrect: "✓ RICHTIG! .then() verkettet Promises.",
  feedbackWrong: "✗ FALSCH! .then() ist die richtige Methode.",
};

const EXAMPLE_MULTI_GAP: GapFillQuestion = {
  instruction: "Fülle alle Lücken aus:",
  codeLines: [
    [
      { type: "text", text: "let ", color: COLORS.skyBright },
      { type: "text", text: "name " },
      { type: "gap", gapId: 0 },
      { type: "text", text: ' "Alex";' },
    ],
    [
      { type: "text", text: "console.", color: COLORS.textDim },
      { type: "gap", gapId: 1 },
      { type: "text", text: "(name);" },
    ],
    [
      { type: "text", text: "// Output: ", color: COLORS.textDim },
      { type: "gap", gapId: 2 },
    ],
  ],
  gaps: [
    { gapId: 0, options: ["=", "==", "===", ":="], correctIndex: 0 },
    { gapId: 1, options: ["log", "warn", "print", "write"], correctIndex: 0 },
    {
      gapId: 2,
      options: ['"Alex"', '"name"', "undefined", "null"],
      correctIndex: 0,
    },
  ],
  feedbackCorrect: "✓ RICHTIG! Alle Lücken korrekt.",
  feedbackWrong: "✗ FALSCH! Überprüfe die markierten Lücken.",
};

export default function GapFillPreview() {
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
            {multi ? "MULTI-GAP" : "SINGLE GAP"}
          </button>
        ))}
      </div>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <GapFillQuestion
          key={String(showMulti)}
          levelNum={7}
          questionNum={3}
          totalQuestions={5}
          data={showMulti ? EXAMPLE_MULTI_GAP : EXAMPLE_SINGLE_GAP}
          onAnswer={(c) => console.log("answered:", c)}
        />
      </div>
    </div>
  );
}
