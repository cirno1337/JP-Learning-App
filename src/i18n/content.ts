import type { LocalizedText } from "../data/types";
import type { UiLanguage } from "../lib/storage/types";

/**
 * Resolves content-level localized text (meanings, explanations — as opposed
 * to UI strings, see useTranslation) for display. Falls back to English,
 * since the source PDFs are English-medium and Polish glosses are added
 * incrementally. Returns all values joined when a field genuinely has
 * multiple distinct meanings (e.g. multiple valid meanings of a kanji).
 */
export function localizedText(entries: LocalizedText[], language: UiLanguage): string {
  if (entries.length === 0) return "";
  return entries
    .map((entry) => (language === "pl" ? entry.pl ?? entry.en : entry.en ?? entry.pl))
    .filter((v): v is string => Boolean(v))
    .join("; ");
}

export function firstLocalizedText(entries: LocalizedText[], language: UiLanguage): string {
  if (entries.length === 0) return "";
  const entry = entries[0];
  return (language === "pl" ? entry.pl ?? entry.en : entry.en ?? entry.pl) ?? "";
}
