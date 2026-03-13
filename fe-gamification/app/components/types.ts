export type QuestionType = "MC" | "TF" | "GAP";

export type AuthRequest = {
  userName: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: number;
  userName: string;
};

export type UserResponse = {
  userId: number;
  userName: string;
};

export type ThemeResponse = {
  themeId: number;
  name: string;
  description: string | null;
  questionCount: number;
};

export type ThemeQuestionSetResponse = {
  questionSetId: number;
  title: string;
  teamId: number;
  questionCount: number;
};

export type McAnswerResponse = {
  answerId: number;
  optionText: string;
  optionOrder: number;
};

export type GapOptionResponse = {
  gapOptionId: number;
  optionText: string;
  optionOrder: number;
};

export type GapFieldResponse = {
  gapId: number;
  gapIndex: number;
  options: GapOptionResponse[];
};

export type QuestionSummaryResponse = {
  questionId: number;
  questionType: QuestionType;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  allowsMultiple: boolean;
  completed: boolean;
};

export type QuestionResponse = {
  questionId: number;
  questionSetId: number;
  questionType: QuestionType;
  startText: string | null;
  imageUrl: string | null;
  endText: string | null;
  allowsMultiple: boolean;
  completed: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
};

export type QuestionAnswersResponse = {
  questionId: number;
  questionType: QuestionType;
  allowsMultiple: boolean;
  mcAnswers: McAnswerResponse[];
  gapFields: GapFieldResponse[];
};

export type GapAnswerInput = {
  gapId: number;
  selectedOptionId: number;
};

export type SubmitAnswerRequest = {
  selectedAnswerIds: number[];
  gapAnswers: GapAnswerInput[];
};

export type SubmitAnswerResponse = {
  questionId: number;
  questionType: QuestionType;
  isCorrect: boolean;
  awardedPoints: number;
  completed: boolean;
};

export type LeaderboardEntryResponse = {
  rank: number;
  userId: number;
  userName: string;
  points: number;
  completedQuestions: number;
  lastCompletedAt: number | null;
  currentUser: boolean;
};

export type ErrorResponse = {
  message: string;
};

export type Level = {
  id: number;
  x: number;
  y: number;
  stars: number;
  title: string;
};

export type LevelData = {
  questionSetId: number;
  title: string;
  questions: QuestionResponse[];
};
