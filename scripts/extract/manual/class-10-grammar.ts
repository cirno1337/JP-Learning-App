import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { ConjugationRule, DialogueEntry, ExampleSentence, GrammarEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/vocabulary content for class-10 (the final class),
 * transcribed from "Class N°10 - synthesis & assignments.pdf" pages 4-12
 * (see scripts/extract/.cache/class-10-remainder.txt): a missed vocabulary
 * subcategory, the "park" comprehensible-input reading, the full
 * conditional system (と/たら/なら/ば・れば/なければ), must/have to,
 * should(not), and non-exhaustive lists of actions (たり...たりする).
 *
 * Usage: tsx scripts/extract/manual/class-10-grammar.ts
 */

const FILE = "Class N°10 - synthesis & assignments.pdf";
const LESSON_ID = "class-10";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const conjugationPath = `src/data/conjugation/${LESSON_ID}.json`;
const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;

const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const conjugation = loadOwnArray<ConjugationRule>(conjugationPath);
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
const nextConjugationId = makeIdSequencer(conjugation, `${LESSON_ID}-conjugation-`);

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

// --- Underwear, footwear & accessories (p.4) — missed vocabulary subcategory ---
vocabWord("靴", "くつ", "shoe", 4);
vocabWord("靴下", "くつした", "sock", 4);
vocabWord(undefined, "タイツ", "tights", 4);
vocabWord("下着", "したぎ", "underwear", 4);
vocabWord(undefined, "スニーカー", "sneaker", 4);
vocabWord(undefined, "スリッパ", "slipper", 4);
vocabWord(undefined, "ハイヒール", "high heels", 4);
vocabWord("手袋", "てぶくろ", "glove", 4);
vocabWord(undefined, "マフラー", "scarf, muffler", 4);
vocabWord(undefined, "メガネ", "glasses", 4);
vocabWord(undefined, "ネクタイ", "tie", 4);
vocabWord(undefined, "ブレスレット", "bracelet", 4);
vocabWord(undefined, "ネックレス", "necklace", 4);
vocabWord("指輪", "ゆびわ", "ring", 4);
vocabWord(undefined, "イヤリング", "earring", 4);
vocabWord("帽子", "ぼうし", "hat", 4);
vocabWord(undefined, "キャップ", "cap", 4);
vocabWord("時計", "とけい", "watch", 4);
vocabWord("味わう", "あじわう", "to taste", 6, ["verb-godan"]);
vocabWord("描く", "えがく・かく", "to imagine / draw", 6, ["verb-godan"]);
vocabWord("任せる", "まかせる", "to let, to entrust", 6, ["verb-ichidan"]);
vocabWord(undefined, "はげの", "bald", 7, ["no-adjective"]);

// --- "Park" comprehensible-input reading (p.5) ---
const parkLines: [string, string, string][] = [
  ["レオさんと友だちは公園に行った。", "レオさんとともだちはこうえんにいった。", "Leo and his friend went to the park."],
  ["二人は靴を脱いで、公園で座って休んだ。", "ふたりはくつをぬいで、こうえんですわってやすんだ。", "The two of them took off their shoes and sat down in the park to rest."],
  ["レオさんは本を読んだ。", "レオさんはほんをよんだ。", "Leo read a book."],
  ["友だちは公園で座っている男の人を描いた。", "ともだちはこうえんですわっているおとこのひとをかいた。", "His friend drew a man who was sitting in the park."],
  ["その男の人は青いズボンと赤い Tシャツを着た。", "そのおとこのひとはあおいズボンとあかいティーシャツをきた。", "The man was wearing blue pants and a red T-shirt."],
  ["茶髪の人だった。", "ちゃぱつのひとだった。", "He had brown hair."],
  ["公園で踊ったり歌ったりしている人たちがいた。", "こうえんでおどったりうたったりしているひとたちがいた。", "There were people dancing and singing in the park."],
  ["友だちは男の人に絵を見せるために立った。", "ともだちはおとこのひとにえをみせるためにたった。", "Leo's friend stood up to show the man the drawing."],
  ["でも、転んだ。", "でも、ころんだ。", "But he fell down."],
  ["レオさんは笑った。", "レオさんはわらった。", "Leo laughed."],
];
dialogues.push({
  id: `${LESSON_ID}-dialogue-001`,
  title: "公園で (At the park) — comprehensible input reading passage",
  lines: parkLines.map(([jp, reading, en]) => ({ japanese: jp, reading, meanings: [{ en }] })),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 5 }],
});

// --- Conditional forms (p.8-9) ---
const toCondExamples = [example("スーパーに行くと、お水を買う。", "When I go to the supermarket, I buy water.", 8)];
const taraCondExamples = [
  example("日本語を話したら、日本に住んでいる。", "If I speak Japanese, I'd live in Japan.", 8),
  example("時間があったら、勉強します。", "If I had time, I would study.", 8),
];
const naraCondExamples = [
  example("出るなら、パンを買ってください。", "If you're leaving/As you're leaving, buy some bread.", 8),
  example("雨なら行きません。", "If it's raining/As it is raining, I won't go.", 8),
];
const baCondExamples = [
  example("行けば、わかる。", "If you go, you'll understand.", 9),
  example("見れば、わかる。", "If you see it, you'll understand.", 9),
];
const nakerebaCondExamples = [
  example("来なければ、わからない。", "If you don't come, you won't understand.", 9),
  example("私と遊ばなければ、嬉しくない。", "If you don't play with me, I won't be happy.", 9),
];
examples.push(...toCondExamples, ...taraCondExamples, ...naraCondExamples, ...baCondExamples, ...nakerebaCondExamples);

conjugation.push(
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "dictionary",
    explanation: [{ en: "Conditional と (general facts/habits — \"whenever X, Y always happens\"): plain dictionary or negative form + と. 飲むと (if/when you drink), 書かないと (if/when you don't write)." }],
    examples: [
      { form: "dictionary", surface: "飲むと", reading: "のむと" },
      { form: "dictionary", surface: "書かないと", reading: "かかないと" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 8 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "ta",
    explanation: [{ en: "Conditional たら (hypothetical situation, wish, will, request): ta-form + ら. 飲んだら (what if you drink), 食べたら (what if you eat), 書いたら (what if you write)." }],
    examples: [
      { form: "ta", surface: "飲んだら", reading: "のんだら" },
      { form: "ta", surface: "書いたら", reading: "かいたら" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 8 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "dictionary",
    explanation: [
      { en: "Conditional なら (based on prior context/assumption, advice, request; also usable directly after a noun): verb + なら, noun + なら. 飲むなら (if/as you're drinking), 雨なら (if/as it's raining)." },
    ],
    examples: [
      { form: "dictionary", surface: "飲むなら", reading: "のむなら" },
      { form: "dictionary", surface: "雨なら", reading: "あめなら" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 8 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "dictionary",
    explanation: [
      {
        en: "Conditional ば/れば (emphasizes the condition itself): godan -e stem + ば (飲む→飲め→飲めば, 書く→書け→書けば); ichidan -e stem + れば (食べる→食べ→食べれば). Negative: -a stem + なければ (飲まなければ = if you don't drink).",
      },
    ],
    examples: [
      { form: "dictionary", surface: "飲めば", reading: "のめば" },
      { form: "dictionary", surface: "書けば", reading: "かけば" },
      { form: "dictionary", surface: "食べれば", reading: "たべれば" },
      { form: "nakatta", surface: "飲まなければ", reading: "のまなければ" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 9 }],
  },
);

grammar.push({
  id: nextGrammarId(),
  pattern: "Conditional forms (と / たら / なら / ば・れば)",
  explanation: [
    {
      en: "Japanese has four main conditional patterns, chosen by nuance rather than being interchangeable. と = general facts/habits, \"whenever X happens, Y always follows\" (スーパーに行くと、お水を買う). たら (ta-form+ら) = a hypothetical situation, wish, or request (時間があったら、勉強します = if I had time, I would study). なら = based on context already established, giving advice or making a request about it (雨なら行きません = since/if it's raining, I won't go). ば/れば (godan -e stem+ば, ichidan -e stem+れば; negative -a stem+なければ) emphasizes the condition itself (行けば、わかる = if you go, you'll understand).",
    },
  ],
  examples: [...toCondExamples, ...taraCondExamples, ...naraCondExamples, ...baCondExamples, ...nakerebaCondExamples],
  relatedConjugationRuleIds: conjugation.slice(-4).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 8 }, { file: FILE, page: 9 }],
});

// --- Must / have to (p.10) ---
const mustExamples = [
  example("日本語を勉強しなければならない。", "You have to study Japanese.", 10),
  example("私と遊ばなきゃ。", "You have to play with me. [casual]", 10),
];
examples.push(...mustExamples);
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "nakatta",
  explanation: [
    { en: "\"Must/have to [verb]\": -a stem + なければ + ならない (casually shortened to -a stem + なきゃ, ならない optional). 飲まなければならない = have to drink." },
  ],
  examples: [
    { form: "nakatta", surface: "飲まなければならない", reading: "のまなければならない" },
    { form: "nakatta", surface: "遊ばなきゃ", reading: "あそばなきゃ" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 10 }],
});
grammar.push({
  id: nextGrammarId(),
  pattern: "Must / have to (なければならない)",
  explanation: [{ en: "\"Must/have to [verb]\" = -a stem + なければならない, casually shortened to -a stem + なきゃ (ならない can be dropped in casual speech)." }],
  examples: mustExamples,
  relatedConjugationRuleIds: [conjugation[conjugation.length - 1].id],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 10 }],
});

// --- Should (not) (p.11) ---
const shouldExamples = [
  example("水をたくさん飲んだほうがいいです。", "You should drink a lot of water.", 11),
  example("早く寝たほうがいいです。", "You should sleep early.", 11),
  example("彼と話さないほうがいいです。", "You should not speak with him.", 11),
  example("今寝ないほうがいいです。", "You should not sleep now.", 11),
];
examples.push(...shouldExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Should (not) (ほうがいい)",
  explanation: [
    { en: "\"Should [verb]\" = ta-form + ほうがいい(です): 飲んだほうがいい(です) = should drink. \"Should not [verb]\" = -a stem + ない + ほうがいい(です): 飲まないほうがいい(です) = should not drink." },
  ],
  examples: shouldExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 11 }],
});

// --- Non-exhaustive list of actions (p.12) ---
const tariExamples = [
  example("今日、パンを食べたり、水を飲んだり、本を読んだりする。", "Today, I will eat bread, drink water, read a book, etc.", 12),
  example("今日、パンを食べたり、水を飲んだり、本を読んだりした。", "Today, I ate bread, drank water, read a book, etc.", 12),
];
examples.push(...tariExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Non-exhaustive list of actions (たり...たりする)",
  explanation: [
    {
      en: "To list example actions non-exhaustively (\"do things like X, Y, Z, etc.\"): ta-form + り, repeated for each action, + する (conjugated for tense): パンを食べたり、水を飲んだり、本を読んだりする (I do things like eat bread, drink water, read a book).",
    },
  ],
  examples: tariExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 12 }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(conjugationPath, conjugation);
saveOwnArray(dialoguesPath, dialogues);

console.log(
  `${LESSON_ID}: ${vocab.length} vocab, ${examples.length} examples, ${grammar.length} grammar, ` +
    `${conjugation.length} conjugation, ${dialogues.length} dialogues.`,
);
