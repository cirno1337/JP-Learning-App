import {
  loadOwnArray,
  saveOwnArray,
  makeIdSequencer,
  loadCrossLessonIndex,
  writeDirtyExternalFiles,
  addOrMergeVocab,
} from "../lib/lessonFile";
import type {
  ConjugationRule,
  ExampleSentence,
  GrammarEntry,
  NumberCategory,
  NumberEntry,
  VocabularyEntry,
} from "../../../src/data/types";

/**
 * Hand-authored content for class-02, transcribed from "CLASS N°02 — The
 * Japanese Summer Challenge.pdf" (135 pages, no synthesis doc exists for
 * this class). Same method as class-01: vocabulary section (pages 3-57)
 * read visually from rendered images (furigana-over-kanji layout scrambles
 * in pdftotext); conjugation/grammar sections (58-135) extract cleanly as
 * text. Kanji themselves are not re-extracted (already covered by KANJI -
 * SET N°02); "kanji related to the vocabulary" component/radical pages are
 * skipped as supplementary etymology, same rationale as class-01.
 *
 * Content:
 * - Vocabulary: people (p.5), general vocabulary (p.10), nature (p.17),
 *   in a room (p.30), time (p.41), family II (p.50).
 * - Conjugation/grammar: verbs of the week (p.58-68), te-form incl.
 *   exceptions (p.69-99), present continuous (p.91-99), other uses of the
 *   te-form: imperative/"may I"/combining verbs (p.100-103), numbers 11 to
 *   10,000 (p.105-116), 5 basic counter systems 1-10 (p.117-135: general
 *   つ, small objects 個, age 歳, people 人, small animals 匹).
 *
 * Usage: tsx scripts/extract/manual/class-02-content.ts
 */

const FILE = "CLASS N°02 — The Japanese Summer Challenge.pdf";
const LESSON_ID = "class-02";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const conjugationPath = `src/data/conjugation/${LESSON_ID}.json`;
const numbersPath = `src/data/numbers/${LESSON_ID}.json`;

const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const conjugation = loadOwnArray<ConjugationRule>(conjugationPath);
const numbers = loadOwnArray<NumberEntry>(numbersPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
const nextConjugationId = makeIdSequencer(conjugation, `${LESSON_ID}-conjugation-`);
const nextNumberId = makeIdSequencer(numbers, `${LESSON_ID}-number-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();

function vocabWord(
  kanji: string | undefined,
  kana: string,
  meaning: string,
  page: number,
  pos?: VocabularyEntry["partOfSpeech"],
) {
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

// =====================================================================
// VOCABULARY: People (p.5)
// =====================================================================
vocabWord("男の人", "おとこのひと", "man", 5, ["noun"]);
vocabWord("女の人", "おんなのひと", "woman", 5, ["noun"]);
vocabWord("男の子", "おとこのこ", "boy", 5, ["noun"]);
vocabWord("女の子", "おんなのこ", "girl", 5, ["noun"]);

// =====================================================================
// VOCABULARY: General Vocabulary (p.10)
// =====================================================================
vocabWord(undefined, "サッカー", "soccer", 10, ["noun"]);
vocabWord(undefined, "バスケットボール", "basketball", 10, ["noun"]);
vocabWord("車", "くるま", "car", 10, ["noun"]);
vocabWord("新聞", "しんぶん", "newspaper", 10, ["noun"]);
vocabWord(undefined, "ケーキ", "cake", 10, ["noun"]);
vocabWord("牛乳", "ぎゅうにゅう", "milk", 10, ["noun"]);

// =====================================================================
// VOCABULARY: Nature (p.17)
// =====================================================================
vocabWord("自然", "しぜん", "nature", 17, ["noun"]);
vocabWord("太陽", "たいよう", "sun", 17, ["noun"]);
vocabWord("雲", "くも", "cloud", 17, ["noun"]);
vocabWord("山", "やま", "mountain", 17, ["noun"]);
vocabWord("町", "まち", "town", 17, ["noun"]);
vocabWord("月", "つき", "moon", 17, ["noun"]);
vocabWord("星", "ほし", "star", 17, ["noun"]);
vocabWord("風景", "ふうけい", "scenery, landscape", 17, ["noun"]);
vocabWord("木", "き", "tree", 17, ["noun"]);
vocabWord("風", "かぜ", "wind", 17, ["noun"]);
vocabWord("国", "くに", "country", 17, ["noun"]);
vocabWord("海", "うみ", "sea", 17, ["noun"]);
vocabWord("通り", "とおり", "street, avenue", 17, ["noun"]);

// =====================================================================
// VOCABULARY: In a Room (p.30)
// =====================================================================
vocabWord("部屋", "へや", "room", 30, ["noun"]);
vocabWord("寝室", "しんしつ", "bedroom", 30, ["noun"]);
vocabWord(undefined, "ラジオ", "radio", 30, ["noun"]);
vocabWord(undefined, "ドア", "door", 30, ["noun"]);
vocabWord("椅子", "いす", "chair", 30, ["noun"]);
vocabWord("窓", "まど", "window", 30, ["noun"]);
vocabWord("音楽", "おんがく", "music", 30, ["noun"]);
vocabWord("電話", "でんわ", "telephone", 30, ["noun"]);
vocabWord("お金", "おかね", "money", 30, ["noun"]);

// =====================================================================
// VOCABULARY: Time (p.41)
// =====================================================================
vocabWord("朝", "あさ", "morning", 41, ["noun"]);
vocabWord("日", "ひ", "day, sun", 41, ["noun"]);
vocabWord("分", "ふん", "minute [as a concept/word, not the counter]", 41, ["noun"]);
vocabWord("時", "とき", "time, moment [as opposed to じ, the hour-counter reading]", 41, ["noun"]);
vocabWord("晩", "ばん", "evening", 41, ["noun"]);
vocabWord("夜", "よる", "night", 41, ["noun"]);
vocabWord("今日", "きょう", "today", 41, ["noun"]);
vocabWord("今", "いま", "now", 41, ["noun"]);

// =====================================================================
// VOCABULARY: Family (II) (p.50)
// =====================================================================
vocabWord("両親", "りょうしん", "parents", 50, ["noun"]);
vocabWord("祖父", "そふ", "grandfather", 50, ["noun"]);
vocabWord("祖父母", "そふぼ", "grandparents", 50, ["noun"]);
vocabWord("祖母", "そぼ", "grandmother", 50, ["noun"]);
vocabWord("子ども", "こども", "child", 50, ["noun"]);
vocabWord("息子", "むすこ", "son", 50, ["noun"]);
vocabWord("娘", "むすめ", "daughter", 50, ["noun"]);

// =====================================================================
// GRAMMAR: Verbs of the Week (p.58-68)
// =====================================================================
vocabWord("言う", "いう", "to say [godan]", 58, ["verb-godan"]);
vocabWord("聞く", "きく", "to hear / to listen / to ask [godan]", 58, ["verb-godan"]);
vocabWord("待つ", "まつ", "to wait [godan]", 58, ["verb-godan"]);
vocabWord("知る", "しる", "to know [godan]", 58, ["verb-godan"]);
vocabWord("遊ぶ", "あそぶ", "to play [godan]", 58, ["verb-godan"]);
vocabWord("泳ぐ", "およぐ", "to swim [godan]", 58, ["verb-godan"]);
vocabWord("死ぬ", "しぬ", "to die [godan]", 58, ["verb-godan"]);
vocabWord("分かる", "わかる", "to understand [godan]", 58, ["verb-godan"]);
vocabWord("寝る", "ねる", "to sleep [ichidan]", 58, ["verb-ichidan"]);
vocabWord("勉強する", "べんきょうする", "to study [irregular, noun+する]", 58, ["verb-irregular"]);

// =====================================================================
// GRAMMAR: Te-form (p.69-99)
// =====================================================================
conjugation.push(
  {
    id: nextConjugationId(),
    appliesTo: "verb-ichidan",
    form: "te",
    explanation: [
      { en: "The te-form is used to build tenses/sentences like present continuous, imperative, and combining verbs. Ichidan verbs have one single pattern: remove る, add て. 食べる→食べて, 見る→見て, 寝る→寝て." },
    ],
    examples: [
      { form: "te", surface: "食べて", reading: "たべて" },
      { form: "te", surface: "見て", reading: "みて" },
      { form: "te", surface: "寝て", reading: "ねて" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 69 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "te",
    explanation: [
      {
        en: "Godan verbs have 5 te-form sound-change patterns based on the dictionary-form ending: う/つ/る→って (言う→言って, 待つ→待って, 知る→知って); ぬ/む/ぶ→んで (死ぬ→死んで, 飲む→飲んで, 遊ぶ→遊んで); く→いて (聞く→聞いて); ぐ→いで (泳ぐ→泳いで); す→して (話す→話して). Mnemonic: ぬ/む/ぶ→んで sounds like \"Namibia\" / the sentence お前は死んでいる。なに！; す→して, think \"sushi\" (す→し).",
      },
    ],
    examples: [
      { form: "te", surface: "言って", reading: "いって" },
      { form: "te", surface: "待って", reading: "まって" },
      { form: "te", surface: "知って", reading: "しって" },
      { form: "te", surface: "死んで", reading: "しんで" },
      { form: "te", surface: "遊んで", reading: "あそんで" },
      { form: "te", surface: "聞いて", reading: "きいて" },
      { form: "te", surface: "泳いで", reading: "およいで" },
      { form: "te", surface: "話して", reading: "はなして" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 78 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-irregular",
    form: "te",
    explanation: [{ en: "Te-form exceptions: だ→だって, 行く(いく)→行って(いって) [not the regular く→いて pattern], 来る(くる)→来て(きて), する→して." }],
    examples: [
      { form: "te", surface: "だって" },
      { form: "te", surface: "行って", reading: "いって" },
      { form: "te", surface: "来て", reading: "きて" },
      { form: "te", surface: "して" },
    ],
    exceptions: ["行く → 行って (not 行いて)"],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 89 }],
  },
);
grammar.push({
  id: nextGrammarId(),
  pattern: "Te-form",
  explanation: [
    {
      en: "The te-form is a connective conjugation used to build the present continuous, imperative, combined-verb sentences, and more. Ichidan verbs: drop る, add て. Godan verbs: 5 sound-change patterns depending on the dictionary ending (う/つ/る→って, ぬ/む/ぶ→んで, く→いて, ぐ→いで, す→して). Exceptions: だ→だって, 行く→行って, 来る→来て, する→して.",
    },
  ],
  examples: [],
  relatedConjugationRuleIds: conjugation.slice(-3).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 69 }, { file: FILE, page: 89 }],
});

// =====================================================================
// GRAMMAR: Present continuous (p.91-99)
// =====================================================================
const presentContinuousExamples = [
  example("食べている。", "I am eating. [casual]", 91, "たべている。"),
  example("食べていない。", "I am not eating. [casual]", 91, "たべていない。"),
  example("食べています。", "I am eating. [polite]", 91, "たべています。"),
  example("食べていません。", "I am not eating. [polite]", 91, "たべていません。"),
];
examples.push(...presentContinuousExamples);
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-ichidan",
  form: "te",
  explanation: [
    {
      en: "Present continuous (\"[verb]-ing\") = te-form + いる (itself an ichidan verb, conjugated as taught in Class N°01: いる/いない/います/いません). Example with 食べる: 食べている (casual affirmative), 食べていない (casual negative), 食べています (polite affirmative), 食べていません (polite negative).",
    },
  ],
  examples: [
    { form: "te", surface: "食べている", reading: "たべている" },
    { form: "te", surface: "食べていない", reading: "たべていない" },
    { form: "te", surface: "食べています", reading: "たべています" },
    { form: "te", surface: "食べていません", reading: "たべていません" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 91 }],
});
grammar.push({
  id: nextGrammarId(),
  pattern: "Present continuous (て + いる)",
  explanation: [{ en: "The present continuous is formed with te-form + いる, which itself conjugates for politeness/negation (いる/いない/います/いません) exactly as taught for いる in Class N°01." }],
  examples: presentContinuousExamples,
  relatedConjugationRuleIds: [conjugation[conjugation.length - 1].id],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 91 }],
});

// =====================================================================
// GRAMMAR: Other uses of the te-form (p.100-103)
// =====================================================================
const teImperativeExamples = [
  example("食べて。", "Eat!", 100),
  example("読んで。", "Read!", 100, "よんで。"),
  example("聞いて。", "Listen!", 100, "きいて。"),
  example("食べてください。", "Eat, please. [polite]", 100),
  example("読んでください。", "Read, please. [polite]", 100, "よんでください。"),
  example("食べてくれ。", "Eat! [direct, masculine request]", 100),
];
const teMayIExamples = [
  example("食べてもいい。", "May I eat?", 101),
  example("読んでもいい。", "May I read?", 101, "よんでもいい。"),
  example("食べてもいいですか。", "May I eat? [polite]", 101),
];
const teCombineExamples = [
  example("本を読んで、寝る。", "I read a book and sleep.", 102, "ほんをよんで、ねる。"),
  example("パンを食べて、水を飲む。", "I eat bread and drink water.", 102, "パンをたべて、みずをのむ。"),
  example("寿司を食べて、テレビを見ます。", "I eat sushi and watch TV.", 102, "すしをたべて、テレビをみます。"),
  example("本を読んで、お茶を飲んで、寝ます。", "I read a book, drink tea, and go to bed.", 102, "ほんをよんで、おちゃをのんで、ねます。"),
];
examples.push(...teImperativeExamples, ...teMayIExamples, ...teCombineExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Other uses of the te-form",
  explanation: [
    {
      en: "Beyond the present continuous, the te-form has several other uses. (1) Informal imperative: te-form alone (食べて = eat!); + ください for a polite order (食べてください); + くれ for a direct/familiar/masculine request (食べてくれ). (2) \"May I...?\": te-form + もいい (食べてもいい), + ですか for politeness (食べてもいいですか). (3) Combining verbs in sequence: every verb but the last takes the te-form (unchanged for tense), only the final verb is conjugated for the sentence's actual tense — 本を読んで、寝る = I read a book and [then] sleep.",
    },
  ],
  examples: [...teImperativeExamples, ...teMayIExamples, ...teCombineExamples],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 100 }, { file: FILE, page: 101 }, { file: FILE, page: 102 }],
});

// =====================================================================
// GRAMMAR: Numbers from 11 to 10,000 (p.105-116)
// =====================================================================
const teenNumbers: [string, string, number][] = [
  ["十一", "じゅういち", 11], ["十二", "じゅうに", 12], ["十三", "じゅうさん", 13], ["十四", "じゅうよん", 14],
  ["十五", "じゅうご", 15], ["十六", "じゅうろく", 16], ["十七", "じゅうなな", 17], ["十八", "じゅうはち", 18], ["十九", "じゅうきゅう", 19],
];
const tensNumbers: [string, string, number][] = [
  ["二十", "にじゅう", 20], ["三十", "さんじゅう", 30], ["四十", "よんじゅう", 40], ["五十", "ごじゅう", 50],
  ["六十", "ろくじゅう", 60], ["七十", "ななじゅう", 70], ["八十", "はちじゅう", 80], ["九十", "きゅうじゅう", 90],
];
const hundredsNumbers: [string, string, number, boolean][] = [
  ["百", "ひゃく", 100, false], ["二百", "にひゃく", 200, false], ["三百", "さんびゃく", 300, true], ["四百", "よんひゃく", 400, false],
  ["五百", "ごひゃく", 500, false], ["六百", "ろっぴゃく", 600, true], ["七百", "ななひゃく", 700, false], ["八百", "はっぴゃく", 800, true], ["九百", "きゅうひゃく", 900, false],
];
const thousandsNumbers: [string, string, number, boolean][] = [
  ["千", "せん", 1000, false], ["二千", "にせん", 2000, false], ["三千", "さんぜん", 3000, true], ["四千", "よんせん", 4000, false],
  ["五千", "ごせん", 5000, false], ["六千", "ろくせん", 6000, false], ["七千", "ななせん", 7000, false], ["八千", "はっせん", 8000, true], ["九千", "きゅうせん", 9000, false],
];
for (const [japanese, reading, value] of teenNumbers) {
  numbers.push({ id: nextNumberId(), category: "cardinal", value, japanese, reading, lessonIds: [LESSON_ID], origin: "course", source: [{ file: FILE, page: 105 }] });
}
for (const [japanese, reading, value] of tensNumbers) {
  numbers.push({ id: nextNumberId(), category: "cardinal", value, japanese, reading, lessonIds: [LESSON_ID], origin: "course", source: [{ file: FILE, page: 106 }] });
}
for (const [japanese, reading, value, irregular] of hundredsNumbers) {
  numbers.push({ id: nextNumberId(), category: "cardinal", value, japanese, reading, irregular, lessonIds: [LESSON_ID], origin: "course", source: [{ file: FILE, page: 109 }] });
}
for (const [japanese, reading, value, irregular] of thousandsNumbers) {
  numbers.push({ id: nextNumberId(), category: "cardinal", value, japanese, reading, irregular, lessonIds: [LESSON_ID], origin: "course", source: [{ file: FILE, page: 110 }] });
}
numbers.push({ id: nextNumberId(), category: "cardinal", value: 10000, japanese: "万", reading: "まん", lessonIds: [LESSON_ID], origin: "course", source: [{ file: FILE, page: 110 }] });

const bigNumberExamples = [
  example("百二十三", "123 (百＋二×十＋三)", 112, "ひゃくにじゅうさん"),
  example("三百六十五", "365 (三×百＋六×十＋五)", 112, "さんびゃくろくじゅうご"),
  example("千五百八十二", "1582 (千＋五×百＋八×十＋二)", 112, "せんごひゃくはちじゅうに"),
  example("二千二十六", "2026 (二×千＋二×十＋六)", 112, "にせんにじゅうろく"),
];
examples.push(...bigNumberExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Numbers from 11 to 10,000",
  explanation: [
    {
      en: "11-19: 十(じゅう) + digit (十五=15). 20-99: [digit 2-9] + 十 (multiply by ten) + optional extra digit (六十三=63). 100-900: 百(ひゃく) with irregular sound changes at 300(さんびゃく), 600(ろっぴゃく), 800(はっぴゃく). 1000-9000: 千(せん) with irregular changes at 3000(さんぜん), 8000(はっせん). 10,000: 万(まん). Numbers combine the same way as English place values: 百二十三 = 百＋二×十＋三 = 123; 二千二十六 = 二×千＋二×十＋六 = 2026.",
    },
  ],
  examples: bigNumberExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 105 }, { file: FILE, page: 112 }],
});

// =====================================================================
// GRAMMAR: Basic Counters (p.117-135)
// =====================================================================
interface CounterDef {
  category: NumberCategory;
  suffix: string;
  meaning: string;
  readings: string[];
  irregularIdx: number[]; // 1-indexed values with irregular sound changes
  examples: [string, string][];
  page: number;
}
const counters: CounterDef[] = [
  {
    category: "counter-objects",
    suffix: "つ",
    meaning: "general counter (use when unsure which counter applies)",
    readings: ["ひとつ", "ふたつ", "みっつ", "よっつ", "いつつ", "むっつ", "ななつ", "やっつ", "ここのつ", "とう"],
    irregularIdx: [1, 2, 3, 4, 6, 8, 9, 10],
    examples: [["サンドイッチを二つ食べます。", "I eat two sandwiches."], ["サンドイッチを一つください。", "One sandwich, please."]],
    page: 117,
  },
  {
    category: "counter-objects",
    suffix: "個",
    meaning: "counter for small, compact objects (apple, egg, candy, ball, stone, potato...)",
    readings: ["いっこ", "にこ", "さんこ", "よんこ", "ごこ", "ろっこ", "ななこ", "はっこ", "きゅうこ", "じゅっこ"],
    irregularIdx: [1, 6, 8, 10],
    examples: [["りんごを二個食べます。", "I eat two apples."], ["トマトが七個あります。", "There are seven tomatoes."]],
    page: 118,
  },
  {
    category: "age",
    suffix: "歳",
    meaning: "counter for age",
    readings: ["いっさい", "にさい", "さんさい", "よんさい", "ごさい", "ろくさい", "ななさい", "はっさい", "きゅうさい", "じゅっさい"],
    irregularIdx: [1, 8, 10],
    examples: [["子どもは八歳です。", "The child is 8 years old."], ["妹は五歳です。", "My younger sister is 5 years old."]],
    page: 119,
  },
  {
    category: "counter-people",
    suffix: "人",
    meaning: "counter for people",
    readings: ["ひとり", "ふたり", "さんにん", "よにん", "ごにん", "ろくにん", "ななにん", "はちにん", "きゅうにん", "じゅうにん"],
    irregularIdx: [1, 2, 4],
    examples: [["友達が二人います。", "I have two friends."], ["日本人が一人います。", "There is one Japanese person."]],
    page: 120,
  },
  {
    category: "counter-animals",
    suffix: "匹",
    meaning: "counter for small animals (dogs, cats, fish...)",
    readings: ["いっぴき", "にひき", "さんびき", "よんひき", "ごひき", "ろっぴき", "ななひき", "はっぴき", "きゅうひき", "じゅっぴき"],
    irregularIdx: [1, 3, 6, 8, 10],
    examples: [["猫が二匹います。", "There are two cats."], ["犬を五匹見ます。", "I see five dogs."]],
    page: 121,
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
      irregular: c.irregularIdx.includes(n),
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
grammar.push({
  id: nextGrammarId(),
  pattern: "Counters (concept)",
  explanation: [
    {
      en: "Japanese numbers are almost always followed by a counter word, chosen by the shape or category of what's being counted (similar to English \"two slices of toast\", \"three glasses of water\"). This week introduces 5 basic counters: つ (general, use when unsure), 個 (small compact objects), 歳 (age), 人 (people), 匹 (small animals). See KANJI - SET N°06's related counters (頭, 枚, 台, 本, 杯, 冊, 回, 番目) for more specialised ones taught later.",
    },
  ],
  examples: [],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 117 }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(conjugationPath, conjugation);
saveOwnArray(numbersPath, numbers);

console.log(
  `${LESSON_ID}: ${vocab.length} vocab, ${examples.length} examples, ${grammar.length} grammar, ` +
    `${conjugation.length} conjugation, ${numbers.length} numbers.`,
);
