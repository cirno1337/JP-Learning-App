import { existsSync, readFileSync } from "node:fs";
import { writeJson } from "./lib/dataFiles";
import type { DialogueEntry, ExampleSentence, GrammarEntry, KanaEntry, KanjiEntry, Lesson, NumberEntry, VocabularyEntry } from "../../src/data/types";

/**
 * Creates or updates the "kanji" / "vocabulary" / "examples" sections of
 * each class-01..10 Lesson record from its extracted content files.
 * Lessons are built up incrementally as more content types (grammar,
 * numbers, ...) get extracted for the same lesson — this script only ever
 * touches the sections it owns, leaving any others already present
 * untouched. Safe to re-run any time after (re-)processing a lesson's PDFs.
 */

const LESSON_TITLES: Record<string, string> = {
  "class-a": "Class A",
  "class-b": "Class B",
  "extra-practice": "Extra Practice",
  "class-01": "Class N°01",
  "class-02": "Class N°02",
  "class-03": "Class N°03",
  "class-04": "Class N°04",
  "class-05": "Class N°05",
  "class-06": "Class N°06",
  "class-07": "Class N°07",
  "class-08": "Class N°08",
  "class-09": "Class N°09",
  "class-10": "Class N°10",
};
const LESSON_ORDER: Record<string, number> = {
  "class-a": 0,
  "class-b": 1,
  "class-01": 2,
  "class-02": 3,
  "class-03": 4,
  "class-04": 5,
  "class-05": 6,
  "class-06": 7,
  "class-07": 8,
  "class-08": 9,
  "class-09": 10,
  "class-10": 11,
};

function loadLesson(lessonId: string): Lesson {
  const path = `src/data/lessons/${lessonId}.json`;
  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, "utf8"));
  }
  return {
    id: lessonId,
    order: LESSON_ORDER[lessonId] ?? 999,
    title: [{ en: LESSON_TITLES[lessonId] ?? lessonId }],
    sourceFiles: [],
    sections: [],
  };
}

function upsertSection(lesson: Lesson, section: Lesson["sections"][number]) {
  const idx = lesson.sections.findIndex((s) => s.id === section.id);
  if (idx >= 0) lesson.sections[idx] = section;
  else lesson.sections.push(section);
}

function addSourceFile(lesson: Lesson, file: string) {
  if (!lesson.sourceFiles.some((s) => s.file === file)) lesson.sourceFiles.push({ file });
}

/** The "... synthesis & assignments.pdf" filename for a given lessonId, matching each doc's actual naming convention. */
function synthesisFileName(lessonId: string): string {
  if (lessonId === "class-a") return "Class A - synthesis & assignments.pdf";
  if (lessonId === "class-b") return "Class B - synthesis & assignments.pdf";
  const num = lessonId.split("-")[1];
  return `Class N°${num} - synthesis & assignments.pdf`;
}

/** The big slide-deck filename — the ONLY source for class-01/02 (no synthesis doc exists for those two). */
function classDeckFileName(lessonId: string): string | null {
  if (lessonId !== "class-01" && lessonId !== "class-02") return null;
  const num = lessonId.split("-")[1];
  return `CLASS N°${num} — The Japanese Summer Challenge.pdf`;
}

for (const lessonId of Object.keys(LESSON_TITLES)) {
  const kanjiPath = `src/data/kanji/${lessonId}.json`;
  const vocabPath = `src/data/vocabulary/${lessonId}.json`;
  const examplesPath = `src/data/examples/${lessonId}.json`;
  if (!existsSync(kanjiPath) && !existsSync(vocabPath) && !existsSync(examplesPath)) continue;

  const lesson = loadLesson(lessonId);
  const counts: string[] = [];
  const num = lessonId.split("-")[1];

  if (existsSync(kanjiPath)) {
    const kanjiEntries: KanjiEntry[] = JSON.parse(readFileSync(kanjiPath, "utf8"));
    upsertSection(lesson, {
      id: `${lessonId}-section-kanji`,
      title: [{ en: "Kanji" }],
      kind: "kanji",
      itemIds: kanjiEntries.map((k) => k.id),
    });
    addSourceFile(lesson, `KANJI - SET N°${num} - synthesis & assignments.pdf`);
    counts.push(`${kanjiEntries.length} kanji`);
  }

  let sawClassSynthesisFile = false;
  if (existsSync(vocabPath)) {
    // This file holds exactly the vocab entries first introduced in this
    // lesson (cross-lesson reuse of an earlier word updates the earlier
    // lesson's file in place rather than duplicating it here — see
    // parseKanjiSet.ts / parseClassSynthesis.ts's dedup logic).
    const vocabEntries: VocabularyEntry[] = JSON.parse(readFileSync(vocabPath, "utf8"));
    upsertSection(lesson, {
      id: `${lessonId}-section-vocabulary`,
      title: [{ en: "Vocabulary" }],
      kind: "vocabulary",
      itemIds: vocabEntries.map((v) => v.id),
    });
    counts.push(`${vocabEntries.length} vocab`);
    // Not every lesson has a "Class N°xx"/"Class A/B" synthesis doc (01/02
    // don't), so only claim it as a source when some entry actually came from it.
    const synthesisFile = synthesisFileName(lessonId);
    sawClassSynthesisFile = vocabEntries.some((v) => v.source.some((s) => s.file === synthesisFile));
    const deckFile = classDeckFileName(lessonId);
    if (deckFile && vocabEntries.some((v) => v.source.some((s) => s.file === deckFile))) {
      addSourceFile(lesson, deckFile);
    }
  }

  if (existsSync(examplesPath)) {
    const exampleEntries: ExampleSentence[] = JSON.parse(readFileSync(examplesPath, "utf8"));
    if (exampleEntries.length > 0) {
      upsertSection(lesson, {
        id: `${lessonId}-section-examples`,
        title: [{ en: "Example sentences" }],
        kind: "examples",
        itemIds: exampleEntries.map((e) => e.id),
      });
      counts.push(`${exampleEntries.length} examples`);
    }
  }

  const grammarPath = `src/data/grammar/${lessonId}.json`;
  if (existsSync(grammarPath)) {
    const grammarEntries: GrammarEntry[] = JSON.parse(readFileSync(grammarPath, "utf8"));
    if (grammarEntries.length > 0) {
      upsertSection(lesson, {
        id: `${lessonId}-section-grammar`,
        title: [{ en: "Grammar" }],
        kind: "grammar",
        itemIds: grammarEntries.map((g) => g.id),
      });
      counts.push(`${grammarEntries.length} grammar`);
    }
  }

  const dialoguesPath = `src/data/dialogues/${lessonId}.json`;
  if (existsSync(dialoguesPath)) {
    const dialogueEntries: DialogueEntry[] = JSON.parse(readFileSync(dialoguesPath, "utf8"));
    if (dialogueEntries.length > 0) {
      upsertSection(lesson, {
        id: `${lessonId}-section-dialogue`,
        title: [{ en: "Dialogue / reading" }],
        kind: "dialogue",
        itemIds: dialogueEntries.map((d) => d.id),
      });
      counts.push(`${dialogueEntries.length} dialogues`);
    }
  }

  const numbersPath = `src/data/numbers/${lessonId}.json`;
  if (existsSync(numbersPath)) {
    const numberEntries: NumberEntry[] = JSON.parse(readFileSync(numbersPath, "utf8"));
    if (numberEntries.length > 0) {
      upsertSection(lesson, {
        id: `${lessonId}-section-numbers`,
        title: [{ en: "Numbers & Counters" }],
        kind: "numbers",
        itemIds: numberEntries.map((n) => n.id),
      });
      counts.push(`${numberEntries.length} numbers`);
    }
  }

  if (sawClassSynthesisFile) {
    addSourceFile(lesson, synthesisFileName(lessonId));
  }

  const kanaPath = `src/data/kana/${lessonId}.json`;
  if (existsSync(kanaPath)) {
    const kanaEntries: KanaEntry[] = JSON.parse(readFileSync(kanaPath, "utf8"));
    if (kanaEntries.length > 0) {
      upsertSection(lesson, {
        id: `${lessonId}-section-kana`,
        title: [{ en: "Kana" }],
        kind: "kana",
        itemIds: kanaEntries.map((k) => k.id),
      });
      counts.push(`${kanaEntries.length} kana`);
    }
  }

  writeJson(`src/data/lessons/${lessonId}.json`, lesson);
  console.log(`${lessonId}: ${counts.join(", ")}.`);
}
