/**
 * Types for locally-persisted user state: progress, spaced-repetition
 * scheduling, and settings. None of this is content — it's what the app
 * remembers about the learner between sessions (spec sections 22, 23, 31).
 */

export type AnswerOutcome = "auto-correct" | "self-accepted" | "wrong";

export type ReviewBucket = "new" | "learning" | "review" | "mastered";

export interface ItemStats {
  /** Matches a content item id (kanji/vocabulary/grammar/number/exercise). */
  itemId: string;
  attempts: number;
  automaticCorrect: number;
  selfAccepted: number;
  wrong: number;
  lastSeen?: string;
  lastCorrect?: string;
  /** Higher = more difficult for this learner; drives "Weak Areas". */
  difficultyScore: number;
  bucket: ReviewBucket;
  /** ISO datetime the item is next due for review. */
  dueAt?: string;
  /** Learner-set flags, independent of automatic stats. */
  markedKnown?: boolean;
  markedDifficult?: boolean;
}

export interface AttemptRecord {
  itemId: string;
  timestamp: string;
  outcome: AnswerOutcome;
  /** e.g. "kanji", "vocabulary", "grammar", "number" — for per-category accuracy stats. */
  category: string;
  direction?: "jp-to-en" | "en-to-jp" | "reading" | "meaning";
}

export type UiLanguage = "en" | "pl";
export type ThemePreference = "light" | "dark" | "system";

export interface UserSettings {
  uiLanguage: UiLanguage;
  theme: ThemePreference;
  defaultTestDirection: "jp-to-en" | "en-to-jp" | "mixed";
  includeMasteredInReview: boolean;
}

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt?: string;
  category: string;
  totalQuestions: number;
  automaticCorrect: number;
  selfAccepted: number;
  wrong: number;
}

export interface ProgressState {
  version: number;
  itemStats: Record<string, ItemStats>;
  attempts: AttemptRecord[];
  sessions: SessionSummary[];
  settings: UserSettings;
  lastStudiedAt?: string;
  currentStreak?: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  uiLanguage: "en",
  theme: "system",
  defaultTestDirection: "mixed",
  includeMasteredInReview: false,
};

export const EMPTY_PROGRESS: ProgressState = {
  version: 1,
  itemStats: {},
  attempts: [],
  sessions: [],
  settings: DEFAULT_SETTINGS,
};
