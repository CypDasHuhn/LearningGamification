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

export const PIXEL_SHADOW = "4px 4px 0 rgba(0,0,0,0.5)";
export const INSET_SHADOW =
  "inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.35)";

export type AnswerState = "correct" | "wrong" | "selected" | null;

// ─── Shared sub-components ────────────────────────────────────────────────────

type ProgressBarProps = { current: number; total: number };

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

type StarRowProps = { earned: number };

export function StarRow({ earned }: StarRowProps) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3].map((starValue) => (
        <span
          key={starValue}
          style={{
            fontSize: 18,
            color: starValue <= earned ? COLORS.amber : COLORS.rim1,
            textShadow: starValue <= earned ? "1px 1px 0 #000" : "none",
            animation:
              starValue <= earned
                ? `starPop 0.4s ease ${starValue * 0.1}s both`
                : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

type QuestionHeaderProps = {
  levelNum: number;
  questionNum: number;
  totalQuestions: number;
  stars: number;
  onLeave?: () => void;
};

export function QuestionHeader({
  levelNum,
  questionNum,
  totalQuestions,
  stars,
  onLeave,
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
      <button
        onClick={onLeave}
        className="q-pixel"
        style={{
          fontSize: 8,
          color: COLORS.textDim,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          whiteSpace: "nowrap",
        }}
      >
        ← VERLASSEN
      </button>

      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="q-pixel"
            style={{ fontSize: 8, color: COLORS.textMid }}
          >
            LEVEL {levelNum}
          </span>
          <StarRow earned={stars} />
        </div>
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
