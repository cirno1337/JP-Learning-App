import { extractLayoutPages } from "./lib/pdftext";
import { loadOwnArray, saveOwnArray, makeIdSequencer } from "./lib/lessonFile";
import type { GrammarEntry } from "../../src/data/types";

/**
 * Parses a "JLPT SENSEI - Nx Grammar List.pdf" table (# | pattern | romaji |
 * meaning — same shape as the vocabulary lists, see parseJlptVocabList.ts)
 * into SUPPLEMENTARY grammar entries.
 *
 * Usage: tsx scripts/extract/parseJlptGrammarList.ts <pdf> <outputName>
 */

function splitCols(line: string): string[] {
  return line.trim().split(/\s{2,}/);
}

function main() {
  const [pdfPath, outputName] = process.argv.slice(2);
  if (!pdfPath || !outputName) {
    console.error("Usage: tsx scripts/extract/parseJlptGrammarList.ts <pdf> <outputName>");
    process.exit(1);
  }
  const fileName = pdfPath.split("/").pop()!;
  const pages = extractLayoutPages(pdfPath);

  const outPath = `src/data/supplementary/grammar/${outputName}.json`;
  const entries = loadOwnArray<GrammarEntry>(outPath);
  const nextId = makeIdSequencer(entries, `supp-${outputName}-`);

  let newCount = 0;
  const unmatched: string[] = [];

  pages.forEach((pageText, pageIdx) => {
    for (const raw of pageText.split("\n")) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const cols = splitCols(trimmed);
      if (!/^\d+$/.test(cols[0]) || cols.length < 3) continue;
      const pattern = cols[1];
      // cols[2] is romaji (ignored, redundant); meaning is everything after.
      const meaning = cols.slice(3).length > 0 ? cols.slice(3).join(" ") : cols[2];
      if (!pattern || !meaning) {
        unmatched.push(`p.${pageIdx + 1}: ${trimmed}`);
        continue;
      }
      entries.push({
        id: nextId(),
        pattern,
        explanation: [{ en: meaning }],
        examples: [],
        lessonIds: [],
        origin: "supplementary",
        source: [{ file: fileName }],
      });
      newCount += 1;
    }
  });

  saveOwnArray(outPath, entries);
  console.log(`${fileName}: ${newCount} new supplementary grammar entries -> ${outPath}`);
  if (unmatched.length > 0) {
    console.warn(`  ${unmatched.length} unmatched line(s):`);
    for (const u of unmatched.slice(0, 10)) console.warn(`    ${u}`);
  }
}

main();
