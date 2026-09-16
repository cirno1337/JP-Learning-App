import type { ContentDataset, LocalizedText, SourceReference } from "../../data/types";

/**
 * Global search across the content dataset (spec section 36): finds kanji,
 * kana, English/Polish meanings, grammar patterns, lessons, and source
 * filenames from a single query.
 */

export type SearchResultCategory = "kanji" | "vocabulary" | "grammar" | "numbers" | "kana" | "lesson";

export interface SearchResult {
  category: SearchResultCategory;
  id: string;
  primary: string;
  secondary?: string;
  meaning?: string;
  lessonIds: string[];
  path: string;
  source: SourceReference[];
}

function norm(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

function localizedTexts(texts: LocalizedText[] | undefined): string[] {
  if (!texts) return [];
  return texts.flatMap((t) => [t.en, t.pl]).filter((t): t is string => Boolean(t));
}

function joinMeanings(texts: LocalizedText[]): string {
  return localizedTexts(texts).join(", ");
}

function matches(query: string, haystacks: (string | undefined)[]): boolean {
  return haystacks.some((h) => h !== undefined && norm(h).includes(query));
}

const MAX_RESULTS_PER_CATEGORY = 30;

export function searchDataset(dataset: ContentDataset, rawQuery: string): SearchResult[] {
  const query = norm(rawQuery.trim());
  if (query.length === 0) return [];

  const results: SearchResult[] = [];

  for (const k of dataset.kanji) {
    if (results.filter((r) => r.category === "kanji").length >= MAX_RESULTS_PER_CATEGORY) break;
    const haystacks = [k.character, ...(k.readings ?? []), ...(k.onyomi ?? []), ...(k.kunyomi ?? []), ...localizedTexts(k.meanings), ...k.source.map((s) => s.file)];
    if (matches(query, haystacks)) {
      results.push({
        category: "kanji",
        id: k.id,
        primary: k.character,
        secondary: k.readings?.join(", ") ?? [...(k.onyomi ?? []), ...(k.kunyomi ?? [])].join(", "),
        meaning: joinMeanings(k.meanings),
        lessonIds: k.lessonIds,
        path: "/kanji",
        source: k.source,
      });
    }
  }

  for (const v of dataset.vocabulary) {
    if (results.filter((r) => r.category === "vocabulary").length >= MAX_RESULTS_PER_CATEGORY) break;
    const haystacks = [
      v.kanji,
      v.kana,
      ...(v.alternateSpellings?.map((s) => s.text) ?? []),
      ...localizedTexts(v.meanings),
      ...v.source.map((s) => s.file),
    ];
    if (matches(query, haystacks)) {
      results.push({
        category: "vocabulary",
        id: v.id,
        primary: v.kanji ?? v.kana,
        secondary: v.kanji ? v.kana : undefined,
        meaning: joinMeanings(v.meanings),
        lessonIds: v.lessonIds,
        path: "/vocabulary",
        source: v.source,
      });
    }
  }

  for (const g of dataset.grammar) {
    if (results.filter((r) => r.category === "grammar").length >= MAX_RESULTS_PER_CATEGORY) break;
    const haystacks = [g.pattern, ...localizedTexts(g.explanation), ...g.source.map((s) => s.file)];
    if (matches(query, haystacks)) {
      results.push({
        category: "grammar",
        id: g.id,
        primary: g.pattern,
        meaning: joinMeanings(g.explanation).slice(0, 160),
        lessonIds: g.lessonIds,
        path: "/grammar",
        source: g.source,
      });
    }
  }

  for (const n of dataset.numbers) {
    if (results.filter((r) => r.category === "numbers").length >= MAX_RESULTS_PER_CATEGORY) break;
    const haystacks = [n.japanese, n.reading, n.value !== undefined ? String(n.value) : undefined, ...n.source.map((s) => s.file)];
    if (matches(query, haystacks)) {
      results.push({
        category: "numbers",
        id: n.id,
        primary: n.japanese,
        secondary: n.reading,
        meaning: n.value !== undefined ? String(n.value) : undefined,
        lessonIds: n.lessonIds,
        path: "/numbers",
        source: n.source,
      });
    }
  }

  for (const k of dataset.kana) {
    if (results.filter((r) => r.category === "kana").length >= MAX_RESULTS_PER_CATEGORY) break;
    if (matches(query, [k.character, k.romaji])) {
      results.push({
        category: "kana",
        id: k.id,
        primary: k.character,
        secondary: k.romaji,
        lessonIds: k.lessonIds,
        path: "/kana",
        source: k.source,
      });
    }
  }

  for (const l of dataset.lessons) {
    if (results.filter((r) => r.category === "lesson").length >= MAX_RESULTS_PER_CATEGORY) break;
    const haystacks = [...localizedTexts(l.title), ...localizedTexts(l.description), ...l.sourceFiles.map((s) => s.file)];
    if (matches(query, haystacks)) {
      results.push({
        category: "lesson",
        id: l.id,
        primary: localizedTexts(l.title)[0] ?? l.id,
        lessonIds: [l.id],
        path: `/lessons/${l.id}`,
        source: l.sourceFiles,
      });
    }
  }

  return results;
}
