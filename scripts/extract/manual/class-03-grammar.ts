import { loadOwnArray, saveOwnArray, makeIdSequencer } from "../lib/lessonFile";
import type { ConjugationRule, ExampleSentence, GrammarEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/conjugation content for class-03, transcribed
 * directly from the grammar sections of "Class N°03 - synthesis &
 * assignments.pdf" that scripts/extract/parseClassSynthesis.ts could not
 * safely auto-parse (see scripts/extract/.cache/class-03-remainder.txt for
 * the raw source lines this was transcribed from — pages 12-17).
 *
 * This is not a generic parser: each class teaches different grammar, so
 * there is no shared table format worth automating across lessons. It is
 * still deterministic (re-running reproduces the same output) and
 * editable (plain TS), per the project's pipeline requirements.
 *
 * Usage: tsx scripts/extract/manual/class-03-grammar.ts
 */

const FILE = "Class N°03 - synthesis & assignments.pdf";
const LESSON_ID = "class-03";

const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const conjugationPath = `src/data/conjugation/${LESSON_ID}.json`;

const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const conjugation = loadOwnArray<ConjugationRule>(conjugationPath);

const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
const nextConjugationId = makeIdSequencer(conjugation, `${LESSON_ID}-conjugation-`);

function example(japanese: string, meaning: string, page: number, reading?: string): ExampleSentence {
  return {
    id: nextExampleId(),
    japanese,
    reading,
    meanings: [{ en: meaning }],
    origin: "course",
    source: [{ file: FILE, page }],
  };
}

// --- I-adjectives (p.13-15) ---

const iAdjExamples = [
  example("大きい車を買っている。", "I'm buying a big car.", 13),
  example("大きい車です。", "It's a big car.", 13),
  example("小さい車を買っている。", "I'm buying a small car.", 13),
  example("小さい車です。", "It's a small car.", 13),
  example("車は大きい。", "The car is big.", 13),
  example("私の家は大きい。", "My house is big.", 13),
  example("車は小さい。", "The car is small.", 13),
  example("私の家は小さい。", "My house is small.", 13),
  example("車は大きいです。", "The car is big. [polite]", 14),
  example("車は大きくない。", "The car is not big.", 14),
  example("車は大きくないです。", "The car is not big. [polite]", 14),
  example("車は大きかった。", "The car was big.", 14),
  example("車は大きかったです。", "The car was big. [polite]", 14),
  example("車は大きくなかった。", "The car wasn't big.", 14),
  example("車は大きくなかったです。", "The car wasn't big. [polite]", 14),
  example("大きく書いてください。", "Please write with bigger letters.", 15),
  example("小さく切ります。", "I cut it into small pieces.", 15),
  example("車は大きくて赤い。", "The car is big and red.", 15),
  example("車は小さくて青い。", "The car is small and blue.", 15),
];
examples.push(...iAdjExamples);

conjugation.push({
  id: nextConjugationId(),
  appliesTo: "i-adjective",
  form: "dictionary",
  explanation: [
    {
      en: "I-adjectives split into a root and an ending. The ending is い for present/dictionary form, くない for negative, かった for past, くなかった for past negative. です can be added after any of these to make them polite (the root/ending choice itself doesn't change).",
    },
  ],
  examples: [
    { form: "dictionary", surface: "大きい", reading: "おおきい" },
    { form: "i-adjective-negative", surface: "大きくない", reading: "おおきくない" },
    { form: "i-adjective-past", surface: "大きかった", reading: "おおきかった" },
    { form: "i-adjective-past-negative", surface: "大きくなかった", reading: "おおきくなかった" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 14 }],
});

grammar.push({
  id: nextGrammarId(),
  pattern: "I-adjectives",
  explanation: [
    {
      en: "Japanese has two types of adjectives, I-adjectives and NA-adjectives (this course also distinguishes NO-adjectives, always learned with their I/NA/NO ending as part of the word, even though standard teaching doesn't mark this). I-adjectives: (1) placed directly before a noun to describe it — 大きい車 = big car; (2) placed at the end of a sentence as the predicate, with no need for a form of \"to be\" — 車は大きい = the car is big; (3) replace the final い with く to form an adverb, placed just before the verb — 大きく書いてください = please write with bigger letters; (4) to combine multiple adjectives, replace the final い with くて on every adjective except the last — 車は大きくて赤い = the car is big and red.",
    },
  ],
  examples: iAdjExamples,
  relatedConjugationRuleIds: [conjugation[conjugation.length - 1].id],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 13 }, { file: FILE, page: 15 }],
});

// --- たい (want to) (p.16) ---

const taiExamples = [
  example("水を飲みたい。", "I want to drink water.", 16),
  example("水を飲みたくない。", "I don't want to drink water.", 16),
  example("水を飲みたかった。", "I wanted to drink water.", 16),
  example("水を飲みたくなかった。", "I didn't want to drink water.", 16),
];
examples.push(...taiExamples);

conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "tai",
  explanation: [
    {
      en: "\"Want to [verb]\" is formed from the -i (masu) stem + たい: godan 飲む→飲み→飲みたい, 話す→話し→話したい; ichidan 食べる→食べ→食べたい, 見る→見→見たい, いる→い→いたい. Two exceptions: 来る→来(き)→来たい(きたい), する→し→したい. たい then declines exactly like an i-adjective (たい/たくない/たかった/たくなかった).",
    },
  ],
  examples: [
    { form: "tai", surface: "飲みたい", reading: "のみたい" },
    { form: "i-adjective-negative", surface: "飲みたくない", reading: "のみたくない" },
    { form: "i-adjective-past", surface: "飲みたかった", reading: "のみたかった" },
    { form: "i-adjective-past-negative", surface: "飲みたくなかった", reading: "のみたくなかった" },
  ],
  exceptions: ["来る (to come) → 来たい (きたい), not the regular pattern applied to 来"],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 16 }],
});

grammar.push({
  id: nextGrammarId(),
  pattern: "たい (want to)",
  explanation: [
    { en: "Expresses wanting to do an action: verb -i (masu) stem + たい. Declines like an i-adjective for negative/past/polite." },
  ],
  examples: taiExamples,
  relatedConjugationRuleIds: [conjugation[conjugation.length - 1].id],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 16 }],
});

// --- More particles (p.17) ---

const niIndirectObject = example("友だちに本をあげる。", "I give a book to my friend.", 17);
const noPossessive = example("学生の本は青い。", "The student's book is blue.", 17);
const toQuotes = example("『こんにちは』と言う。", "I say “hello”.", 17);
const toWith = example("私の猫と寝る。", "I sleep with my cat.", 17);
const deLocation = example("学校で書く。", "I write at school.", 17);
const heDirection = example("山へ行く。", "I go to/towards the mountain.", 17, undefined);
const niTime = example("日曜日にサッカーをする。", "I play football on Sunday.", 17);
const noQuestion = example("お茶を飲むの。", "Do you drink tea?", 17);
const particleExamples = [
  niIndirectObject,
  noPossessive,
  toQuotes,
  toWith,
  deLocation,
  heDirection,
  niTime,
  noQuestion,
];
examples.push(...particleExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "More particles (に, の, と, で, へ)",
  explanation: [
    {
      en: "Further particle uses taught this week: に = indirect object/dative (friend in 友だちに本をあげる) or time-location (日曜日に); の = possessive/genitive ('s) — after pronouns forms possessives (私の, あなたの, 彼の, 彼女の = my/your/his/her) — and, casually, can mark a question (お茶を飲むの? = do you drink tea?); と = introduces a quotation (『こんにちは』と言う = I say \"hello\") or means \"with\" (私の猫と寝る = I sleep with my cat); で = marks the location where an action happens (学校で書く = I write at school); へ (pronounced え) = direction/\"towards\" (山へ行く = I go towards the mountain).",
    },
  ],
  particles: [
    { particle: "に", meaning: [{ en: "indirect object, dative" }], exampleSentenceId: niIndirectObject.id },
    { particle: "の", meaning: [{ en: "possessive, genitive ['s]" }], exampleSentenceId: noPossessive.id },
    { particle: "と", meaning: [{ en: "quotes" }], exampleSentenceId: toQuotes.id },
    { particle: "と", meaning: [{ en: "with" }], exampleSentenceId: toWith.id },
    { particle: "で", meaning: [{ en: "location [action verbs]" }], exampleSentenceId: deLocation.id },
    { particle: "へ", meaning: [{ en: "direction, towards" }], exampleSentenceId: heDirection.id },
    { particle: "に", meaning: [{ en: "time-location" }], exampleSentenceId: niTime.id },
    { particle: "の", meaning: [{ en: "question mark [casual]" }], exampleSentenceId: noQuestion.id },
  ],
  examples: particleExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 17 }],
});

saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(conjugationPath, conjugation);

console.log(
  `${LESSON_ID}: +${iAdjExamples.length + taiExamples.length + particleExamples.length} examples, ` +
    `+${grammar.length} grammar entries total, +${conjugation.length} conjugation rules total.`,
);
