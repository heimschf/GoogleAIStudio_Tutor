export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown supported
  rSnippet: string;
  estimatedMinutes: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface CodingChallenge {
  id: string;
  taskDescription: string;
  instructionMarkdown: string;
  placeholderCode: string;
  initialDatasetName: string;
  initialDataset: number[];
  validationMetric: "mean" | "median" | "sd" | "var" | "range" | "IQR" | "summary" | "quantile" | "boxplot";
  validationTarget: any; // Checked computed result
  hint: string;
  solutionCode: string;
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "Beginner" | "Intermediate";
  icon: string; // lucide icon identifier
  lessons: Lesson[];
  quizzes: QuizQuestion[];
  challenge: CodingChallenge;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SandboxHistoryItem {
  code: string;
  timestamp: string;
  output: string;
  error?: string;
  plot?: {
    type: "histogram" | "boxplot";
    values: number[];
    title: string;
    labels?: string[];
  };
}

export interface UserProgress {
  completedLessons: string[]; // lesson ids
  completedQuizzes: string[]; // topic ids (for passed quizzes)
  completedChallenges: string[]; // topic ids (for passed challenges)
  stars: number; // gamified metric
  streak: number; // consecutive progress tracking
  lastActiveDate: string | null;
}
