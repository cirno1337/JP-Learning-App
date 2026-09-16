import type { TranslationKey } from "../i18n/translations";

export interface NavItem {
  path: string;
  labelKey: TranslationKey;
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", labelKey: "nav.dashboard" },
  { path: "/kanji", labelKey: "nav.kanjiLessons" },
  { path: "/kanji/test", labelKey: "nav.kanjiTest" },
  { path: "/vocabulary", labelKey: "nav.vocabularyLessons" },
  { path: "/vocabulary/test", labelKey: "nav.vocabularyTest" },
  { path: "/grammar", labelKey: "nav.grammar" },
  { path: "/numbers", labelKey: "nav.numbers" },
  { path: "/lessons", labelKey: "nav.lessonReview" },
  { path: "/conjugation", labelKey: "nav.conjugation" },
  { path: "/kana", labelKey: "nav.kana" },
  { path: "/review/mixed", labelKey: "nav.mixedReview" },
  { path: "/review/weak-areas", labelKey: "nav.weakAreas" },
  { path: "/progress", labelKey: "nav.progress" },
  { path: "/settings", labelKey: "nav.settings" },
];
