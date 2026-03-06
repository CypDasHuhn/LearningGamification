import type { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import type { TrueFalseQuestion } from "./TrueFalseQuestion";
import type { GapFillQuestion } from "./GapQuestion";
import { COLORS } from "./QuestionShared";

export type LevelQuestion =
  | { type: "multiple-choice"; data: MultipleChoiceQuestion }
  | { type: "true-false"; data: TrueFalseQuestion }
  | { type: "gap-fill"; data: GapFillQuestion };

export const LEVEL_QUESTIONS: Record<number, LevelQuestion> = {
  1: {
    type: "multiple-choice",
    data: {
      question: "Was ist die korrekte\nDeklaration einer Variable?",
      options: ["var x = 5", "variable x = 5", "v x = 5", "declare x = 5"],
      correctIndices: [0],
      feedbackCorrect: "✓ RICHTIG! var, let und const sind gültig.",
      feedbackWrong: "✗ FALSCH! Nutze var, let oder const.",
    },
  },
  2: {
    type: "true-false",
    data: {
      statement: "let und const wurden\nmit ES6 eingeführt.",
      correctAnswer: true,
      feedbackCorrect: "✓ RICHTIG! ES6 (2015) brachte let und const.",
      feedbackWrong: "✗ FALSCH! ES6 hat let und const eingeführt.",
    },
  },
  3: {
    type: "multiple-choice",
    data: {
      question: "Welche sind gültige\nWege eine Variable\nzu deklarieren?",
      options: [
        "var x = 1",
        "let x = 1",
        "const x = 1",
        "variable x = 1",
        "def x = 1",
      ],
      correctIndices: [0, 1, 2],
      feedbackCorrect: "✓ RICHTIG! var, let und const sind alle gültig.",
      feedbackWrong: "✗ FALSCH! var, let und const sind korrekt.",
    },
  },
  4: {
    type: "gap-fill",
    data: {
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
    },
  },
  5: {
    type: "true-false",
    data: {
      statement: "Eine const-Variable\nkann nicht neu\nzugewiesen werden.",
      correctAnswer: true,
      feedbackCorrect: "✓ RICHTIG! const verhindert Neuzuweisung.",
      feedbackWrong: "✗ FALSCH! const kann nicht neu zugewiesen werden.",
    },
  },
  6: {
    type: "multiple-choice",
    data: {
      question: "Was gibt typeof null\nin JavaScript zurück?",
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctIndices: [2],
      feedbackCorrect: '✓ RICHTIG! typeof null === "object" (bekannter Bug).',
      feedbackWrong: '✗ FALSCH! typeof null gibt "object" zurück.',
    },
  },
  7: {
    type: "gap-fill",
    data: {
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
        {
          gapId: 1,
          options: ["log", "warn", "print", "write"],
          correctIndex: 0,
        },
        {
          gapId: 2,
          options: ['"Alex"', '"name"', "undefined", "null"],
          correctIndex: 0,
        },
      ],
      feedbackCorrect: "✓ RICHTIG! Alle Lücken korrekt ausgefüllt.",
      feedbackWrong: "✗ FALSCH! Überprüfe die markierten Lücken.",
    },
  },
};
