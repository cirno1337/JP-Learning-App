import { readAllJson } from "../extract/lib/dataFiles";
import type {
  ConjugationRule,
  DialogueEntry,
  Exercise,
  ExampleSentence,
  GrammarEntry,
  KanaEntry,
  KanjiEntry,
  Lesson,
  NoteEntry,
  NumberEntry,
  VocabularyEntry,
} from "../../src/data/types";

/**
 * Validates the extracted content dataset (spec section 30). Run with
 * `npm run validate-content`. Exits non-zero (failing loudly, per spec) if
 * any check finds a problem.
 */

interface Issue {
  level: "error" | "warning";
  message: string;
}

const issues: Issue[] = [];
function error(message: string) {
  issues.push({ level: "error", message });
}
function warn(message: string) {
  issues.push({ level: "warning", message });
}

const lessons = readAllJson<Lesson>("src/data/lessons");
const kanji = readAllJson<KanjiEntry>("src/data/kanji");
const vocabulary = readAllJson<VocabularyEntry>("src/data/vocabulary");
const grammar = readAllJson<GrammarEntry>("src/data/grammar");
const numbers = readAllJson<NumberEntry>("src/data/numbers");
const kana = readAllJson<KanaEntry>("src/data/kana");
const conjugationRules = readAllJson<ConjugationRule>("src/data/conjugation");
const examples = readAllJson<ExampleSentence>("src/data/examples");
const dialogues = readAllJson<DialogueEntry>("src/data/dialogues");
const notes = readAllJson<NoteEntry>("src/data/notes");
const exercises = readAllJson<Exercise>("src/data/exercises");

const supplementaryKanji = readAllJson<KanjiEntry>("src/data/supplementary/kanji");
const supplementaryVocabulary = readAllJson<VocabularyEntry>("src/data/supplementary/vocabulary");
const supplementaryGrammar = readAllJson<GrammarEntry>("src/data/supplementary/grammar");

const lessonIds = new Set(lessons.map((l) => l.id));
const vocabIds = new Set(vocabulary.map((v) => v.id));
const exampleIds = new Set(examples.map((e) => e.id));

function checkDuplicateIds(name: string, items: { id: string }[]) {
  const seen = new Map<string, number>();
  for (const item of items) seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
  for (const [id, count] of seen) {
    if (count > 1) error(`Duplicate ${name} id "${id}" appears ${count} times.`);
  }
}

function checkLessonIds(name: string, items: { id: string; lessonIds: string[] }[]) {
  for (const item of items) {
    if (item.lessonIds.length === 0) {
      error(`${name} "${item.id}" has no lessonIds.`);
      continue;
    }
    for (const lid of item.lessonIds) {
      if (lessonIds.size > 0 && !lessonIds.has(lid)) {
        warn(`${name} "${item.id}" references unknown lesson "${lid}" (no lesson file defines it yet).`);
      }
    }
  }
}

function checkSourceRefs(name: string, items: { id: string; source: { file: string; page?: number }[] }[]) {
  for (const item of items) {
    if (!item.source || item.source.length === 0) {
      error(`${name} "${item.id}" has no source reference.`);
      continue;
    }
    for (const ref of item.source) {
      if (!ref.file || ref.file.trim() === "") {
        error(`${name} "${item.id}" has a source reference with an empty file name.`);
      }
      if (ref.page !== undefined && (!Number.isInteger(ref.page) || ref.page < 1)) {
        error(`${name} "${item.id}" has an invalid page number: ${ref.page}.`);
      }
    }
  }
}

function checkMeanings(name: string, items: { id: string; meanings: { en?: string; pl?: string }[] }[]) {
  for (const item of items) {
    if (!item.meanings || item.meanings.length === 0) {
      error(`${name} "${item.id}" has no meanings.`);
      continue;
    }
    for (const m of item.meanings) {
      if (!m.en?.trim() && !m.pl?.trim()) {
        error(`${name} "${item.id}" has a meaning entry with neither English nor Polish text.`);
      }
    }
  }
}

// --- Kanji ---
checkDuplicateIds("kanji", kanji);
checkLessonIds("kanji", kanji);
checkSourceRefs("kanji", kanji);
checkMeanings("kanji", kanji);
for (const k of kanji) {
  if (!k.character || Array.from(k.character).length !== 1) {
    error(`Kanji "${k.id}" has an invalid character field: "${k.character}".`);
  }
  for (const vid of k.vocabularyIds ?? []) {
    if (!vocabIds.has(vid)) error(`Kanji "${k.id}" references missing vocabulary id "${vid}".`);
  }
}
const kanjiCharCounts = new Map<string, string[]>();
for (const k of kanji) {
  kanjiCharCounts.set(k.character, [...(kanjiCharCounts.get(k.character) ?? []), k.id]);
}
for (const [char, ids] of kanjiCharCounts) {
  if (ids.length > 1) error(`Kanji character "${char}" appears in multiple entries: ${ids.join(", ")}.`);
}

// --- Vocabulary ---
checkDuplicateIds("vocabulary", vocabulary);
checkLessonIds("vocabulary", vocabulary);
checkSourceRefs("vocabulary", vocabulary);
checkMeanings("vocabulary", vocabulary);
for (const v of vocabulary) {
  if (!v.kana || !v.kana.trim()) error(`Vocabulary "${v.id}" has an empty kana field.`);
  for (const eid of v.exampleSentenceIds ?? []) {
    if (!exampleIds.has(eid)) error(`Vocabulary "${v.id}" references missing example sentence id "${eid}".`);
  }
}
const vocabKeyCounts = new Map<string, string[]>();
for (const v of vocabulary) {
  const key = `${v.kanji ?? ""}|${v.kana}`;
  vocabKeyCounts.set(key, [...(vocabKeyCounts.get(key) ?? []), v.id]);
}
for (const [key, ids] of vocabKeyCounts) {
  if (ids.length > 1) error(`Duplicate vocabulary (kanji|kana="${key}") across entries: ${ids.join(", ")}.`);
}

// --- Grammar ---
checkDuplicateIds("grammar", grammar);
checkLessonIds("grammar", grammar);
checkSourceRefs("grammar", grammar);
for (const g of grammar) {
  if (!g.pattern?.trim()) error(`Grammar "${g.id}" has an empty pattern.`);
  if (g.origin === "course" && g.examples.length === 0) {
    warn(`Grammar "${g.id}" (course-origin) has no example sentences.`);
  }
}

// --- Numbers ---
checkDuplicateIds("numbers", numbers);
checkLessonIds("numbers", numbers);
checkSourceRefs("numbers", numbers);
for (const n of numbers) {
  if (!n.japanese?.trim()) error(`Number "${n.id}" has an empty japanese field.`);
}

// --- Kana ---
checkDuplicateIds("kana", kana);
for (const k of kana) {
  if (!k.character?.trim() || !k.romaji?.trim()) error(`Kana "${k.id}" is missing character or romaji.`);
}

// --- Conjugation rules ---
checkDuplicateIds("conjugation rule", conjugationRules);
for (const r of conjugationRules) {
  if (r.examples.length === 0) error(`Conjugation rule "${r.id}" has no examples.`);
  for (const ex of r.examples) {
    if (!ex.surface?.trim()) error(`Conjugation rule "${r.id}" has an example with an empty surface form.`);
  }
}

// --- Examples ---
checkDuplicateIds("example sentence", examples);
checkSourceRefs("example sentence", examples);
for (const e of examples) {
  if (!e.japanese?.trim()) error(`Example sentence "${e.id}" has an empty japanese field.`);
}

// --- Dialogues ---
checkDuplicateIds("dialogue", dialogues);
for (const d of dialogues) {
  if (d.lines.length === 0) error(`Dialogue "${d.id}" has no lines.`);
}

// --- Notes ---
checkDuplicateIds("note", notes);
checkLessonIds("note", notes);

// --- Exercises ---
checkDuplicateIds("exercise", exercises);
checkLessonIds("exercise", exercises);
for (const ex of exercises) {
  if (ex.acceptedAnswers.length === 0) error(`Exercise "${ex.id}" has no acceptedAnswers.`);
  if (ex.origin === "generated" && (!ex.generatedFrom || ex.generatedFrom.length === 0)) {
    error(`Generated exercise "${ex.id}" is missing generatedFrom provenance.`);
  }
}

// --- Lessons ---
checkDuplicateIds("lesson", lessons);
for (const l of lessons) {
  const seenSections = new Set<string>();
  for (const s of l.sections) {
    if (seenSections.has(s.id)) error(`Lesson "${l.id}" has duplicate section id "${s.id}".`);
    seenSections.add(s.id);
  }
}

// --- Supplementary (external reference) content — kept fully separate from course data, see spec section 44 ---
checkDuplicateIds("supplementary kanji", supplementaryKanji);
checkSourceRefs("supplementary kanji", supplementaryKanji);
checkMeanings("supplementary kanji", supplementaryKanji);
for (const k of supplementaryKanji) {
  if (k.origin !== "supplementary") error(`Supplementary kanji "${k.id}" must have origin "supplementary", got "${k.origin}".`);
  if (!k.character || Array.from(k.character).length !== 1) {
    error(`Supplementary kanji "${k.id}" has an invalid character field: "${k.character}".`);
  }
}
const suppKanjiCharCounts = new Map<string, string[]>();
for (const k of supplementaryKanji) {
  suppKanjiCharCounts.set(k.character, [...(suppKanjiCharCounts.get(k.character) ?? []), k.id]);
}
for (const [char, ids] of suppKanjiCharCounts) {
  if (ids.length > 1) error(`Supplementary kanji character "${char}" appears in multiple entries: ${ids.join(", ")}.`);
}

checkDuplicateIds("supplementary vocabulary", supplementaryVocabulary);
checkSourceRefs("supplementary vocabulary", supplementaryVocabulary);
checkMeanings("supplementary vocabulary", supplementaryVocabulary);
for (const v of supplementaryVocabulary) {
  if (v.origin !== "supplementary") error(`Supplementary vocabulary "${v.id}" must have origin "supplementary", got "${v.origin}".`);
  if (!v.kana || !v.kana.trim()) error(`Supplementary vocabulary "${v.id}" has an empty kana field.`);
}

checkDuplicateIds("supplementary grammar", supplementaryGrammar);
checkSourceRefs("supplementary grammar", supplementaryGrammar);
for (const g of supplementaryGrammar) {
  if (g.origin !== "supplementary") error(`Supplementary grammar "${g.id}" must have origin "supplementary", got "${g.origin}".`);
  if (!g.pattern?.trim()) error(`Supplementary grammar "${g.id}" has an empty pattern.`);
}

// --- Cross-cutting: orphaned kanji/vocab (not referenced by any lesson section, once lessons exist) ---
if (lessons.length > 0) {
  const referencedItemIds = new Set(lessons.flatMap((l) => l.sections.flatMap((s) => s.itemIds)));
  for (const k of kanji) {
    if (!referencedItemIds.has(k.id)) warn(`Kanji "${k.id}" is not referenced by any lesson section.`);
  }
  for (const v of vocabulary) {
    if (!referencedItemIds.has(v.id)) warn(`Vocabulary "${v.id}" is not referenced by any lesson section.`);
  }
}

// --- Report ---
const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");

console.log(
  `Validated: ${lessons.length} lessons, ${kanji.length} kanji, ${vocabulary.length} vocabulary, ` +
    `${grammar.length} grammar, ${numbers.length} numbers, ${kana.length} kana, ` +
    `${conjugationRules.length} conjugation rules, ${examples.length} examples, ` +
    `${dialogues.length} dialogues, ${notes.length} notes, ${exercises.length} exercises. ` +
    `Supplementary: ${supplementaryKanji.length} kanji, ${supplementaryVocabulary.length} vocabulary, ` +
    `${supplementaryGrammar.length} grammar.`,
);

if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  - ${w.message}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e.message}`);
  console.error("\nContent validation FAILED.");
  process.exit(1);
}

console.log("\nContent validation passed.");
