import { extractLayoutPages } from "./lib/pdftext";
import { loadOwnArray, saveOwnArray, makeIdSequencer } from "./lib/lessonFile";
import type { KanjiEntry } from "../../src/data/types";

/**
 * Parses a "N5/N4 Kanji List - JLPTsensei.com.pdf" reference document into
 * SUPPLEMENTARY kanji entries (external reference, not course-original —
 * see docs/source-inventory.md group F and spec section 44). Written to
 * src/data/supplementary/kanji/, kept entirely separate from course kanji.
 *
 * Layout-mode text puts each kanji's data across 2-3 lines in an unusual
 * order (confirmed by inspection):
 *   <romaji-on>   <romaji-kun>   <meaning line 1>      [line A, precedes]
 *   <num> <kanji> <katakana-on>  <hiragana-kun>        [line B]
 *   <meaning line 2, optional continuation>            [line C]
 * Only line B (num/kanji/readings) and the meaning text from lines A/C are
 * used; the romaji on line A is redundant with the kana readings on line B.
 *
 * Usage: tsx scripts/extract/parseJlptKanjiList.ts <pdf> <outputName>
 *   e.g. tsx scripts/extract/parseJlptKanjiList.ts "N5 Kanji List - JLPTsensei.com.pdf" n5-kanji
 */

const LINE_B_START = /^\s*(\d+)\s+(\S)\s+(.+)$/u;

function splitCols(line: string): string[] {
  return line.trim().split(/\s{2,}/);
}

function main() {
  const [pdfPath, outputName] = process.argv.slice(2);
  if (!pdfPath || !outputName) {
    console.error("Usage: tsx scripts/extract/parseJlptKanjiList.ts <pdf> <outputName>");
    process.exit(1);
  }
  const fileName = pdfPath.split("/").pop()!;
  const pages = extractLayoutPages(pdfPath);

  const outPath = `src/data/supplementary/kanji/${outputName}.json`;
  const entries = loadOwnArray<KanjiEntry>(outPath);
  const nextId = makeIdSequencer(entries, `supp-${outputName}-`);

  let pendingMeaning: string | null = null;
  let newCount = 0;
  const unmatched: string[] = [];

  pages.forEach((pageText, pageIdx) => {
    const lines = pageText.split("\n").map((l) => l.trimEnd());
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed === "#" || /^(#\s+Kanji|JLPT SENSEI|In total|Kanji are listed|See full kanji)/.test(trimmed)) {
        i += 1;
        continue;
      }
      const m = LINE_B_START.exec(line);
      if (m) {
        const [, , kanjiChar, rest] = m;
        // The line has (num, kanji, then 1-3 more 2+space-separated columns):
        // onyomi, kunyomi, and — when the meaning list is long enough to
        // wrap — a meaning-continuation fragment sharing this same line
        // (confirmed: "10  方  ホウ  かた                    alternative",
        // where "alternative" continues the meaning column, not a 3rd
        // reading). Only the first two columns are readings; anything
        // beyond that is meaning continuation, never kunyomi.
        const cols = splitCols(rest);
        const onRaw = cols[0] ?? "";
        // Kunyomi is always kana (+ commas/parens), while an English meaning
        // fragment always contains Latin letters — use that to tell a real
        // kunyomi column apart from a meaning fragment that merely happens
        // to sit in the kunyomi column's position (confirmed: "員 (member)"
        // has NO kunyomi at all, so cols[1] there is actually "number" — the
        // start of its wrapped meaning — not a reading).
        const hasNoLatin = (s: string) => !/[A-Za-z]/.test(s);
        let kunRaw = cols[1] !== undefined && hasNoLatin(cols[1]) ? cols[1] : "";
        const meaningColsStart = kunRaw ? 2 : 1;
        const trailingMeaningFragments = cols.slice(meaningColsStart);
        const onyomi = onRaw.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
        let meaning = pendingMeaning ?? "";
        pendingMeaning = null;
        if (trailingMeaningFragments.length > 0) meaning += ` ${trailingMeaningFragments.join(" ")}`;
        i += 1;
        // When the kunyomi list is long enough to push past line B entirely
        // (confirmed: "86  空  クウ" with no kunyomi column at all, followed
        // by "そら、から、あ(く)、す(く)、" then "むな(しい)" on their own
        // lines), continuation lines with NO Latin letters are more kunyomi,
        // not meaning — English meaning text always contains ASCII letters.
        let stillCollectingKunyomi = !kunRaw;
        // Collect continuation lines until the next entry (either a
        // line-A shape — 2+ columns, not digit-led — or a line-B digit line).
        while (i < lines.length) {
          const next = lines[i].trim();
          if (!next) {
            i += 1;
            continue;
          }
          if (LINE_B_START.test(lines[i])) break;
          const nextCols = splitCols(next);
          if (nextCols.length >= 2) break; // this is the next entry's line A
          if (stillCollectingKunyomi && hasNoLatin(next)) {
            kunRaw += ` ${next}`;
          } else {
            stillCollectingKunyomi = false;
            meaning += ` ${next}`;
          }
          i += 1;
        }
        const kunyomi = kunRaw.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
        entries.push({
          id: nextId(),
          character: kanjiChar,
          meanings: [{ en: meaning.trim() }],
          onyomi: onyomi.length > 0 ? onyomi : undefined,
          kunyomi: kunyomi.length > 0 ? kunyomi : undefined,
          lessonIds: [],
          origin: "supplementary",
          source: [{ file: fileName }],
        });
        newCount += 1;
        continue;
      }
      // Not a line-B; if it looks like a line-A (2+ columns), stash its last column as the pending meaning.
      const cols = splitCols(trimmed);
      if (cols.length >= 2) {
        pendingMeaning = cols[cols.length - 1];
      } else {
        unmatched.push(`p.${pageIdx + 1}: ${trimmed}`);
      }
      i += 1;
    }
  });

  saveOwnArray(outPath, entries);
  console.log(`${fileName}: ${newCount} new supplementary kanji entries -> ${outPath}`);
  if (unmatched.length > 0) {
    console.warn(`  ${unmatched.length} unmatched line(s) (informational, likely headers/footers):`);
    for (const u of unmatched.slice(0, 20)) console.warn(`    ${u}`);
  }
}

main();
