import type { LocalizedText } from "../../data/types";
import type { UiLanguage } from "../storage/types";

/**
 * Turns a meanings field (which may read like "human being, person") into a
 * list of individually acceptable answers, so a learner typing just
 * "person" is accepted without requiring the exact full gloss string.
 * Splits on commas/semicolons/slashes, which is how this course's source
 * material separates alternate meanings — never invents synonyms beyond
 * what the source text itself lists.
 */
export function meaningsToAcceptedAnswers(meanings: LocalizedText[], language: UiLanguage): string[] {
  const out: string[] = [];
  for (const entry of meanings) {
    const text = language === "pl" ? entry.pl ?? entry.en : entry.en ?? entry.pl;
    if (!text) continue;
    for (const part of text.split(/[,;/]/)) {
      const trimmed = part.trim();
      if (trimmed) out.push(trimmed);
    }
  }
  return out;
}
