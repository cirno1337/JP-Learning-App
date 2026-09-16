import { extractPages } from "./lib/pdftext";
import { loadOwnArray, saveOwnArray, makeIdSequencer } from "./lib/lessonFile";
import type { ExampleSentence } from "../../src/data/types";

/**
 * Parses one "Peppa Pig Analysis N_4.pdf" file: a series of
 * "Sentence Analysis" blocks, each with shape:
 *
 *   Sentence Analysis
 *   Sentence
 *   <japanese sentence>
 *   Analysis
 *   • <word/particle>: <explanation>
 *   • ...
 *   Translation: <english>
 *
 * Plain-mode text extraction is used because it gives clean per-line
 * sentence text; small inline furigana hints (visible in -layout mode)
 * are not reliably recoverable this way, so `reading` is left unset here
 * rather than guessed — the "Analysis" bullets (kept verbatim in `notes`)
 * already give the real pedagogical value: word-by-word/particle-by-
 * particle breakdown, taken directly from the source.
 *
 * Usage: tsx scripts/extract/parsePeppaPig.ts "Peppa Pig Analysis 1_4.pdf" extra-practice
 */

function main() {
  const [pdfPath, lessonId] = process.argv.slice(2);
  if (!pdfPath || !lessonId) {
    console.error("Usage: tsx scripts/extract/parsePeppaPig.ts <pdf> <lessonId>");
    process.exit(1);
  }
  const fileName = pdfPath.split("/").pop()!;
  const pages = extractPages(pdfPath);

  const examplesPath = `src/data/examples/${lessonId}.json`;
  const examples = loadOwnArray<ExampleSentence>(examplesPath);
  const nextId = makeIdSequencer(examples, `${lessonId}-example-`);

  let newCount = 0;
  pages.forEach((pageText, pageIdx) => {
    const lines = pageText.split("\n").map((l) => l.trim());
    let i = 0;
    while (i < lines.length) {
      if (lines[i] !== "Sentence Analysis") {
        i += 1;
        continue;
      }
      i += 1;
      // Expect "Sentence" header, then the Japanese sentence line(s) until "Analysis".
      if (lines[i] !== "Sentence") {
        i += 1;
        continue;
      }
      i += 1;
      // Small furigana hints for specific words are emitted as their own
      // short line(s) BEFORE the real sentence line (confirmed: "うれ" then
      // blank then the full "マミピッグから嬉しいサプライズです。" line) —
      // the real sentence is always the LAST non-blank line in this range.
      const sentenceLines: string[] = [];
      while (i < lines.length && lines[i] !== "Analysis") {
        if (lines[i]) sentenceLines.push(lines[i]);
        i += 1;
      }
      const japanese = sentenceLines[sentenceLines.length - 1] ?? "";
      i += 1; // skip "Analysis"
      const analysisBullets: string[] = [];
      while (i < lines.length && !lines[i].startsWith("Translation:")) {
        if (lines[i].startsWith("•")) analysisBullets.push(lines[i].slice(1).trim());
        else if (lines[i] && analysisBullets.length > 0) {
          // continuation of the previous bullet (wrapped line)
          analysisBullets[analysisBullets.length - 1] += ` ${lines[i]}`;
        }
        i += 1;
      }
      let translation = "";
      if (i < lines.length && lines[i].startsWith("Translation:")) {
        translation = lines[i].slice("Translation:".length).trim();
        i += 1;
        // translation may wrap onto the next line(s) until a blank/new section
        while (i < lines.length && lines[i] && lines[i] !== "Sentence Analysis" && !/^\d+$/.test(lines[i])) {
          translation += ` ${lines[i]}`;
          i += 1;
        }
      }
      if (japanese && translation) {
        const entry: ExampleSentence = {
          id: nextId(),
          japanese,
          meanings: [{ en: translation.trim() }],
          notes: analysisBullets.length > 0 ? `Word/particle analysis: ${analysisBullets.join(" | ")}` : undefined,
          origin: "course",
          source: [{ file: fileName, page: pageIdx + 1 }],
        };
        examples.push(entry);
        newCount += 1;
      }
    }
  });

  saveOwnArray(examplesPath, examples);
  console.log(`${fileName}: ${newCount} new example sentences with analysis notes.`);
}

main();
