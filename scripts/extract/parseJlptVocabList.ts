import { extractLayoutPages } from "./lib/pdftext";
import { loadOwnArray, saveOwnArray, makeIdSequencer } from "./lib/lessonFile";
import type { PartOfSpeech, VocabularyEntry } from "../../src/data/types";

/**
 * Parses a JLPTsensei.com vocabulary list PDF (nouns/verbs/adjectives/
 * adverbs/particles/katakana-words) into SUPPLEMENTARY vocabulary entries.
 * These lists do NOT all share one column layout — confirmed variants:
 *   nouns/adjectives/katakana:  # | kanji-or-kana | kana | romaji | meaning
 *   adverbs:                    # | kanji-or-kana | kana |        | meaning
 *   particles:                  # | kana          |      | romaji | meaning
 * (kana column absent for kana-only words; some files have no romaji
 * column at all). A romaji reading and an English meaning can both be
 * bare lowercase ASCII words (e.g. "ame" vs "candy"), so romaji presence
 * can't be reliably detected per-row by content alone — instead it's
 * detected ONCE per file from the header row (does it contain "Romaji"?),
 * since every row in a given file shares the same column layout. Per-row,
 * only whether THIS word has kanji (needing a following kana column) is
 * still content-dependent (pure-kana primary word = no separate kana col).
 *
 * Usage: tsx scripts/extract/parseJlptVocabList.ts <pdf> <outputName> [partOfSpeech]
 *   e.g. tsx scripts/extract/parseJlptVocabList.ts "Vocabulary - N5 Nouns List - JLPT Sensei.pdf" n5-nouns noun
 */

function splitCols(line: string): string[] {
  return line.trim().split(/\s{2,}/);
}

const KANA_ONLY = /^[぀-ヿ々ー～〜/]+$/;

function main() {
  const [pdfPath, outputName, posArg] = process.argv.slice(2);
  if (!pdfPath || !outputName) {
    console.error("Usage: tsx scripts/extract/parseJlptVocabList.ts <pdf> <outputName> [partOfSpeech]");
    process.exit(1);
  }
  const fileName = pdfPath.split("/").pop()!;
  const pages = extractLayoutPages(pdfPath);
  const pos = posArg as PartOfSpeech | undefined;

  const outPath = `src/data/supplementary/vocabulary/${outputName}.json`;
  const entries = loadOwnArray<VocabularyEntry>(outPath);
  const nextId = makeIdSequencer(entries, `supp-${outputName}-`);

  // Determine once, from the header row, whether this file has a romaji column.
  let hasRomajiColumn = false;
  for (const pageText of pages) {
    const headerLine = pageText.split("\n").find((l) => /^\s*#/.test(l));
    if (headerLine) {
      hasRomajiColumn = /romaji/i.test(headerLine);
      break;
    }
  }

  let newCount = 0;
  const unmatched: string[] = [];

  pages.forEach((pageText, pageIdx) => {
    for (const raw of pageText.split("\n")) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const cols = splitCols(trimmed);
      const numMatch = /^(\d+)$/.exec(cols[0]);
      if (!numMatch) continue; // header/footer/noise lines never start with a bare number
      if (cols.length < 3) {
        unmatched.push(`p.${pageIdx + 1}: ${trimmed}`);
        continue;
      }
      const primary = cols[1];
      let idx = 2;
      let kanaCol: string | undefined;
      if (!KANA_ONLY.test(primary)) {
        kanaCol = cols[idx];
        idx += 1;
      }
      if (hasRomajiColumn) idx += 1; // skip the romaji column, redundant with kana
      const meaning = cols.slice(idx).join(" ").replace(/​/g, "").trim();
      if (!meaning) {
        unmatched.push(`p.${pageIdx + 1}: ${trimmed}`);
        continue;
      }
      const kanaOnly = kanaCol === undefined;
      entries.push({
        id: nextId(),
        kanji: kanaOnly ? undefined : primary,
        kana: kanaOnly ? primary : kanaCol!,
        meanings: [{ en: meaning }],
        partOfSpeech: pos ? [pos] : undefined,
        lessonIds: [],
        origin: "supplementary",
        source: [{ file: fileName }],
      });
      newCount += 1;
    }
  });

  saveOwnArray(outPath, entries);
  console.log(
    `${fileName}: ${newCount} new supplementary vocabulary entries -> ${outPath} (romaji column: ${hasRomajiColumn})`,
  );
  if (unmatched.length > 0) {
    console.warn(`  ${unmatched.length} unmatched line(s):`);
    for (const u of unmatched.slice(0, 15)) console.warn(`    ${u}`);
  }
}

main();
