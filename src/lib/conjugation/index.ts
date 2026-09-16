import type { ConjugationForm } from "../../data/types";

/**
 * A data-driven Japanese conjugation engine (spec section 16).
 *
 * This is deliberately narrow: it is not a general Japanese grammar engine,
 * it reproduces exactly the stem-shift and te/ta sound-change rules taught
 * in Class N°01/02/03/04/06 (see src/data/conjugation/*.json for the
 * transcribed source rules), plus literal hardcoded tables for the handful
 * of truly irregular words (だ, ある, 来る, する) whose forms don't reduce
 * to a rule. Every hardcoded literal below is copied verbatim from the
 * corresponding extracted ConjugationRule example — conjugation.test.ts
 * cross-checks the engine's output against those same source-derived
 * examples so the two can never silently drift apart.
 *
 * Regular verbs work by taking the dictionary form's final kana character
 * and swapping it for the corresponding stem character. This is safe to do
 * identically on the kanji spelling and the kana reading in parallel,
 * because a godan/ichidan dictionary form's kanji spelling always ends in
 * exactly the same trailing kana character(s) as its reading (the kanji
 * root itself never changes) — e.g. 話す -> 話+す, はなす -> はな+す.
 */

export type VerbClass = "verb-godan" | "verb-ichidan" | "verb-irregular" | "i-adjective" | "na-adjective";

export interface Lemma {
  /** Dictionary-form kanji spelling, when the word has one; omit for a kana-only word. */
  kanji?: string;
  /** Dictionary-form kana reading. Always required. */
  kana: string;
  wordClass: VerbClass;
}

export interface ConjugatedForm {
  surface: string;
  reading?: string;
}

type GodanRow = readonly [string, string, string, string, string]; // A, I, U(=dictionary), E, O

const GODAN_ROWS: Record<string, GodanRow> = {
  "う": ["わ", "い", "う", "え", "お"],
  "つ": ["た", "ち", "つ", "て", "と"],
  "る": ["ら", "り", "る", "れ", "ろ"],
  "く": ["か", "き", "く", "け", "こ"],
  "ぐ": ["が", "ぎ", "ぐ", "げ", "ご"],
  "ぬ": ["な", "に", "ぬ", "ね", "の"],
  "む": ["ま", "み", "む", "め", "も"],
  "ぶ": ["ば", "び", "ぶ", "べ", "ぼ"],
  "す": ["さ", "し", "す", "せ", "そ"],
};

/** Regular te/ta sound-change suffix by dictionary-final kana (class-02/04). */
const TE_TA_BY_FINAL: Record<string, readonly [string, string]> = {
  "う": ["って", "った"],
  "つ": ["って", "った"],
  "る": ["って", "った"],
  "ぬ": ["んで", "んだ"],
  "む": ["んで", "んだ"],
  "ぶ": ["んで", "んだ"],
  "く": ["いて", "いた"],
  "ぐ": ["いで", "いだ"],
  "す": ["して", "した"],
};

/** Verbs whose te/ta form doesn't follow the regular sound-change table (class-02/04 exceptions). */
const TE_TA_OVERRIDES: Record<string, readonly [string, string]> = {
  "いく": ["って", "った"],
};

function applyEnding(form: string, dropLast: number, ending: string): string {
  return form.slice(0, form.length - dropLast) + ending;
}

function godanStemsOf(form: string): GodanRow | null {
  const finalChar = form.slice(-1);
  return GODAN_ROWS[finalChar] ?? null;
}

/** Literal per-form outputs for the words the course explicitly calls irregular. Copied from src/data/conjugation/*.json. */
const IRREGULAR_LEMMAS: Record<string, Partial<Record<ConjugationForm, { kanji?: string; kana: string }>>> = {
  "だ": {
    dictionary: { kana: "だ" },
    nai: { kana: "じゃない" },
    masu: { kana: "です" },
    "masu-negative": { kana: "ではありません" },
    "masu-past": { kana: "でした" },
    "masu-past-negative": { kana: "ではありませんでした" },
    ta: { kana: "だった" },
    nakatta: { kana: "じゃなかった" },
    te: { kana: "だって" },
  },
  "ある": {
    dictionary: { kana: "ある" },
    nai: { kana: "ない" },
    masu: { kana: "あります" },
    "masu-negative": { kana: "ありません" },
    "masu-past": { kana: "ありました" },
    "masu-past-negative": { kana: "ありませんでした" },
    te: { kana: "あって" },
    ta: { kana: "あった" },
    nakatta: { kana: "なかった" },
  },
  "くる": {
    dictionary: { kanji: "来る", kana: "くる" },
    nai: { kanji: "来ない", kana: "こない" },
    masu: { kanji: "来ます", kana: "きます" },
    "masu-negative": { kanji: "来ません", kana: "きません" },
    "masu-past": { kanji: "来ました", kana: "きました" },
    "masu-past-negative": { kanji: "来ませんでした", kana: "きませんでした" },
    te: { kanji: "来て", kana: "きて" },
    ta: { kanji: "来た", kana: "きた" },
    nakatta: { kanji: "来なかった", kana: "こなかった" },
    tai: { kanji: "来たい", kana: "きたい" },
    imperative: { kanji: "来い", kana: "こい" },
    "imperative-negative": { kanji: "来るな", kana: "くるな" },
    "imperative-te": { kanji: "来てください", kana: "きてください" },
    "imperative-negative-polite": { kanji: "来ないでください", kana: "こないでください" },
    "volitional-casual": { kanji: "来よう", kana: "こよう" },
    "volitional-polite": { kanji: "来ましょう", kana: "きましょう" },
  },
  "する": {
    dictionary: { kana: "する" },
    nai: { kana: "しない" },
    masu: { kana: "します" },
    "masu-negative": { kana: "しません" },
    "masu-past": { kana: "しました" },
    "masu-past-negative": { kana: "しませんでした" },
    te: { kana: "して" },
    ta: { kana: "した" },
    nakatta: { kana: "しなかった" },
    tai: { kana: "したい" },
    imperative: { kana: "しろ" },
    "imperative-negative": { kana: "するな" },
    "imperative-te": { kana: "してください" },
    "imperative-negative-polite": { kana: "しないでください" },
    "volitional-casual": { kana: "しよう" },
    "volitional-polite": { kana: "しましょう" },
  },
};

function irregularFormFor(dictionaryKana: string, form: ConjugationForm): ConjugatedForm | null {
  const table = IRREGULAR_LEMMAS[dictionaryKana];
  const entry = table?.[form];
  if (!entry) return null;
  return entry.kanji ? { surface: entry.kanji, reading: entry.kana } : { surface: entry.kana };
}

function pack(kanji: string | undefined, kana: string): ConjugatedForm {
  return kanji && kanji !== kana ? { surface: kanji, reading: kana } : { surface: kana };
}

function conjugateGodan(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  const irregular = irregularFormFor(lemma.kana, form);
  if (irregular) return irregular;

  const rows = godanStemsOf(lemma.kana);
  if (!rows) return null;
  const [aKana, iKana, , eKana, oKana] = rows;
  const finalChar = lemma.kana.slice(-1);
  const teTa = TE_TA_OVERRIDES[lemma.kana] ?? TE_TA_BY_FINAL[finalChar];

  const stem = (row: string) => ({
    kanji: lemma.kanji ? applyEnding(lemma.kanji, 1, row) : undefined,
    kana: applyEnding(lemma.kana, 1, row),
  });

  switch (form) {
    case "dictionary":
      return pack(lemma.kanji, lemma.kana);
    case "masu": {
      const s = stem(iKana);
      return pack(s.kanji && s.kanji + "ます", s.kana + "ます");
    }
    case "masu-negative": {
      const s = stem(iKana);
      return pack(s.kanji && s.kanji + "ません", s.kana + "ません");
    }
    case "masu-past": {
      const s = stem(iKana);
      return pack(s.kanji && s.kanji + "ました", s.kana + "ました");
    }
    case "masu-past-negative": {
      const s = stem(iKana);
      return pack(s.kanji && s.kanji + "ませんでした", s.kana + "ませんでした");
    }
    case "nai": {
      const s = stem(aKana);
      return pack(s.kanji && s.kanji + "ない", s.kana + "ない");
    }
    case "nakatta": {
      const s = stem(aKana);
      return pack(s.kanji && s.kanji + "なかった", s.kana + "なかった");
    }
    case "tai": {
      const s = stem(iKana);
      return pack(s.kanji && s.kanji + "たい", s.kana + "たい");
    }
    case "te": {
      if (!teTa) return null;
      return pack(
        lemma.kanji && applyEnding(lemma.kanji, 1, teTa[0]),
        applyEnding(lemma.kana, 1, teTa[0]),
      );
    }
    case "ta": {
      if (!teTa) return null;
      return pack(
        lemma.kanji && applyEnding(lemma.kanji, 1, teTa[1]),
        applyEnding(lemma.kana, 1, teTa[1]),
      );
    }
    case "imperative":
      return pack(stem(eKana).kanji, stem(eKana).kana);
    case "imperative-negative":
      return pack(lemma.kanji && lemma.kanji + "な", lemma.kana + "な");
    case "imperative-te": {
      if (!teTa) return null;
      return pack(
        lemma.kanji && applyEnding(lemma.kanji, 1, teTa[0]) + "ください",
        applyEnding(lemma.kana, 1, teTa[0]) + "ください",
      );
    }
    case "imperative-negative-polite": {
      const s = stem(aKana);
      return pack(s.kanji && s.kanji + "ないでください", s.kana + "ないでください");
    }
    case "volitional-casual": {
      const s = stem(oKana);
      return pack(s.kanji && s.kanji + "う", s.kana + "う");
    }
    case "volitional-polite": {
      const s = stem(iKana);
      return pack(s.kanji && s.kanji + "ましょう", s.kana + "ましょう");
    }
    default:
      return null;
  }
}

function conjugateIchidan(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  const irregular = irregularFormFor(lemma.kana, form);
  if (irregular) return irregular;

  const stemKana = lemma.kana.slice(0, -1);
  const stemKanji = lemma.kanji ? lemma.kanji.slice(0, -1) : undefined;

  switch (form) {
    case "dictionary":
      return pack(lemma.kanji, lemma.kana);
    case "masu":
      return pack(stemKanji && stemKanji + "ます", stemKana + "ます");
    case "masu-negative":
      return pack(stemKanji && stemKanji + "ません", stemKana + "ません");
    case "masu-past":
      return pack(stemKanji && stemKanji + "ました", stemKana + "ました");
    case "masu-past-negative":
      return pack(stemKanji && stemKanji + "ませんでした", stemKana + "ませんでした");
    case "nai":
      return pack(stemKanji && stemKanji + "ない", stemKana + "ない");
    case "nakatta":
      return pack(stemKanji && stemKanji + "なかった", stemKana + "なかった");
    case "tai":
      return pack(stemKanji && stemKanji + "たい", stemKana + "たい");
    case "te":
      return pack(stemKanji && stemKanji + "て", stemKana + "て");
    case "ta":
      return pack(stemKanji && stemKanji + "た", stemKana + "た");
    case "imperative":
      return pack(stemKanji && stemKanji + "ろ", stemKana + "ろ");
    case "imperative-negative":
      return pack(lemma.kanji && lemma.kanji + "な", lemma.kana + "な");
    case "imperative-te":
      return pack(stemKanji && stemKanji + "てください", stemKana + "てください");
    case "imperative-negative-polite":
      return pack(stemKanji && stemKanji + "ないでください", stemKana + "ないでください");
    case "volitional-casual":
      return pack(stemKanji && stemKanji + "よう", stemKana + "よう");
    case "volitional-polite":
      return pack(stemKanji && stemKanji + "ましょう", stemKana + "ましょう");
    default:
      return null;
  }
}

/**
 * Handles [noun]+する compound verbs (勉強する, 散歩する, ...) explicitly
 * called out by the course as behaving exactly like する itself, with the
 * noun prefix carried through unchanged.
 */
function conjugateSuruCompound(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  if (lemma.kana === "する" || !lemma.kana.endsWith("する")) return null;
  const sound = irregularFormFor("する", form);
  if (!sound) return null;
  // する itself is always kana-only, so `sound.surface` is already the kana suffix.
  const kanaPrefix = lemma.kana.slice(0, -2);
  const kanjiPrefix = lemma.kanji?.endsWith("する") ? lemma.kanji.slice(0, -2) : undefined;
  return pack(kanjiPrefix ? kanjiPrefix + sound.surface : undefined, kanaPrefix + sound.surface);
}

function conjugateIrregular(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  return irregularFormFor(lemma.kana, form) ?? conjugateSuruCompound(lemma, form);
}

function conjugateIAdjective(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  const rootKana = lemma.kana.slice(0, -1);
  const rootKanji = lemma.kanji ? lemma.kanji.slice(0, -1) : undefined;

  switch (form) {
    case "dictionary":
      return pack(lemma.kanji, lemma.kana);
    case "i-adjective-negative":
      return pack(rootKanji && rootKanji + "くない", rootKana + "くない");
    case "i-adjective-past":
      return pack(rootKanji && rootKanji + "かった", rootKana + "かった");
    case "i-adjective-past-negative":
      return pack(rootKanji && rootKanji + "くなかった", rootKana + "くなかった");
    default:
      return null;
  }
}

/** The lemma is the bare stem (e.g. きれい, 静か), without a trailing な or だ. */
function conjugateNaAdjective(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  switch (form) {
    case "dictionary":
      return pack(lemma.kanji && lemma.kanji + "だ", lemma.kana + "だ");
    case "na-adjective-negative":
      return pack(lemma.kanji && lemma.kanji + "じゃない", lemma.kana + "じゃない");
    case "na-adjective-past":
      return pack(lemma.kanji && lemma.kanji + "だった", lemma.kana + "だった");
    case "na-adjective-past-negative":
      return pack(lemma.kanji && lemma.kanji + "じゃなかった", lemma.kana + "じゃなかった");
    default:
      return null;
  }
}

/** Forms this engine can actually produce for each word class, in the order the course introduces them. */
/** Human-readable labels for the forms this engine supports, for UI display. */
export const FORM_LABELS: Partial<Record<ConjugationForm, string>> = {
  dictionary: "dictionary form",
  masu: "polite present (ます)",
  "masu-negative": "polite negative present (ません)",
  "masu-past": "polite past (ました)",
  "masu-past-negative": "polite negative past (ませんでした)",
  nai: "plain negative present (ない)",
  nakatta: "plain negative past (なかった)",
  tai: "\"want to\" (たい)",
  te: "te-form (て)",
  ta: "plain past / ta-form (た)",
  imperative: "rude imperative",
  "imperative-negative": "rude negative imperative (な)",
  "imperative-te": "polite request (てください)",
  "imperative-negative-polite": "polite negative request (ないでください)",
  "volitional-casual": "casual volitional \"let's\" (よう)",
  "volitional-polite": "polite volitional \"let's\" (ましょう)",
  "i-adjective-negative": "negative (くない)",
  "i-adjective-past": "past (かった)",
  "i-adjective-past-negative": "negative past (くなかった)",
  "na-adjective-negative": "negative (じゃない)",
  "na-adjective-past": "past (だった)",
  "na-adjective-past-negative": "negative past (じゃなかった)",
};

export const SUPPORTED_FORMS_BY_CLASS: Record<VerbClass, ConjugationForm[]> = {
  "verb-godan": [
    "dictionary",
    "masu",
    "masu-negative",
    "masu-past",
    "masu-past-negative",
    "nai",
    "nakatta",
    "tai",
    "te",
    "ta",
    "imperative",
    "imperative-negative",
    "imperative-te",
    "imperative-negative-polite",
    "volitional-casual",
    "volitional-polite",
  ],
  "verb-ichidan": [
    "dictionary",
    "masu",
    "masu-negative",
    "masu-past",
    "masu-past-negative",
    "nai",
    "nakatta",
    "tai",
    "te",
    "ta",
    "imperative",
    "imperative-negative",
    "imperative-te",
    "imperative-negative-polite",
    "volitional-casual",
    "volitional-polite",
  ],
  "verb-irregular": [
    "dictionary",
    "masu",
    "masu-negative",
    "masu-past",
    "masu-past-negative",
    "nai",
    "nakatta",
    "tai",
    "te",
    "ta",
    "imperative",
    "imperative-negative",
    "imperative-te",
    "imperative-negative-polite",
    "volitional-casual",
    "volitional-polite",
  ],
  "i-adjective": ["dictionary", "i-adjective-negative", "i-adjective-past", "i-adjective-past-negative"],
  "na-adjective": ["dictionary", "na-adjective-negative", "na-adjective-past", "na-adjective-past-negative"],
};

/**
 * Produces one conjugated form for a lemma, or null if that form doesn't
 * apply to the lemma's word class (or isn't one of the forms this engine
 * implements). Never guesses: an unsupported (class, form) pair returns
 * null rather than an invented answer.
 */
export function conjugate(lemma: Lemma, form: ConjugationForm): ConjugatedForm | null {
  switch (lemma.wordClass) {
    case "verb-godan":
      return conjugateGodan(lemma, form);
    case "verb-ichidan":
      return conjugateIchidan(lemma, form);
    case "verb-irregular":
      return conjugateIrregular(lemma, form);
    case "i-adjective":
      return conjugateIAdjective(lemma, form);
    case "na-adjective":
      return conjugateNaAdjective(lemma, form);
    default:
      return null;
  }
}
