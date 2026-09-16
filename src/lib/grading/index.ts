/**
 * Reusable answer-normalisation and grading functions (spec section 24).
 *
 * These deliberately do NOT try to be clever about synonyms or grammar —
 * multiple valid answers must be listed explicitly in `acceptedAnswers`.
 * What normalisation does handle is harmless formatting noise: whitespace,
 * casing, punctuation, and full-width/half-width Unicode variants.
 */

export function normalizeEnglish(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.!?,;:'"]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Normalises Japanese input for comparison. Trims whitespace, applies
 * Unicode NFKC normalisation (folds full-width/half-width forms), and
 * strips common trailing punctuation. Does NOT convert between kana and
 * kanji, and does NOT treat unrelated spellings as equivalent — an item
 * that accepts both forms must list them explicitly in `acceptedAnswers`.
 */
export function normalizeJapanese(input: string): string {
  return input
    .trim()
    .normalize("NFKC")
    .replace(/[。、！？\s]/g, "");
}

export type GradingKind = "english" | "japanese";

export function checkAnswer(
  userInput: string,
  acceptedAnswers: string[],
  kind: GradingKind,
): boolean {
  const normalize = kind === "english" ? normalizeEnglish : normalizeJapanese;
  const normalizedInput = normalize(userInput);
  if (normalizedInput.length === 0) return false;
  return acceptedAnswers.some((answer) => normalize(answer) === normalizedInput);
}
