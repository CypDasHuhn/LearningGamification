/**
 * Visual state for an answer option button.
 * Used by both {@link MultipleChoiceQuestion} and {@link GapFillQuestion}.
 */
export type ButtonState = "idle" | "selected" | "correct" | "wrong" | "missed";

/** Resolved colour tokens for a button in a given {@link ButtonState}. */
export interface ButtonVisualState {
  bg: string;
  borderColor: string;
  textColor: string;
  /** Non-empty only for "correct" and "wrong" states. */
  animStyle: React.CSSProperties;
}

/**
 * Returns the colour tokens and animation style for an option button based on
 * its current {@link ButtonState}.
 *
 * Centralises the colour logic that was previously duplicated across
 * `MultipleChoiceQuestion` and `GapFillQuestion`.
 *
 * @param state - The button's current visual state.
 * @returns Resolved CSS values ready to spread onto the button's `style` prop.
 */
export function getButtonColors(state: ButtonState): ButtonVisualState {
  const bg =
    state === "correct"  ? COLORS.correctBg  :
    state === "wrong"    ? COLORS.wrongBg     :
    state === "missed"   ? "#1a1000"          :
    state === "selected" ? COLORS.selectedBg  :
    COLORS.bgMid;

  const borderColor =
    state === "correct"  ? COLORS.correctBorder  :
    state === "wrong"    ? COLORS.wrongBorder     :
    state === "missed"   ? COLORS.amberDark       :
    state === "selected" ? COLORS.selectedBorder  :
    COLORS.rim2;

  const textColor =
    state === "correct"  ? COLORS.correctText  :
    state === "wrong"    ? COLORS.wrongText     :
    state === "missed"   ? COLORS.amber         :
    state === "selected" ? COLORS.selectedText  :
    COLORS.textMid;

  const animStyle: React.CSSProperties =
    state === "correct" ? { animation: "answerCorrect 0.4s ease" } :
    state === "wrong"   ? { animation: "answerWrong 0.4s ease" }   :
    {};

  return { bg, borderColor, textColor, animStyle };
}

/** CSS keyframe animations and utility classes used by all question components. */
export const QUESTION_KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes answerCorrect {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes answerWrong {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px); }
    40%     { transform: translateX(5px); }
    60%     { transform: translateX(-3px); }
    80%     { transform: translateX(3px); }
  }
  @keyframes starPop {
    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
    60%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes snapIn {
    0%   { opacity: 0; transform: scale(0.7); }
    70%  { transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }

  .q-pixel        { font-family: 'Press Start 2P', monospace; }
  .q-fade-in      { animation: fadeSlideIn 0.35s ease both; }
  .q-anim-correct { animation: answerCorrect 0.4s ease; }
  .q-anim-wrong   { animation: answerWrong 0.4s ease; }
`;

/** Design-token palette shared by all question components. */
export const COLORS = {
  bgDeep: "#1c1917",
  bgMid: "#292524",
  bgSurface: "#3c3330",

  rim1: "#44403c",
  rim2: "#57534e",
  rim3: "#7c6a4e",

  amber: "#e8b840",
  amberDark: "#b8860b",
  amberLight: "#fcd34d",

  skyBright: "#38bdf8",
  skyDark: "#0369a1",

  correctBg: "#14532d",
  correctBorder: "#16a34a",
  correctText: "#4ade80",
  wrongBg: "#7f1d1d",
  wrongBorder: "#dc2626",
  wrongText: "#f87171",
  selectedBg: "#0c2a3d",
  selectedBorder: "#0369a1",
  selectedText: "#7dd3fc",

  textBright: "#e7e5e4",
  textMid: "#d6d3d1",
  textDim: "#a8a29e",
  textFaint: "#57534e",
} as const;

/** Pixel-art drop shadow for raised buttons and cards. */
export const PIXEL_SHADOW = "4px 4px 0 rgba(0,0,0,0.5)";
/** Inset highlight + shadow used on sunken surfaces. */
export const INSET_SHADOW =
  "inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.35)";

/** State passed to {@link FeedbackBar} after the user has answered. */
export type AnswerState = "correct" | "wrong" | "selected" | null;

type ProgressBarProps = { current: number; total: number };

/**
 * Amber XP-style progress bar showing question progress within a level.
 * Fills proportionally to `(current - 1) / total`.
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = ((current - 1) / total) * 100;
  return (
    <div
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}
    >
      <div
        style={{
          flex: 1,
          height: 14,
          background: COLORS.bgMid,
          border: `3px solid ${COLORS.rim1}`,
          boxShadow: INSET_SHADOW,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.amberDark}, ${COLORS.amber})`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        className="q-pixel"
        style={{ fontSize: 8, color: COLORS.textDim, whiteSpace: "nowrap" }}
      >
        {current - 1}/{total}
      </span>
    </div>
  );
}

type QuestionHeaderProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
};

/**
 * Top strip of every question card.
 * Displays the level number and an animated progress bar.
 */
export function QuestionHeader({
  levelNum,
  questionNum,
  totalQuestions,
}: QuestionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px 10px",
        borderBottom: `3px solid ${COLORS.rim1}`,
        gap: 14,
      }}
    >
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}
      >
        <span
          className="q-pixel"
          style={{ fontSize: 8, color: COLORS.textMid }}
        >
          LEVEL {levelNum}
        </span>
        <ProgressBar current={questionNum} total={totalQuestions} />
      </div>
    </div>
  );
}

type FeedbackBarProps = {
  isCorrect: boolean;
  correctText: string;
  wrongText: string;
};

/**
 * Coloured banner shown after the user answers.
 * Green with `correctText` for a correct answer; red with `wrongText` otherwise.
 */
export function FeedbackBar({
  isCorrect,
  correctText,
  wrongText,
}: FeedbackBarProps) {
  return (
    <div
      className="q-pixel"
      style={{
        padding: "10px 12px",
        fontSize: 8,
        lineHeight: 1.9,
        background: isCorrect ? COLORS.correctBg : COLORS.wrongBg,
        border: `3px solid ${isCorrect ? COLORS.correctBorder : COLORS.wrongBorder}`,
        color: isCorrect ? COLORS.correctText : COLORS.wrongText,
      }}
    >
      {isCorrect ? correctText : wrongText}
    </div>
  );
}
