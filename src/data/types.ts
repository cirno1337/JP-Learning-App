/**
 * Content data schema.
 *
 * This is the contract between the PDF extraction pipeline (scripts/extract)
 * and the application. Extraction output must conform to these types;
 * scripts/validate/validate-content.ts checks that at build/dev time.
 *
 * Design principles (see Japanese_A2_App_Claude_Instructions.md):
 * - Every extracted item keeps provenance back to its source PDF/page.
 * - Course-original content and externally-sourced/generated content are
 *   always distinguishable via `origin`.
 * - Canonical items (kanji/vocabulary/grammar) are associated with lessons
 *   via id lists rather than being duplicated per lesson.
 */

/** Where a piece of content ultimately comes from. */
export type ContentOrigin =
  /** Directly transcribed from one of the course PDFs. */
  | "course"
  /** From an external reference source (e.g. JLPT Sensei lists), not the course itself. */
  | "supplementary"
  /** Produced by the extraction/app tooling from course data (e.g. a generated quiz question). */
  | "generated";

export interface SourceReference {
  /** Exact PDF filename as it appears in the project root. */
  file: string;
  /** 1-indexed page number within that PDF, when known. */
  page?: number;
  /** Free-text pointer when a page number alone isn't precise enough (e.g. "table row 4"). */
  note?: string;
}

/** Text that may exist in English and/or Polish, with provenance of the translation itself. */
export interface LocalizedText {
  en?: string;
  pl?: string;
  /**
   * True if this specific translation was NOT present in the source material
   * and was added by the extraction/app tooling (e.g. a Polish gloss added
   * because only English was in the PDF). Absence/false means "as given by
   * the source" for the languages present.
   */
  translated?: boolean;
}

export type UncertaintyLevel = "none" | "low" | "medium" | "high";

/** Attached to any extracted field/item whose reading is uncertain (OCR/layout ambiguity, etc). */
export interface Uncertainty {
  level: UncertaintyLevel;
  reason: string;
}

export type PartOfSpeech =
  | "noun"
  | "pronoun"
  | "proper-noun"
  | "verb-godan"
  | "verb-ichidan"
  | "verb-irregular"
  | "i-adjective"
  | "na-adjective"
  | "no-adjective"
  | "adverb"
  | "particle"
  | "counter"
  | "conjunction"
  | "interjection"
  | "expression"
  | "other";

export interface ExampleSentence {
  id: string;
  japanese: string;
  /** Kana/phonetic reading line as given by the source, if present (may use phonetic は→わ, を→お per this course's convention). */
  reading?: string;
  meanings: LocalizedText[];
  notes?: string;
  origin: ContentOrigin;
  source: SourceReference[];
  uncertainty?: Uncertainty;
}

export interface KanjiEntry {
  id: string;
  character: string;
  meanings: LocalizedText[];
  /**
   * Readings as given by the course material, which does not distinguish
   * on'yomi from kun'yomi (see docs/source-inventory.md). Prefer this field
   * for course-origin kanji; use onyomi/kunyomi below only when the source
   * explicitly makes that distinction (e.g. supplementary JLPT reference data).
   */
  readings?: string[];
  onyomi?: string[];
  kunyomi?: string[];
  /** Vocabulary entry ids that were taught alongside this kanji as examples. */
  vocabularyIds?: string[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
  uncertainty?: Uncertainty;
  notes?: string;
}

/** A word may have more than one attested written form (e.g. kanji vs kana-only, or two kanji variants). */
export interface WordSpelling {
  /** Full written form as it appears in the source (kanji+kana, or kana-only). */
  text: string;
  /** True if this is the form normally used in kana only. */
  kanaOnly?: boolean;
}

export interface VocabularyEntry {
  id: string;
  /** Primary written form shown to the learner (kanji if available, else kana). */
  kanji?: string;
  /** Reading in kana. Always present. */
  kana: string;
  /** Alternate attested spellings beyond the primary kanji/kana pair. */
  alternateSpellings?: WordSpelling[];
  meanings: LocalizedText[];
  partOfSpeech?: PartOfSpeech[];
  exampleSentenceIds?: string[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
  uncertainty?: Uncertainty;
  notes?: string;
}

export type ConjugationForm =
  | "dictionary"
  | "masu"
  | "masu-negative"
  | "masu-past"
  | "masu-past-negative"
  | "te"
  | "ta"
  | "nai"
  | "nakatta"
  | "plain-past"
  | "plain-negative"
  | "plain-past-negative"
  | "tai"
  | "i-adjective-negative"
  | "i-adjective-past"
  | "i-adjective-past-negative"
  | "i-adjective-adverb"
  | "i-adjective-te"
  | "na-adjective-negative"
  | "na-adjective-past"
  | "na-adjective-past-negative"
  | "imperative"
  | "imperative-negative"
  | "imperative-te"
  | "imperative-negative-polite"
  | "volitional-casual"
  | "volitional-polite";

export interface ConjugationExample {
  form: ConjugationForm;
  surface: string;
  reading?: string;
}

/** A conjugation/declension pattern actually taught in the course (drives the conjugation engine). */
export interface ConjugationRule {
  id: string;
  appliesTo: "verb-godan" | "verb-ichidan" | "verb-irregular" | "i-adjective" | "na-adjective";
  form: ConjugationForm;
  /** Human explanation of the rule as taught, kept close to the source wording. */
  explanation: LocalizedText[];
  examples: ConjugationExample[];
  exceptions?: string[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
}

export interface ParticleUsage {
  particle: string;
  meaning: LocalizedText[];
  exampleSentenceId?: string;
}

export interface GrammarEntry {
  id: string;
  /** Short label for the pattern, e.g. "たい (want to)" or "て form". */
  pattern: string;
  explanation: LocalizedText[];
  examples: ExampleSentence[];
  particles?: ParticleUsage[];
  relatedConjugationRuleIds?: string[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
  uncertainty?: Uncertainty;
}

export type NumberCategory =
  | "cardinal"
  | "date-month"
  | "date-day-of-month"
  | "day-of-week"
  | "time"
  | "price"
  | "age"
  | "counter-people"
  | "counter-objects"
  | "counter-animals"
  | "counter-flat-objects"
  | "counter-vehicles-devices"
  | "counter-long-objects"
  | "counter-liquid-containers"
  | "counter-books"
  | "counter-occurrences"
  | "counter-ordinal"
  | "counter-other";

export interface NumberEntry {
  id: string;
  category: NumberCategory;
  value?: number;
  japanese: string;
  reading?: string;
  counter?: string;
  /** True where the reading is irregular relative to the general pattern (called out explicitly for the learner). */
  irregular?: boolean;
  notes?: LocalizedText[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
}

export type KanaChart = "hiragana" | "katakana";

export interface KanaEntry {
  id: string;
  character: string;
  chart: KanaChart;
  romaji: string;
  /** Base kana this is a variant of (dakuten/handakuten/small form), if any. */
  baseCharacterId?: string;
  variantType?: "dakuten" | "handakuten" | "small" | "digraph" | "base";
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
}

/** A chunk of miscellaneous but useful lesson content that doesn't fit the typed categories. */
export interface NoteEntry {
  id: string;
  kind:
    | "teacher-note"
    | "cultural-note"
    | "mnemonic"
    | "common-mistake"
    | "exception"
    | "useful-link"
    | "other";
  text: LocalizedText[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
}

export interface DialogueLine {
  speaker?: string;
  japanese: string;
  reading?: string;
  meanings?: LocalizedText[];
}

export interface DialogueEntry {
  id: string;
  title?: string;
  lines: DialogueLine[];
  lessonIds: string[];
  origin: ContentOrigin;
  source: SourceReference[];
}

export type ExerciseKind =
  | "vocab-gap-fill"
  | "sentence-fill-blank"
  | "conjugation-choice"
  | "sentence-transformation"
  | "particle-choice"
  | "translation";

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  prompt: LocalizedText[];
  /** For choice-style exercises. */
  choices?: string[];
  acceptedAnswers: string[];
  explanation?: LocalizedText[];
  lessonIds: string[];
  origin: ContentOrigin;
  /** Present and non-empty whenever origin === "generated"; ids of the source items it was derived from. */
  generatedFrom?: string[];
  source: SourceReference[];
}

/** One digestible chunk within a lesson (spec section 19: "5-15 minutes" of material). */
export interface LessonSection {
  id: string;
  title: LocalizedText[];
  kind:
    | "vocabulary"
    | "kanji"
    | "kana"
    | "grammar"
    | "numbers"
    | "examples"
    | "notes"
    | "dialogue"
    | "exercises"
    | "mini-review";
  itemIds: string[];
}

export interface Lesson {
  id: string;
  /** Sort order across the whole curriculum; intro classes (A, B) sort before numbered classes. */
  order: number;
  title: LocalizedText[];
  description?: LocalizedText[];
  /** ISO date the class was taught, when known from the source. */
  date?: string;
  sourceFiles: SourceReference[];
  sections: LessonSection[];
}

/** The full extracted+curated content dataset, as assembled by src/data/index.ts. */
export interface ContentDataset {
  lessons: Lesson[];
  kanji: KanjiEntry[];
  vocabulary: VocabularyEntry[];
  grammar: GrammarEntry[];
  numbers: NumberEntry[];
  kana: KanaEntry[];
  conjugationRules: ConjugationRule[];
  examples: ExampleSentence[];
  dialogues: DialogueEntry[];
  notes: NoteEntry[];
  exercises: Exercise[];
}
