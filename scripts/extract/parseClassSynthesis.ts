import { writeFileSync } from "node:fs";
import { extractLayoutPages } from "./lib/pdftext";
import { writeJson } from "./lib/dataFiles";
import {
  loadOwnArray,
  saveOwnArray,
  makeIdSequencer,
  loadCrossLessonIndex,
  writeDirtyExternalFiles,
  mergeMeaning,
} from "./lib/lessonFile";
import type { ExampleSentence, NoteEntry, PartOfSpeech, SourceReference, VocabularyEntry } from "../../src/data/types";

/**
 * Extracts the mechanical, highly-regular parts of a
 * "Class N°xx - synthesis & assignments.pdf" document:
 *
 * - VOCABULARY tables: "word   reading-or-/   meaning" (layout-mode columns)
 * - BUILT SENTENCES: "• japanese" / "『reading』" / "= meaning" triples
 * - VERBS/ADJECTIVES OF THE WEEK word lists: "word 『reading』   meaning"
 *
 * Each is only pattern-matched while inside its own named section (a
 * small state machine, not a global scan) because grammar-topic headers
 * are named after whatever pattern is taught that week ("BECAUSE", "CAN /
 * BE ABLE TO", ...) and cannot be enumerated up front, and their
 * conjugation/particle tables can otherwise coincidentally match the
 * vocab/word-list patterns — an earlier uniform-scan version of this
 * parser produced garbage like "root / (Negation) = ending (Polite)" from
 * a conjugation table before this was tightened. Whatever falls outside
 * the four known sections (VOCABULARY, BUILT SENTENCES, VERBS OF THE WEEK,
 * ADJECTIVES OF THE WEEK) is written to
 * scripts/extract/.cache/<lessonId>-remainder.txt for manual review —
 * never silently dropped.
 *
 * The vocabulary output file is shared with parseKanjiSet.ts for the same
 * lessonId — see lib/lessonFile.ts for why it's loaded and saved as one
 * live array rather than a separate "new items" list.
 *
 * Usage: tsx scripts/extract/parseClassSynthesis.ts <pdf> <lessonId>
 */

const NOISE_LINES = new Set(["SYNTHESIS", "VOCABULARY", "BUILT SENTENCES", "ASSIGNMENTS", "BONUS"]);
const NOISE_PATTERNS = [
  /^The Japanese Summer Challenge$/,
  /^CLASS N°\d+$/,
  /^Synthesis & Assignments$/,
  /^\d{1,2}(st|nd|rd|th) .+ by Black Moon$/,
  /^\d{1,2}$/,
];

const VOCAB_ROW = /^(\S.*?\S|\S)\s{2,}(\S+|\/)\s{2,}(\S.*)$/u;
const WEEK_ITEM = /^(\S+)\s+『([^』]+)』\s+(.+)$/u;

interface RawLine {
  text: string;
  page: number;
}

function collectLines(pages: string[]): RawLine[] {
  const lines: RawLine[] = [];
  pages.forEach((pageText, idx) => {
    for (const raw of pageText.split("\n")) {
      const text = raw.trim();
      if (text) lines.push({ text, page: idx + 1 });
    }
  });
  return lines;
}

function isNoise(text: string): boolean {
  if (NOISE_LINES.has(text)) return true;
  return NOISE_PATTERNS.some((re) => re.test(text));
}

const POS_LABELS: Record<string, PartOfSpeech> = {
  "GODAN VERBS": "verb-godan",
  "ICHIDAN VERBS": "verb-ichidan",
  "VERBS WITH SURU": "verb-irregular",
  "I-ADJECTIVES": "i-adjective",
  "I- ADJECTIVES": "i-adjective",
  "NA-ADJECTIVES": "na-adjective",
  "NA- ADJECTIVES": "na-adjective",
  "NO-ADJECTIVES": "no-adjective",
  "NO- ADJECTIVES": "no-adjective",
};

function main() {
  const [pdfPath, lessonId] = process.argv.slice(2);
  if (!pdfPath || !lessonId) {
    console.error("Usage: tsx scripts/extract/parseClassSynthesis.ts <pdf> <lessonId>");
    process.exit(1);
  }
  const fileName = pdfPath.split("/").pop()!;
  const pages = extractLayoutPages(pdfPath);
  const lines = collectLines(pages);

  const boundaryIdx = lines.findIndex((l) => l.text === "ASSIGNMENTS");
  const contentLines = boundaryIdx === -1 ? lines : lines.slice(0, boundaryIdx);
  const tailLines = boundaryIdx === -1 ? [] : lines.slice(boundaryIdx);

  const vocabDir = "src/data/vocabulary";
  const examplesDir = "src/data/examples";
  const ownVocabPath = `${vocabDir}/${lessonId}.json`;
  const ownExamplesPath = `${examplesDir}/${lessonId}.json`;

  const ownVocab = loadOwnArray<VocabularyEntry>(ownVocabPath);
  const ownExamples = loadOwnArray<ExampleSentence>(ownExamplesPath);
  const nextVocabId = makeIdSequencer(ownVocab, `${lessonId}-vocab-`);
  const nextExampleId = makeIdSequencer(ownExamples, `${lessonId}-example-`);
  const vocabByKey = loadCrossLessonIndex<VocabularyEntry>(
    vocabDir,
    ownVocabPath,
    ownVocab,
    (v) => `${v.kanji ?? ""}|${v.kana}`,
  );
  const dirtyVocabFiles = new Set<string>();

  let newVocabCount = 0;
  let newExampleCount = 0;
  const remainder: RawLine[] = [];
  let currentLabel: string | null = null;
  let currentWeekLabel: string | null = null;
  let currentPos: PartOfSpeech | undefined;

  function addVocab(
    word: string,
    reading: string,
    meaning: string,
    page: number,
    label: string | null,
    pos?: PartOfSpeech,
  ) {
    // Normally "word" is the kanji/primary form and "reading" is kana. But
    // the VERBS/ADJECTIVES OF THE WEEK 『...』 bracket sometimes holds an
    // alternate KANJI spelling instead of a reading, for words the course
    // teaches primarily in kana (confirmed: "あげる 『上げる』" — あげる has
    // no kanji of its own, 上げる does) — detect and swap rather than
    // recording あげる as if it were the kanji field.
    const hasKanji = (s: string) => /[一-鿿]/.test(s);
    let kanji: string | undefined;
    let kana: string;
    if (reading === "/" || word === reading) {
      kana = word;
    } else if (!hasKanji(word) && hasKanji(reading)) {
      kana = word;
      kanji = reading;
    } else {
      kanji = word;
      kana = reading;
    }
    const key = `${kanji ?? ""}|${kana}`;
    const source: SourceReference = { file: fileName, page };
    const existing = vocabByKey.byKey.get(key);
    if (existing) {
      if (!existing.entry.lessonIds.includes(lessonId)) existing.entry.lessonIds.push(lessonId);
      if (!existing.entry.source.some((s) => s.file === source.file && s.page === source.page)) {
        existing.entry.source.push(source);
      }
      mergeMeaning(existing.entry, meaning);
      dirtyVocabFiles.add(existing.file);
      return;
    }
    const entry: VocabularyEntry = {
      id: nextVocabId(),
      kanji,
      kana,
      meanings: [{ en: meaning }],
      ...(pos ? { partOfSpeech: [pos] } : {}),
      lessonIds: [lessonId],
      origin: "course",
      source: [source],
      ...(label ? { notes: `Category: ${label}` } : {}),
    };
    ownVocab.push(entry);
    newVocabCount += 1;
    vocabByKey.byKey.set(key, { entry, file: ownVocabPath });
  }

  type Mode = "none" | "vocab" | "sentences" | "week-items" | "other";
  let mode: Mode = "none";
  const isCapsHeader = (t: string) => /^[A-Z][A-Z &/’()0-9-]{1,40}$/.test(t);
  const nextNonBlank = (from: number) => contentLines[from];

  let i = 0;
  while (i < contentLines.length) {
    const line = contentLines[i];
    if (isNoise(line.text)) {
      if (line.text === "VOCABULARY") mode = "vocab";
      if (line.text === "BUILT SENTENCES") mode = "sentences";
      i += 1;
      continue;
    }

    if (line.text === "VERBS OF THE WEEK" || line.text === "ADJECTIVES OF THE WEEK") {
      mode = "week-items";
      currentPos = undefined;
      currentWeekLabel = null;
      i += 1;
      continue;
    }

    if (mode === "sentences" && line.text.startsWith("•")) {
      const jp = line.text.slice(1).trim();
      const readingLine = contentLines[i + 1];
      const meaningLine = contentLines[i + 2];
      if (readingLine && /^『.*』$/.test(readingLine.text) && meaningLine && meaningLine.text.startsWith("=")) {
        const entry: ExampleSentence = {
          id: nextExampleId(),
          japanese: jp,
          reading: readingLine.text.slice(1, -1),
          meanings: [{ en: meaningLine.text.slice(1).trim() }],
          origin: "course",
          source: [{ file: fileName, page: line.page }],
        };
        ownExamples.push(entry);
        newExampleCount += 1;
        i += 3;
        continue;
      }
    }

    if (mode === "week-items") {
      const weekMatch = WEEK_ITEM.exec(line.text);
      if (weekMatch) {
        const [, word, reading, meaning] = weekMatch;
        addVocab(word, reading, meaning, line.page, currentWeekLabel, currentPos);
        i += 1;
        continue;
      }
      if (isCapsHeader(line.text) && line.text in POS_LABELS) {
        currentPos = POS_LABELS[line.text];
        currentWeekLabel = line.text;
        i += 1;
        continue;
      }
      // Unrecognised line while expecting a word list — peek ahead: a real
      // (if unknown) sub-label is followed by another matching item.
      if (isCapsHeader(line.text)) {
        const peek = nextNonBlank(i + 1);
        if (peek && WEEK_ITEM.test(peek.text)) {
          currentPos = undefined;
          currentWeekLabel = line.text;
          i += 1;
          continue;
        }
      }
      mode = "other";
      remainder.push(line);
      i += 1;
      continue;
    }

    if (mode === "vocab") {
      const vocabMatch = VOCAB_ROW.exec(line.text);
      if (vocabMatch) {
        const [, word, reading, meaning] = vocabMatch;
        addVocab(word, reading, meaning, line.page, currentLabel);
        i += 1;
        continue;
      }
      if (isCapsHeader(line.text)) {
        const peek = nextNonBlank(i + 1);
        if (peek && VOCAB_ROW.test(peek.text)) {
          currentLabel = line.text;
          i += 1;
          continue;
        }
      }
      mode = "other";
      remainder.push(line);
      i += 1;
      continue;
    }

    // mode "none" or "other": not currently inside a known mechanical
    // section. Re-enter one only via its exact header (handled above);
    // everything else is recorded for manual review.
    remainder.push(line);
    i += 1;
  }

  // Notes from the tail (assignments + bonus) — same shape as the kanji-set parser.
  const notes: NoteEntry[] = [];
  const bonusIdx = tailLines.findIndex((l) => l.text === "BONUS");
  const assignmentLines = (bonusIdx === -1 ? tailLines : tailLines.slice(0, bonusIdx)).filter(
    (l) => !isNoise(l.text) && l.text !== "Assignments are never mandatory but highly recommended. Do",
  );
  const meaningfulAssignments = assignmentLines.map((l) => l.text).filter((t) => t.length > 3 && !/^\d+$/.test(t));
  if (meaningfulAssignments.length > 0) {
    notes.push({
      id: `${lessonId}-note-assignments`,
      kind: "teacher-note",
      text: [{ en: meaningfulAssignments.join(" / ") }],
      lessonIds: [lessonId],
      origin: "course",
      source: [{ file: fileName, note: "Assignments section" }],
    });
  }
  if (bonusIdx !== -1) {
    const bonusText = tailLines
      .slice(bonusIdx + 1)
      .map((l) => l.text)
      .filter((t) => t !== "BONUS")
      .join("\n");
    if (bonusText.trim()) {
      notes.push({
        id: `${lessonId}-note-bonus`,
        kind: "useful-link",
        text: [{ en: bonusText }],
        lessonIds: [lessonId],
        origin: "course",
        source: [{ file: fileName, note: "Bonus section" }],
      });
    }
  }

  writeDirtyExternalFiles(vocabByKey, dirtyVocabFiles);
  saveOwnArray(ownVocabPath, ownVocab);
  saveOwnArray(ownExamplesPath, ownExamples);
  if (notes.length > 0) writeJson(`src/data/notes/${lessonId}-class.json`, notes);

  const remainderPath = `scripts/extract/.cache/${lessonId}-remainder.txt`;
  writeFileSync(remainderPath, remainder.map((l) => `p.${l.page}: ${l.text}`).join("\n") + "\n", "utf8");

  console.log(
    `${lessonId}: ${newVocabCount} new vocab, ${newExampleCount} new examples, ${notes.length} notes. ` +
      `${remainder.length} unclassified line(s) written to ${remainderPath} for manual review.`,
  );
}

main();
