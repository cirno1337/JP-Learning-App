import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { DialogueEntry, ExampleSentence, GrammarEntry, NumberEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/time/vocabulary content for class-07, transcribed
 * from "Class N°07 - synthesis & assignments.pdf" pages 5-14 (see
 * scripts/extract/.cache/class-07-remainder.txt): the "Leo at school"
 * comprehensible-input reading, hour/minute time-telling counters and time
 * sentence structure, relative time adverbs, verb nominalisation, and more
 * particles.
 *
 * Usage: tsx scripts/extract/manual/class-07-grammar.ts
 */

const FILE = "Class N°07 - synthesis & assignments.pdf";
const LESSON_ID = "class-07";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;
const numbersPath = `src/data/numbers/${LESSON_ID}.json`;

const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);
const numbers = loadOwnArray<NumberEntry>(numbersPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
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

// --- "Leo at school" comprehensible-input reading (p.5-6) ---
const leoLines: [string, string, string][] = [
  ["レオさんは学校にいた。", "レオさんは がっこう に いた。", "Leo was at school."],
  ["レオさんは英語を勉強した。", "レオさんは えいご を べんきょう した。", "Leo studied English."],
  ["先生は英語を教えていた。", "せんせい は えいご を おしえて いた。", "The teacher was teaching English."],
  ["先生は定規を持っていた。", "せんせい は じょうぎ を もって いた。", "The teacher was holding a ruler."],
  ["学生は日本語から英語へ訳した。", "がくせい は にほんご から えいご へ やくした。", "The students translated from Japanese into English."],
  ["でも、レオさんは皿を英語で何と言うか忘れた。", "でも、レオさんはさらをえいごでなんというかわすれた。", 'However, Leo forgot how to say "plate" in English.'],
  ["友だちは「『皿』は英語で『plate』だ」と言った。", "ともだち は「『さら』は えいご で『plate』だ」と いった。", 'His friend said, "The English word for ‘皿’ is ‘plate.’"'],
  ["今、レオさんは思い出した。", "いま、レオさん は おもいだした。", "Now, Leo remembered it."],
  ["この単語を覚えた。", "この たんご を おぼえた。", "He memorized this word."],
  ["先生はクラスに聞いた。「『皿』は英語で何ですか？」", "せんせい は くらす に きいた。「『さら』は えいご で なん ですか？」", 'The teacher asked the class, "What is ‘皿’ in English?"'],
  ["レオさんは「plate」と答えた。", "レオさん は「plate」と こたえた。", 'Leo answered, "Plate."'],
  ["先生は嬉しかった。でも、レオさんの友だちはイライラしていた。", "せんせい は うれしかった。でも、レオさん の ともだち は いらいら していた。", "The teacher was happy, but Leo's friend was irritated."],
];
dialogues.push({
  id: `${LESSON_ID}-dialogue-001`,
  title: "レオさん (Leo at school) — comprehensible input reading passage",
  lines: leoLines.map(([jp, reading, en]) => ({ japanese: jp, reading, meanings: [{ en }] })),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 5, note: "Reading passage spans pages 5-6" }],
});

// --- Time: hour & minute counters (p.9-11) ---
const hourReadings = ["いちじ", "にじ", "さんじ", "よじ", "ごじ", "ろくじ", "しちじ / ななじ", "はちじ", "くじ", "じゅうじ"];
const minuteReadings = ["いっぷん", "にふん", "さんぷん", "よんぷん", "ごふん", "ろっぷん", "ななふん", "はっぷん", "きゅうふん", "じゅっぷん"];
const numeralKanji = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
for (let n = 1; n <= 10; n++) {
  numbers.push({
    id: nextNumberId(),
    category: "time",
    value: n,
    japanese: `${numeralKanji[n - 1]}時`,
    reading: hourReadings[n - 1],
    counter: "時",
    irregular: n === 4 || n === 7,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 9 }],
  });
}
for (let n = 1; n <= 10; n++) {
  numbers.push({
    id: nextNumberId(),
    category: "time",
    value: n,
    japanese: `${numeralKanji[n - 1]}分`,
    reading: minuteReadings[n - 1],
    counter: "分",
    irregular: [1, 3, 4, 6, 8, 10].includes(n),
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 10 }],
  });
}

const timeExamples = [
  example("四時十分です。", "It is 04:10.", 11, "よじじゅっぷんです。"),
  example("四時十分に", "at 04:10", 11, "よじじゅっぷんに"),
  example("午前五時三十五分です。", "It is 05:35 (am).", 11, "ごぜんごじさんじゅうごふんです。"),
  example("午後十一時五十二分です。", "It is 23:52 (11:52 pm).", 11, "ごごじゅういちじごじゅうにふんです。"),
  example("九時半です。", "It is 09:30.", 11, "くじはんです。"),
  example("何時ですか。", "What time is it?", 11, "なんじですか。"),
];
examples.push(...timeExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Telling the time",
  explanation: [
    {
      en: "Time uses two counters: 時(じ) for the hour (irregular readings for 4=よじ, 7=しちじ/ななじ) and 分(ふん/ぷん) for the minute (irregular readings depending on the preceding number, e.g. 一分=いっぷん, 三分=さんぷん). To state the time: hour-counter + minute-counter + だ/です. To say \"at [time]\": hour-counter + minute-counter + に. 午前(ごぜん)/午後(ごご) mark am/pm, placed at the start. 半(はん) can replace the minute counter for a half hour (九時半 = 9:30). To ask the time, use 何(なん) — the question-word form for whatever takes a counter — + 時: 何時ですか.",
    },
  ],
  examples: timeExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 9 }, { file: FILE, page: 10 }, { file: FILE, page: 11 }],
});

// --- Adverbs of time (p.12) ---
vocabWord("昨日", "きのう", "yesterday", 12, ["adverb"]);
vocabWord("今日", "きょう", "today", 12, ["adverb"]);
vocabWord("明日", "あした", "tomorrow", 12, ["adverb"]);
vocabWord("先週", "せんしゅう", "last week", 12, ["adverb"]);
vocabWord("今週", "こんしゅう", "this week", 12, ["adverb"]);
vocabWord("来週", "らいしゅう", "next week", 12, ["adverb"]);
vocabWord("先月", "せんげつ", "last month", 12, ["adverb"]);
vocabWord("今月", "こんげつ", "this month", 12, ["adverb"]);
vocabWord("来月", "らいげつ", "next month", 12, ["adverb"]);
vocabWord("去年", "きょねん", "last year", 12, ["adverb"]);
vocabWord("今年", "ことし", "this year", 12, ["adverb"]);
vocabWord("来年", "らいねん", "next year", 12, ["adverb"]);
vocabWord(undefined, "さっき", "a moment ago", 12, ["adverb"]);
vocabWord("後で", "あとで", "after, later", 12, ["adverb"]);
vocabWord("前に", "まえに", "before", 12, ["adverb"]);
vocabWord("時間", "じかん", "hour [as a duration]", 12);

const relativeTimeExamples = [
  example("二時間前", "two hours ago", 12, "にじかんまえ"),
  example("二年後", "in two years", 12, "にねんご"),
  example("明日の朝", "tomorrow morning", 12, "あしたのあさ"),
  example("昨日の夜", "last night", 12, "きのうのよる"),
];
examples.push(...relativeTimeExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Relative time adverbs",
  explanation: [
    {
      en: "A four-way previous/now/next/every pattern recurs across time units: day 昨日/今日/明日/毎日, week 先週/今週/来週/毎週, month 先月/今月/来月/毎月, year 去年/今年/来年/毎年. For moments: さっき (a moment ago), 今 (now), 後で (after/later), 前に (before). To say \"[time] ago\" or \"in [time]\", add 前(まえ) or 後(ご) after a duration — note the hour-as-duration word is 時間(じかん), distinct from the time-of-day counter 時. Time expressions can combine: 明日の朝 (tomorrow morning), 昨日の夜 (last night).",
    },
  ],
  examples: relativeTimeExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 12 }],
});

// --- Nominalisation (p.13) ---
const nominalisationExamples = [
  example("読むのが好き。", "I like reading.", 13, "よむのがすき。"),
  example("読むことが好き。", "I like reading.", 13, "よむことがすき。"),
  example("玉ねぎを切るのは難しいです。", "Cutting onions is difficult.", 13, "たまねぎをきるのはむずかしいです。"),
  example("玉ねぎを切ることは難しいです。", "Cutting onions is difficult.", 13, "たまねぎをきることはむずかしいです。"),
];
examples.push(...nominalisationExamples);
vocabWord("食べ物", "たべもの", "food", 13);
vocabWord("飲み物", "のみもの", "drink, beverage", 13);
vocabWord("買い物", "かいもの", "shopping, groceries", 13);
vocabWord("着物", "きもの", "clothing, kimono", 13);

grammar.push({
  id: nextGrammarId(),
  pattern: "Nominalisation (turning a verb into a noun)",
  explanation: [
    {
      en: "Two ways to turn a verb phrase into a noun: (1) dictionary (u-stem) form + の or + こと(事) — interchangeable in most cases: 読むのが好き = 読むことが好き = I like reading. (2) For a small set of specific verbs, the -i (masu) stem alone becomes a concrete noun: 食べる→食べ物 (food), 飲む→飲み物 (drink), 買う→買い物 (shopping/groceries), 着る→着物 (clothing/kimono) — this is lexicalised (only works for these specific words), unlike the general の/こと pattern.",
    },
  ],
  examples: nominalisationExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 13 }],
});

// --- More particles (p.14) ---
const deInstrument = example("スプーンで食べる。", "I eat with a spoon.", 14);
const madeUntil = example("月曜日から金曜日まで働きます。", "I work from Monday until Friday.", 14);
const yaEtc = example("りんごやバナナを食べます。", "I eat apples, bananas, etc.", 14);
const kaOr = example("コーヒーかお茶を飲みます。", "I drink coffee or tea.", 14);
const neFeminine = example("今日は暑いですね。", "It's hot today, isn't it? [feminine/neutral]", 14);
const naMasculine = example("今日は暑いですな。", "It's hot today, isn't it? [masculine]", 14);
const neConfirmF = example("このケーキ、おいしいね。", "This cake is [indeed] delicious. [feminine/neutral]", 14);
const naConfirmM = example("このケーキ、おいしいな。", "This cake is [indeed] delicious. [masculine]", 14);
const nodaExplain = example("明日行くのだ。", "I am going tomorrow. [explanatory/emphatic]", 14);
const moreParticleExamples = [deInstrument, madeUntil, yaEtc, kaOr, neFeminine, naMasculine, neConfirmF, naConfirmM, nodaExplain];
examples.push(...moreParticleExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "More particles (で, まで, や, か, ね/な, のだ)",
  explanation: [
    {
      en: "で = instrument/means (スプーンで食べる = I eat with a spoon); まで = until/to (月曜日から金曜日まで = from Monday until Friday); や = \"and ... etc.\" for a non-exhaustive noun list (りんごやバナナ = apples, bananas, etc.); か = or (コーヒーかお茶 = coffee or tea); ね (feminine/neutral) and な (masculine) at the end of a sentence ask for agreement (\"isn't it?\") or add confirmation/emphasis (\"[indeed]\"); のだ adds an explanatory or emphatic nuance to a statement.",
    },
  ],
  particles: [
    { particle: "で", meaning: [{ en: "instrument" }], exampleSentenceId: deInstrument.id },
    { particle: "まで", meaning: [{ en: "until, to" }], exampleSentenceId: madeUntil.id },
    { particle: "や", meaning: [{ en: "and ... etc. [non-exhaustive list]" }], exampleSentenceId: yaEtc.id },
    { particle: "か", meaning: [{ en: "or" }], exampleSentenceId: kaOr.id },
    { particle: "ね", meaning: [{ en: "isn't it? [feminine/neutral]" }], exampleSentenceId: neFeminine.id },
    { particle: "な", meaning: [{ en: "isn't it? [masculine]" }], exampleSentenceId: naMasculine.id },
    { particle: "のだ", meaning: [{ en: "explanation/accentuation" }], exampleSentenceId: nodaExplain.id },
  ],
  examples: moreParticleExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 14 }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(dialoguesPath, dialogues);
saveOwnArray(numbersPath, numbers);

console.log(
  `${LESSON_ID}: ${vocab.length} vocab, ${examples.length} examples, ${grammar.length} grammar, ` +
    `${numbers.length} numbers, ${dialogues.length} dialogues.`,
);
