import type {
  ContentDataset,
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
} from "./types";

/**
 * Aggregates the extracted content dataset.
 *
 * Convention: each processed PDF/lesson contributes one JSON file per
 * category under src/data/<category>/<lessonId-or-topic>.json, containing
 * an array of entries of that category's type. This file auto-discovers
 * every such fragment via Vite's import.meta.glob, so extraction work never
 * requires touching this aggregator — dropping a new JSON file is enough.
 *
 * Lessons themselves live one-per-file under src/data/lessons/*.json.
 */

function flatten<T>(modules: Record<string, unknown>): T[] {
  return Object.values(modules).flatMap((mod) => {
    const data = (mod as { default?: unknown }).default ?? mod;
    // Most content files hold an array of entries; per-lesson files (one
    // Lesson object per file) hold a single object instead — accept both.
    if (Array.isArray(data)) return data as T[];
    return data ? [data as T] : [];
  });
}

const lessonModules = import.meta.glob("./lessons/*.json", { eager: true });
const kanjiModules = import.meta.glob("./kanji/*.json", { eager: true });
const vocabularyModules = import.meta.glob("./vocabulary/*.json", { eager: true });
const grammarModules = import.meta.glob("./grammar/*.json", { eager: true });
const numberModules = import.meta.glob("./numbers/*.json", { eager: true });
const kanaModules = import.meta.glob("./kana/*.json", { eager: true });
const conjugationModules = import.meta.glob("./conjugation/*.json", { eager: true });
const exampleModules = import.meta.glob("./examples/*.json", { eager: true });
const dialogueModules = import.meta.glob("./dialogues/*.json", { eager: true });
const noteModules = import.meta.glob("./notes/*.json", { eager: true });
const exerciseModules = import.meta.glob("./exercises/*.json", { eager: true });

export const dataset: ContentDataset = {
  lessons: flatten<Lesson>(lessonModules).sort((a, b) => a.order - b.order),
  kanji: flatten<KanjiEntry>(kanjiModules),
  vocabulary: flatten<VocabularyEntry>(vocabularyModules),
  grammar: flatten<GrammarEntry>(grammarModules),
  numbers: flatten<NumberEntry>(numberModules),
  kana: flatten<KanaEntry>(kanaModules),
  conjugationRules: flatten<ConjugationRule>(conjugationModules),
  examples: flatten<ExampleSentence>(exampleModules),
  dialogues: flatten<DialogueEntry>(dialogueModules),
  notes: flatten<NoteEntry>(noteModules),
  exercises: flatten<Exercise>(exerciseModules),
};

// Supplementary (JLPT reference) content is kept in its own tree and its
// own dataset export so the UI can always tell it apart from course content,
// per spec section 44 ("From your lesson" vs "Supplementary").
const supplementaryKanjiModules = import.meta.glob("./supplementary/kanji/*.json", { eager: true });
const supplementaryVocabularyModules = import.meta.glob("./supplementary/vocabulary/*.json", { eager: true });
const supplementaryGrammarModules = import.meta.glob("./supplementary/grammar/*.json", { eager: true });

export const supplementaryDataset = {
  kanji: flatten<KanjiEntry>(supplementaryKanjiModules),
  vocabulary: flatten<VocabularyEntry>(supplementaryVocabularyModules),
  grammar: flatten<GrammarEntry>(supplementaryGrammarModules),
};

export function findLesson(id: string): Lesson | undefined {
  return dataset.lessons.find((l) => l.id === id);
}
