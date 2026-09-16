import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type {
  ConjugationRule,
  DialogueEntry,
  ExampleSentence,
  GrammarEntry,
  NumberCategory,
  NumberEntry,
  VocabularyEntry,
} from "../../../src/data/types";

/**
 * Hand-authored grammar/counters/reading content for class-06, transcribed
 * from "Class N°06 - synthesis & assignments.pdf" pages 6-19 (see
 * scripts/extract/.cache/class-06-remainder.txt): part 2 of the Leo
 * comprehensible-input story, imperative/volitional ("let's") conjugation,
 * eight full counter systems (1-10 each), and more adverbs.
 *
 * Usage: tsx scripts/extract/manual/class-06-grammar.ts
 */

const FILE = "Class N°06 - synthesis & assignments.pdf";
const LESSON_ID = "class-06";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const conjugationPath = `src/data/conjugation/${LESSON_ID}.json`;
const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;
const numbersPath = `src/data/numbers/${LESSON_ID}.json`;

const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const conjugation = loadOwnArray<ConjugationRule>(conjugationPath);
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);
const numbers = loadOwnArray<NumberEntry>(numbersPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
const nextConjugationId = makeIdSequencer(conjugation, `${LESSON_ID}-conjugation-`);
const nextNumberId = makeIdSequencer(numbers, `${LESSON_ID}-number-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();
function vocabWord(kanji: string | undefined, kana: string, meaning: string, page: number, pos?: VocabularyEntry["partOfSpeech"]) {
  return addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kanji,
    kana,
    meanings: [{ en: meaning }],
    partOfSpeech: pos,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page }],
  }));
}

function example(japanese: string, meaning: string, page: number, reading?: string): ExampleSentence {
  return { id: nextExampleId(), japanese, reading, meanings: [{ en: meaning }], origin: "course", source: [{ file: FILE, page }] };
}

// --- Leo comprehensible-input reading, part 2 (p.6-9) ---
const leoLines: { jp: string; reading: string; en: string }[] = [
  ["彼はレオさんです。", "かれはレオさんです", "He is Leo."],
  ["レオさんは部屋にいました。", "レオさんはへやにいました", "Leo was in his room."],
  ["朝でした。", "あさでした", "It was morning."],
  ["明るかったです。", "あかるかったです", "It was bright."],
  ["レオさんはちょっと病気でした。", "レオさんはちょっとびょうきでした", "Leo was a little sick."],
  ["朝、彼は電話を使いました。", "あさ、かれはでんわをつかいました", "In the morning, he used his phone."],
  ["電話でメッセージを読みました。", "でんわでメッセージをよみました", "He read messages on his phone."],
  ["朝ご飯の前に手を洗いました。", "あさごはんのまえにてをあらいました", "He washed his hands before breakfast."],
  ["その後で、朝ご飯を食べました。", "そのあとで、あさごはんをたべました", "After that, he ate breakfast."],
  ["ヨーグルトを食べました。", "ヨーグルトをたべました", "He ate yogurt."],
  ["食べた後で、電話を見つけませんでした。", "たべたあとで、でんわをみつけませんでした", "After eating, he couldn't find his phone."],
  ["電話を無くしました。", "でんわをなくしました", "He lost his phone."],
  ["リビングルームで電話を探しました。", "リビングルームででんわをさがしました", "He looked for his phone in the living room."],
  ["でも、リビングルームに電話がありませんでした。", "でも、リビングルームにでんわがありませんでした", "But there was no phone in the living room."],
  ["バスルームでも探したかったです。", "バスルームでもさがしたかったです", "He also wanted to look in the bathroom."],
  ["しかし、お父さんはシャワーを浴びていました。", "しかし、おとうさんはシャワーをあびていました", "However, his father was taking a shower."],
  ["ですから、キッチンで電話を探しました。", "ですから、キッチンででんわをさがしました", "So he looked for his phone in the kitchen."],
  ["でも、キッチンにも電話がありませんでした。", "でも、キッチンにもでんわがありませんでした", "But there was no phone in the kitchen either."],
  ["お母さんに「僕の電話はどこですか」と言いました。", "おかあさんに「ぼくのでんわはどこですか」といいました", 'He said to his mother, "Where is my phone?"'],
  ["彼女は「知りません」と言いました。", "かのじょは「しりません」といいました", 'She said, "I don\'t know."'],
  [
    "しかし、お父さんがシャワーを浴びた後で、レオさんはバスルームで電話を探しました。",
    "しかし、おとうさんがシャワーをあびたあとで、レオさんはバスルームででんわをさがしました",
    "However, after his father finished showering, Leo looked for his phone in the bathroom.",
  ],
  ["そして…電話を見つけました。", "そして…でんわをみつけました", "And... he found his phone."],
  ["バスルームに電話がありました。", "バスルームにでんわがありました", "The phone was in the bathroom."],
  ["レオさんは嬉しかったです。", "レオさんはうれしかったです", "Leo was happy."],
  ["あの晩、彼はラーメンを食べました。", "あのばん、かれはラーメンをたべました", "That evening, he ate ramen."],
  ["食べた後で、部屋に行きました。", "たべたあとで、へやにいきました", "After eating, he went to his room."],
  ["その後で、寝ました。", "そのあとで、ねました", "Then he went to sleep."],
  ["ピザを夢見ました。", "ピザをゆめみました", "He dreamed about pizza."],
];
dialogues.push({
  id: `${LESSON_ID}-dialogue-001`,
  title: "レオさん (Leo the butcher), part 2 — comprehensible input reading passage",
  lines: leoLines.map((l) => ({ japanese: l[0], reading: l[1], meanings: [{ en: l[2] }] })),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 6, note: "Reading passage spans pages 6-9" }],
});

// --- Imperative & volitional (p.12-14) ---
conjugation.push(
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "imperative",
    explanation: [{ en: "Rude imperative: godan verbs use the -e stem alone (飲む→飲め, 話す→話せ)." }],
    examples: [
      { form: "imperative", surface: "飲め", reading: "のめ" },
      { form: "imperative", surface: "話せ", reading: "はなせ" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 12 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-ichidan",
    form: "imperative",
    explanation: [
      { en: "Rude imperative: ichidan verbs use the -e stem + ろ (食べる→食べろ, 見る→見ろ). Irregular: 来る→来い(こい), する→しろ." },
    ],
    examples: [
      { form: "imperative", surface: "食べろ", reading: "たべろ" },
      { form: "imperative", surface: "見ろ", reading: "みろ" },
      { form: "imperative", surface: "来い", reading: "こい" },
      { form: "imperative", surface: "しろ" },
    ],
    exceptions: ["来る → 来い (こい), する → しろ — irregular, not -e+ろ"],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 12 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "imperative-negative",
    explanation: [{ en: "Rude negative imperative (\"don't [verb]\"): dictionary (-u) form + な, for both godan and ichidan verbs, no exceptions. 飲む→飲むな, 話す→話すな, 食べる→食べるな, 見る→見るな." }],
    examples: [
      { form: "imperative-negative", surface: "飲むな", reading: "のむな" },
      { form: "imperative-negative", surface: "話すな", reading: "はなすな" },
      { form: "imperative-negative", surface: "食べるな", reading: "たべるな" },
      { form: "imperative-negative", surface: "見るな", reading: "みるな" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 12 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "imperative-te",
    explanation: [
      {
        en: "The polite/neutral imperative is just the te-form, optionally + ください for politeness: 飲む→飲んで(ください), 話す→話して(ください), 食べる→食べて(ください), 見る→見て(ください). Irregular verbs use their normal te-forms: 来る→来て, 行く→行って, する→して.",
      },
    ],
    examples: [
      { form: "imperative-te", surface: "飲んでください", reading: "のんでください" },
      { form: "imperative-te", surface: "食べてください", reading: "たべてください" },
      { form: "imperative-te", surface: "来てください", reading: "きてください" },
      { form: "imperative-te", surface: "行ってください", reading: "いってください" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 13 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "imperative-negative-polite",
    explanation: [
      {
        en: "Polite negative imperative (\"please don't [verb]\"): -a stem + ないで, optionally + ください. 飲む→飲ま→飲まないで(ください), 話す→話さ→話さないで(ください), 食べる→食べ→食べないで(ください), 見る→見→見ないで(ください). Irregular: 来る→来(こ)→来ないで, する→し→しないで.",
      },
    ],
    examples: [
      { form: "imperative-negative-polite", surface: "飲まないでください", reading: "のまないでください" },
      { form: "imperative-negative-polite", surface: "食べないでください", reading: "たべないでください" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 13 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "volitional-casual",
    explanation: [
      {
        en: "Casual \"let's...\": godan -o stem + う (飲む→飲も→飲もう, 話す→話そ→話そう); ichidan -o stem (i.e. plain stem) + よう (食べる→食べ→食べよう, 見る→見→見よう). Irregular: 来る→来(こ)→来よう, する→し→しよう.",
      },
    ],
    examples: [
      { form: "volitional-casual", surface: "飲もう", reading: "のもう" },
      { form: "volitional-casual", surface: "食べよう", reading: "たべよう" },
      { form: "volitional-casual", surface: "来よう", reading: "こよう" },
      { form: "volitional-casual", surface: "しよう" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 14 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "volitional-polite",
    explanation: [
      {
        en: "Polite \"let's...\": -i (masu) stem + ましょう, for both godan and ichidan. 飲む→飲み→飲みましょう, 話す→話し→話しましょう, 食べる→食べ→食べましょう, 見る→見→見ましょう. Irregular: 来る→来(き)→来ましょう, する→し→しましょう.",
      },
    ],
    examples: [
      { form: "volitional-polite", surface: "飲みましょう", reading: "のみましょう" },
      { form: "volitional-polite", surface: "食べましょう", reading: "たべましょう" },
      { form: "volitional-polite", surface: "来ましょう", reading: "きましょう" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 14 }],
  },
);

grammar.push({
  id: nextGrammarId(),
  pattern: "Imperative & volitional (\"let's\")",
  explanation: [
    {
      en: "Japanese has several command forms of increasing politeness. Rude imperative: -e stem (godan) or -e stem+ろ (ichidan) — 飲め, 食べろ; rude negative: dictionary form+な for any verb — 飲むな. Neutral/polite imperative: te-form (+ください) — 飲んで(ください); polite negative: -a stem+ないで(ください) — 飲まないで(ください). \"Let's...\": casual -o stem+う/よう — 飲もう, 食べよう; polite -i stem+ましょう — 飲みましょう, 食べましょう. 来る/する are irregular throughout.",
    },
  ],
  examples: [],
  relatedConjugationRuleIds: conjugation.slice(-7).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 12 }, { file: FILE, page: 13 }, { file: FILE, page: 14 }],
});

// --- Counters (p.15-18) ---
interface CounterDef {
  category: NumberCategory;
  suffix: string;
  meaning: string;
  readings: string[]; // 1-10
  examples: [string, string][]; // [japanese, english]
  page: number;
}
const counters: CounterDef[] = [
  {
    category: "counter-animals",
    suffix: "頭",
    meaning: "counter for large animals",
    readings: ["いっとう", "にとう", "さんとう", "よんとう", "ごとう", "ろくとう", "ななとう", "はっとう", "きゅうとう", "じゅっとう"],
    examples: [["牛が一頭います。", "There is one cow."], ["馬を二頭見ました。", "I saw two horses."]],
    page: 15,
  },
  {
    category: "counter-flat-objects",
    suffix: "枚",
    meaning: "counter for flat objects",
    readings: ["いちまい", "にまい", "さんまい", "よんまい", "ごまい", "ろくまい", "ななまい", "はちまい", "きゅうまい", "じゅうまい"],
    examples: [["カードが三枚あります。", "There are three cards."], ["紙を四枚ください。", "Four sheets of paper, please."]],
    page: 15,
  },
  {
    category: "counter-vehicles-devices",
    suffix: "台",
    meaning: "counter for devices & vehicles",
    readings: ["いちだい", "にだい", "さんだい", "よんだい", "ごだい", "ろくだい", "ななだい", "はちだい", "きゅうだい", "じゅうだい"],
    examples: [["車が一台あります。", "There is one car."], ["バスは四台来ました。", "Four buses came."]],
    page: 16,
  },
  {
    category: "counter-long-objects",
    suffix: "本",
    meaning: "counter for long, cylindrical objects",
    readings: ["いっぽん", "にほん", "さんぼん", "よんほん", "ごほん", "ろっぽん", "ななほん", "はっぽん", "きゅうほん", "じゅっぽん"],
    examples: [["ペンが一本あります。", "There is one pen."], ["水を二本買いました。", "I bought two bottles of water."]],
    page: 16,
  },
  {
    category: "counter-liquid-containers",
    suffix: "杯",
    meaning: "counter for cups/glasses of liquid",
    readings: ["いっぱい", "にはい", "さんばい", "よんはい", "ごはい", "ろっぱい", "ななはい", "はっぱい", "きゅうはい", "じゅっぱい"],
    examples: [["コーヒーを一杯ください。", "One cup of coffee, please."], ["ビールを三杯飲みます。", "I drink three glasses of beer."]],
    page: 17,
  },
  {
    category: "counter-books",
    suffix: "冊",
    meaning: "counter for bound volumes (books)",
    readings: ["いっさつ", "にさつ", "さんさつ", "よんさつ", "ごさつ", "ろくさつ", "ななさつ", "はっさつ", "きゅうさつ", "じゅっさつ"],
    examples: [["本が一冊あります。", "There is one book."], ["この図書館に本が四冊あります。", "There are four books in this library."]],
    page: 17,
  },
  {
    category: "counter-occurrences",
    suffix: "回",
    meaning: "counter for times/occurrences",
    readings: ["いっかい", "にかい", "さんかい", "よんかい", "ごかい", "ろっかい", "ななかい", "はっかい", "きゅうかい", "じゅっかい"],
    examples: [["日本へ一回行きました。", "I went to Japan once."], ["この映画を二回見ました。", "I watched this movie twice."]],
    page: 18,
  },
  {
    category: "counter-ordinal",
    suffix: "番目",
    meaning: "ordinal number counter (1st, 2nd, ...)",
    readings: ["いちばんめ", "にばんめ", "さんばんめ", "よんばんめ", "ごばんめ", "ろくばんめ", "ななばんめ", "はちばんめ", "きゅうばんめ", "じゅうばんめ"],
    examples: [["私は一番目です。", "I am first."], ["三番目の人は先生です。", "The third person is the teacher."]],
    page: 18,
  },
];

const numeralKanji = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
for (const c of counters) {
  const exampleIds: string[] = [];
  for (const [jp, en] of c.examples) {
    const ex = example(jp, en, c.page);
    examples.push(ex);
    exampleIds.push(ex.id);
  }
  for (let n = 1; n <= 10; n++) {
    numbers.push({
      id: nextNumberId(),
      category: c.category,
      value: n,
      japanese: `${numeralKanji[n - 1]}${c.suffix}`,
      reading: c.readings[n - 1],
      counter: c.suffix,
      lessonIds: [LESSON_ID],
      origin: "course",
      source: [{ file: FILE, page: c.page }],
    });
  }
  grammar.push({
    id: nextGrammarId(),
    pattern: `Counter: ${c.suffix} (${c.meaning})`,
    explanation: [{ en: `${c.meaning}: ${numeralKanji.map((k, i) => `${k}${c.suffix}(${c.readings[i]})`).join(", ")}.` }],
    examples: exampleIds.map((id) => examples.find((e) => e.id === id)!),
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: c.page }],
  });
}

// --- Adverbs (p.19) ---
vocabWord(undefined, "よく", "often", 19, ["adverb"]);
vocabWord("時々", "ときどき", "from time to time", 19, ["adverb"]);
vocabWord(undefined, "あまり", "not often [+ negation]", 19, ["adverb"]);
vocabWord("全然", "ぜんぜん", "never / not at all [+ negation]", 19, ["adverb"]);
vocabWord(undefined, "少し・ちょっと", "a bit / a few", 19, ["adverb"]);

const adverbExamples2 = [
  example("いつもコーヒーを飲みます。", "I always drink coffee.", 19),
  example("私はよく映画を見ます。", "I often watch movies.", 19),
  example("私は全然お酒を飲みません。", "I don't drink alcohol at all.", 19),
];
examples.push(...adverbExamples2);
grammar.push({
  id: nextGrammarId(),
  pattern: "More adverbs of frequency",
  explanation: [
    { en: "Frequency adverbs, placed before the verb (or fronted for emphasis): いつも = always; よく = often; ときどき = from time to time; あまり [+negation] = not often; 全然 [+negation] = never/not at all; 少し・ちょっと = a bit/a few." },
  ],
  examples: adverbExamples2,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 19 }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(conjugationPath, conjugation);
saveOwnArray(dialoguesPath, dialogues);
saveOwnArray(numbersPath, numbers);

console.log(
  `${LESSON_ID}: ${vocab.length} vocab, ${examples.length} examples, ${grammar.length} grammar, ` +
    `${conjugation.length} conjugation, ${numbers.length} numbers, ${dialogues.length} dialogues.`,
);
