import type { Level, QuestionResponse } from "~/components/types";

export const MOCK_LEVELS: Level[] = [
  { id: 1, x: 125, y: 295, stars: 3, title: "Grundlagen" },
  { id: 2, x: 340, y: 215, stars: 2, title: "Variablen" },
  { id: 3, x: 555, y: 280, stars: 1, title: "Schleifen" },
  { id: 4, x: 765, y: 200, stars: 0, title: "Funktionen" },
  { id: 5, x: 975, y: 268, stars: -1, title: "Arrays" },
  { id: 6, x: 1185, y: 208, stars: -1, title: "Objekte" },
  { id: 7, x: 1395, y: 275, stars: -1, title: "Klassen" },
  { id: 8, x: 1605, y: 210, stars: -1, title: "Algorithmen" },
];

export type MockLevelData = {
  questionSetId: number;
  title: string;
  questions: QuestionResponse[];
};

export const MOCK_LEVEL_DATA: Record<number, MockLevelData> = {
  1: {
    questionSetId: 1,
    title: "Grundlagen",
    questions: [
      {
        questionId: 101,
        questionSetId: 1,
        questionType: "MC",
        startText: "Was ist JavaScript?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          {
            answerId: 1,
            optionText: "Eine Skriptsprache für den Browser",
            optionOrder: 0,
          },
          { answerId: 2, optionText: "Eine Datenbank", optionOrder: 1 },
          { answerId: 3, optionText: "Ein Betriebssystem", optionOrder: 2 },
          {
            answerId: 4,
            optionText: "Eine Sprache für Microcontroller",
            optionOrder: 3,
          },
        ],
        gapFields: [],
      },
      {
        questionId: 102,
        questionSetId: 1,
        questionType: "TF",
        startText: "HTML ist eine Programmiersprache.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 5, optionText: "true", optionOrder: 0 },
          { answerId: 6, optionText: "false", optionOrder: 1 },
        ],
        gapFields: [],
      },
      {
        questionId: 103,
        questionSetId: 1,
        questionType: "MC",
        startText: "Welches Keyword deklariert eine Konstante in JavaScript?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 7, optionText: "var", optionOrder: 0 },
          { answerId: 8, optionText: "let", optionOrder: 1 },
          { answerId: 9, optionText: "const", optionOrder: 2 },
          { answerId: 10, optionText: "def", optionOrder: 3 },
        ],
        gapFields: [],
      },
    ],
  },

  2: {
    questionSetId: 2,
    title: "Variablen",
    questions: [
      {
        questionId: 201,
        questionSetId: 2,
        questionType: "TF",
        startText:
          "Eine mit const deklarierte Variable kann nicht neu zugewiesen werden.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 11, optionText: "true", optionOrder: 0 },
          { answerId: 12, optionText: "false", optionOrder: 1 },
        ],
        gapFields: [],
      },
      {
        questionId: 202,
        questionSetId: 2,
        questionType: "GAP",
        startText: "Vervollständige die Variablendeklaration:",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [],
        gapFields: [
          {
            gapId: 1,
            gapIndex: 0,
            options: [
              { gapOptionId: 1, optionText: "==", optionOrder: 0 },
              { gapOptionId: 2, optionText: "===", optionOrder: 1 },
              { gapOptionId: 3, optionText: "=", optionOrder: 2 },
              { gapOptionId: 4, optionText: ":=", optionOrder: 3 },
            ],
          },
        ],
      },
      {
        questionId: 203,
        questionSetId: 2,
        questionType: "MC",
        startText: "Was ist der Unterschied zwischen let und var?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          {
            answerId: 13,
            optionText: "let hat Block-Scope, var Funktions-Scope",
            optionOrder: 0,
          },
          {
            answerId: 14,
            optionText: "var hat Block-Scope, let Funktions-Scope",
            optionOrder: 1,
          },
          {
            answerId: 15,
            optionText: "Es gibt keinen Unterschied",
            optionOrder: 2,
          },
          {
            answerId: 16,
            optionText: "let ist nur für Zahlen",
            optionOrder: 3,
          },
        ],
        gapFields: [],
      },
    ],
  },

  3: {
    questionSetId: 3,
    title: "Schleifen",
    questions: [
      {
        questionId: 301,
        questionSetId: 3,
        questionType: "MC",
        startText:
          "Welche Schleife eignet sich am besten bei bekannter Iterationszahl?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 17, optionText: "while", optionOrder: 0 },
          { answerId: 18, optionText: "do-while", optionOrder: 1 },
          { answerId: 19, optionText: "for", optionOrder: 2 },
          { answerId: 20, optionText: "forEach", optionOrder: 3 },
        ],
        gapFields: [],
      },
      {
        questionId: 302,
        questionSetId: 3,
        questionType: "GAP",
        startText: "Vervollständige die for-Schleife:",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [],
        gapFields: [
          {
            gapId: 2,
            gapIndex: 0,
            options: [
              { gapOptionId: 5, optionText: "i > 5", optionOrder: 0 },
              { gapOptionId: 6, optionText: "i != 5", optionOrder: 1 },
              { gapOptionId: 7, optionText: "i < 5", optionOrder: 2 },
              { gapOptionId: 8, optionText: "i == 5", optionOrder: 3 },
            ],
          },
        ],
      },
      {
        questionId: 303,
        questionSetId: 3,
        questionType: "TF",
        startText:
          "Eine while-Schleife prüft die Bedingung vor dem ersten Durchlauf.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 21, optionText: "true", optionOrder: 0 },
          { answerId: 22, optionText: "false", optionOrder: 1 },
        ],
        gapFields: [],
      },
    ],
  },

  4: {
    questionSetId: 4,
    title: "Funktionen",
    questions: [
      {
        questionId: 401,
        questionSetId: 4,
        questionType: "MC",
        startText: "Was gibt eine Funktion ohne return-Statement zurück?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 23, optionText: "0", optionOrder: 0 },
          { answerId: 24, optionText: "null", optionOrder: 1 },
          { answerId: 25, optionText: "undefined", optionOrder: 2 },
          { answerId: 26, optionText: "false", optionOrder: 3 },
        ],
        gapFields: [],
      },
      {
        questionId: 402,
        questionSetId: 4,
        questionType: "TF",
        startText: "Arrow Functions haben kein eigenes this.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 27, optionText: "true", optionOrder: 0 },
          { answerId: 28, optionText: "false", optionOrder: 1 },
        ],
        gapFields: [],
      },
      {
        questionId: 403,
        questionSetId: 4,
        questionType: "GAP",
        startText: "Vervollständige die Arrow Function:",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [],
        gapFields: [
          {
            gapId: 3,
            gapIndex: 0,
            options: [
              { gapOptionId: 9, optionText: "->", optionOrder: 0 },
              { gapOptionId: 10, optionText: "=>", optionOrder: 1 },
              { gapOptionId: 11, optionText: "==", optionOrder: 2 },
              { gapOptionId: 12, optionText: "=>>", optionOrder: 3 },
            ],
          },
        ],
      },
    ],
  },
};
