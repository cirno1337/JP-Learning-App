import type { TranslationKey } from "../i18n/translations";

export interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", labelKey: "nav.dashboard", icon: "🏠" },
  { path: "/kanji", labelKey: "nav.kanjiLessons", icon: "🈶" },
  { path: "/kanji/test", labelKey: "nav.kanjiTest", icon: "📝" },
  { path: "/vocabulary", labelKey: "nav.vocabularyLessons", icon: "📖" },
  { path: "/vocabulary/test", labelKey: "nav.vocabularyTest", icon: "✍️" },
  { path: "/grammar", labelKey: "nav.grammar", icon: "🧩" },
  { path: "/numbers", labelKey: "nav.numbers", icon: "🔢" },
  { path: "/lessons", labelKey: "nav.lessonReview", icon: "🗂️" },
  { path: "/conjugation", labelKey: "nav.conjugation", icon: "🔁" },
  { path: "/kana", labelKey: "nav.kana", icon: "あ" },
  { path: "/review/mixed", labelKey: "nav.mixedReview", icon: "🎲" },
  { path: "/review/weak-areas", labelKey: "nav.weakAreas", icon: "🎯" },
  { path: "/progress", labelKey: "nav.progress", icon: "📈" },
  { path: "/settings", labelKey: "nav.settings", icon: "⚙️" },
];
