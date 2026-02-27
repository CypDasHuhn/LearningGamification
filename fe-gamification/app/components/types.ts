export type Level = {
  id: number;
  x: number;
  y: number;
  stars: number;
  title: string;
  questionType: "multiple-choice" | "true-false" | "gap-fill";
};
