/** Discriminated union of supported question types. */
export type QuestionType = "MC" | "TF" | "GAP";

/** Request body for login and registration endpoints. */
export type AuthRequest = {
  userName: string;
  password: string;
};

/** Response body returned by `POST /auth/login` and `POST /auth/register`. */
export type AuthResponse = {
  token: string;
  userId: number;
  userName: string;
};

/** Minimal user representation returned by user-info endpoints. */
export type UserResponse = {
  userId: number;
  userName: string;
};

/** A theme (chapter) as returned by `GET /themes`. */
export type ThemeResponse = {
  themeId: number;
  name: string;
  description: string | null;
  questionCount: number;
};

/** A question set (level) belonging to a theme, from `GET /themes/{id}/question-sets`. */
export type ThemeQuestionSetResponse = {
  questionSetId: number;
  title: string;
  teamId: number;
  questionCount: number;
};

/** A multiple-choice answer option embedded in question responses. */
export type McAnswerResponse = {
  answerId: number;
  optionText: string;
  /** 1-based display order for the option. */
  optionOrder: number;
};

/** A single selectable option within a gap field. */
export type GapOptionResponse = {
  gapOptionId: number;
  optionText: string;
  /** 1-based display order for the option. */
  optionOrder: number;
};

/** A single gap (blank) in a gap-fill question, including its answer options. */
export type GapFieldResponse = {
  gapId: number;
  /** 0-based index determining the gap's position in the rendered code. */
  gapIndex: number;
  /** Optional text shown immediately before this gap. */
  textBefore?: string | null;
  /** Optional text shown immediately after this gap. */
  textAfter?: string | null;
  options: GapOptionResponse[];
};

/** Lightweight question summary returned by `GET /question-sets/{id}/questions`. */
export type QuestionSummaryResponse = {
  questionId: number;
  questionType: QuestionType;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  /** True when the question allows selecting multiple correct answers (MC only). */
  allowsMultiple: boolean;
  /** True when the current user has already answered this question correctly. */
  completed: boolean;
};

/** Full question data including all answer options, from `GET /questions`. */
export type QuestionResponse = {
  questionId: number;
  questionSetId: number;
  questionType: QuestionType;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  /** True when the question allows selecting multiple correct answers (MC only). */
  allowsMultiple: boolean;
  /** True when the current user has already answered this question correctly. */
  completed: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
};

/** Answer options for a single question, from `GET /questions/{id}/answers`. */
export type QuestionAnswersResponse = {
  questionId: number;
  questionType: QuestionType;
  allowsMultiple: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
};

/** A single gap answer within a submit request. */
export type GapAnswerInput = {
  gapId: number;
  selectedOptionId: number;
};

/** Request body for `POST /questions/{id}/submit`. */
export type SubmitAnswerRequest = {
  selectedAnswerIds: number[];
  gapAnswers: GapAnswerInput[];
};

/** Result of submitting an answer, from `POST /questions/{id}/submit`. */
export type SubmitAnswerResponse = {
  questionId: number;
  questionType: QuestionType;
  isCorrect: boolean;
  awardedPoints: number;
  completed: boolean;
};

/** A single row in the global leaderboard, from `GET /leaderboard`. */
export type LeaderboardEntryResponse = {
  rank: number;
  userId: number;
  userName: string;
  points: number;
  completedQuestions: number;
  lastCompletedAt: number | null;
  /** True when this entry belongs to the currently authenticated user. */
  currentUser: boolean;
};

/** Generic API error response body. */
export type ErrorResponse = {
  message: string;
};

/**
 * A node on the level/chapter selection map.
 * `stars` encodes progress: `-1` = locked, `0` = available, `1–3` = completed.
 */
export type Level = {
  id: number;
  /** Pixel x-coordinate on the map canvas. */
  x: number;
  /** Pixel y-coordinate on the map canvas. */
  y: number;
  /** -1 = locked, 0 = available/next, 1–3 = completed with that many stars. */
  stars: number;
  title: string;
};

/** Level data loaded for the question screen. */
export type LevelData = {
  questionSetId: number;
  title: string;
  questions: QuestionResponse[];
};
