import type { VocabularyEntry, LocalizedText, SourceReference } from "../../data/types";
import type { Lemma, VerbClass } from "./index";

export interface ConjugationPracticeItem extends Lemma {
  id: string;
  meanings: LocalizedText[];
  source: SourceReference[];
}

const CONJUGATABLE_CLASSES: VerbClass[] = ["verb-godan", "verb-ichidan", "verb-irregular", "i-adjective", "na-adjective"];

/** Rejects entries whose kana/kanji field isn't a single clean word (joined alternate readings, notes, punctuation). */
function isCleanLemma(text: string): boolean {
  return !/[・/()[\]、，,\s]/.test(text);
}

/** Na-adjectives are sometimes stored with the pre-noun な attached (きれいな); the engine wants the bare stem. */
function stripTrailingNa(kanji: string | undefined, kana: string): { kanji?: string; kana: string } {
  if (kana.endsWith("な") && (!kanji || kanji.endsWith("な"))) {
    return { kanji: kanji ? kanji.slice(0, -1) : undefined, kana: kana.slice(0, -1) };
  }
  return { kanji, kana };
}

/**
 * Builds the pool of vocabulary items the conjugation engine can safely
 * conjugate: only entries explicitly tagged with a conjugatable part of
 * speech, and only ones whose kanji/kana are a single clean word (so
 * malformed/joined-alternate-reading entries never reach the engine).
 */
export function buildConjugationPracticePool(vocabulary: VocabularyEntry[]): ConjugationPracticeItem[] {
  const pool: ConjugationPracticeItem[] = [];
  for (const v of vocabulary) {
    const tag = v.partOfSpeech?.find((p): p is VerbClass => (CONJUGATABLE_CLASSES as string[]).includes(p));
    if (!tag) continue;
    if (!isCleanLemma(v.kana) || (v.kanji && !isCleanLemma(v.kanji))) continue;

    const { kanji, kana } = tag === "na-adjective" ? stripTrailingNa(v.kanji, v.kana) : { kanji: v.kanji, kana: v.kana };
    pool.push({ id: v.id, kanji, kana, wordClass: tag, meanings: v.meanings, source: v.source });
  }
  return pool;
}
