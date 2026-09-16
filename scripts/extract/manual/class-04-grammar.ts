import {
  loadOwnArray,
  saveOwnArray,
  makeIdSequencer,
  loadCrossLessonIndex,
  writeDirtyExternalFiles,
  addOrMergeVocab,
} from "../lib/lessonFile";
import type { ConjugationRule, ExampleSentence, GrammarEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/conjugation/vocabulary content for class-04,
 * transcribed from the parts of "Class N°04 - synthesis & assignments.pdf"
 * that scripts/extract/parseClassSynthesis.ts could not safely auto-parse
 * (see scripts/extract/.cache/class-04-remainder.txt, pages 11-20). This is
 * this lesson's biggest grammar topic: deriving the casual/polite past
 * tense (te-form -> ta-form), NA-/NO-adjective だ-conjugation, 好き/大好き
 * usage, and the full こそあど demonstrative paradigm.
 *
 * Usage: tsx scripts/extract/manual/class-04-grammar.ts
 */

const FILE = "Class N°04 - synthesis & assignments.pdf";
const LESSON_ID = "class-04";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const conjugationPath = `src/data/conjugation/${LESSON_ID}.json`;

const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const conjugation = loadOwnArray<ConjugationRule>(conjugationPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
const nextConjugationId = makeIdSequencer(conjugation, `${LESSON_ID}-conjugation-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();

function example(japanese: string, meaning: string, page: number, reading?: string): ExampleSentence {
  return { id: nextExampleId(), japanese, reading, meanings: [{ en: meaning }], origin: "course", source: [{ file: FILE, page }] };
}
function vocabWord(
  kanji: string | undefined,
  kana: string,
  meaning: string,
  page: number,
  partOfSpeech?: VocabularyEntry["partOfSpeech"],
): VocabularyEntry {
  return addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kanji,
    kana,
    meanings: [{ en: meaning }],
    partOfSpeech,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page }],
  }));
}

// --- Vocabulary the automated parser missed (uses 『』 outside a "... OF THE WEEK" section) ---
// (addOrMergeVocab dedups against words already extracted elsewhere, e.g.
// 始める/終える/好きな/元気な/茶色の also appear standalone in later classes.)
vocabWord("始める", "はじめる", "to start/begin [transitive]", 12, ["verb-ichidan"]);
vocabWord("続ける", "つづける", "to continue [transitive]", 12, ["verb-ichidan"]);
vocabWord("終える", "おえる", "to finish/end [transitive]", 12, ["verb-ichidan"]);
vocabWord(undefined, "かっこいい", "stylish, cool, handsome", 13, ["i-adjective"]);
vocabWord(undefined, "かわいい", "cute, adorable, sweet", 13, ["i-adjective"]);
vocabWord("醜い", "みにくい", "ugly", 13, ["i-adjective"]);
vocabWord("汚い", "きたない", "dirty", 13, ["i-adjective"]);
vocabWord(undefined, "きれいな", "beautiful, clean", 13, ["na-adjective"]);
vocabWord(undefined, "ハンサムな", "handsome", 13, ["na-adjective"]);
vocabWord("好きな", "すきな", "liked, beloved", 13, ["na-adjective"]);
vocabWord("元気な", "げんきな", "healthy, well", 13, ["na-adjective"]);
vocabWord("緑の", "みどりの", "green", 13, ["no-adjective"]);
vocabWord("オレンジ色の", "オレンジいろの", "orange", 13, ["no-adjective"]);
vocabWord("紫の", "むらさきの", "purple", 13, ["no-adjective"]);
vocabWord(undefined, "ピンクの", "pink", 13, ["no-adjective"]);
vocabWord("茶色の", "ちゃいろの", "brown", 13, ["no-adjective"]);
vocabWord("灰色の", "はいいろの", "gray", 13, ["no-adjective"]);

const kudamonoExample = example("果物が好き。", "I like fruit.", 11, "くだものがすき。");
examples.push(kudamonoExample);

// --- Ta-form (casual past) ---
const taFormExamples = [
  { form: "ta" as const, surface: "食べた", reading: "たべた" },
  { form: "ta" as const, surface: "見た", reading: "みた" },
  { form: "ta" as const, surface: "寝た", reading: "ねた" },
  { form: "ta" as const, surface: "言った", reading: "いった" },
  { form: "ta" as const, surface: "待った", reading: "まった" },
  { form: "ta" as const, surface: "知った", reading: "しった" },
  { form: "ta" as const, surface: "死んだ", reading: "しんだ" },
  { form: "ta" as const, surface: "飲んだ", reading: "のんだ" },
  { form: "ta" as const, surface: "遊んだ", reading: "あそんだ" },
  { form: "ta" as const, surface: "聞いた", reading: "きいた" },
  { form: "ta" as const, surface: "泳いだ", reading: "およいだ" },
  { form: "ta" as const, surface: "話した", reading: "はなした" },
];
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-ichidan",
  form: "ta",
  explanation: [
    {
      en: "The casual past affirmative (\"ta-form\") is derived from the te-form by changing the final え sound to あ: 食べて→食べた, 見て→見た, 寝て→寝た. Ichidan verbs simply swap て→た.",
    },
  ],
  examples: taFormExamples.slice(0, 3),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 14 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "ta",
  explanation: [
    {
      en: "Godan ta-form follows the same te-form sound changes as usual: う/つ/る→った (言う→言った, 待つ→待った, 知る→知った); ぬ/む/ぶ→んだ (死ぬ→死んだ, 飲む→飲んだ, 遊ぶ→遊んだ); く→いた (聞く→聞いた); ぐ→いだ (泳ぐ→泳いだ); す→した (話す→話した). Exceptions: 行く→行った (not 行いた), 来る→来た(きた), する→した.",
    },
  ],
  examples: taFormExamples.slice(3),
  exceptions: ["行く (to go) → 行った, not the regular く→いた pattern"],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 14 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-irregular",
  form: "ta",
  explanation: [{ en: "来る (to come) and する (to do) have irregular ta-forms: 来る→来た(きた), する→した." }],
  examples: [
    { form: "ta", surface: "来た", reading: "きた" },
    { form: "ta", surface: "した", reading: "した" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 14 }],
});

// --- Polite past ---
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-ichidan",
  form: "masu-past",
  explanation: [
    {
      en: "Past polite affirmative: take the present polite (ます) form and change ます→ました. 食べます→食べました, 見ます→見ました, します→しました, 来ます→来ました. です similarly becomes でした.",
    },
  ],
  examples: [
    { form: "masu-past", surface: "食べました", reading: "たべました" },
    { form: "masu-past", surface: "見ました", reading: "みました" },
    { form: "masu-past", surface: "しました" },
    { form: "masu-past", surface: "来ました", reading: "きました" },
    { form: "masu-past", surface: "でした" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 15 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-ichidan",
  form: "nakatta",
  explanation: [
    {
      en: "Past casual negative: take the present casual negative (-a stem + ない) and treat ない as an i-adjective, replacing い with かった. 話さない→話さなかった, 食べない→食べなかった, しない→しなかった, 寝ない→寝なかった. じゃない similarly becomes じゃなかった.",
    },
  ],
  examples: [
    { form: "nakatta", surface: "話さなかった", reading: "はなさなかった" },
    { form: "nakatta", surface: "食べなかった", reading: "たべなかった" },
    { form: "nakatta", surface: "しなかった" },
    { form: "nakatta", surface: "寝なかった", reading: "ねなかった" },
    { form: "nakatta", surface: "じゃなかった" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 15 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-ichidan",
  form: "masu-past-negative",
  explanation: [
    {
      en: "Past polite negative: take the present polite negative (-i stem + ません) and add the past polite suffix でした. 食べません→食べませんでした, 見ません→見ませんでした, しません→しませんでした, 来ません→来ませんでした.",
    },
  ],
  examples: [
    { form: "masu-past-negative", surface: "食べませんでした", reading: "たべませんでした" },
    { form: "masu-past-negative", surface: "見ませんでした", reading: "みませんでした" },
    { form: "masu-past-negative", surface: "しませんでした" },
    { form: "masu-past-negative", surface: "来ませんでした", reading: "きませんでした" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 16 }],
});

grammar.push({
  id: nextGrammarId(),
  pattern: "Past tense (casual & polite)",
  explanation: [
    {
      en: "Casual past affirmative uses the \"ta-form\", derived from the te-form by changing its final え-row sound to あ (godan verbs follow the same sound-change groups as the te-form; ichidan just swaps て→た; 行く/来る/する are irregular). Polite past affirmative changes ます→ました (です→でした). Casual past negative treats the -a stem + ない form as an i-adjective, replacing い with かった. Polite past negative adds でした after the polite negative ません form.",
    },
  ],
  examples: [kudamonoExample],
  relatedConjugationRuleIds: conjugation.slice(-6).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 14 }, { file: FILE, page: 15 }, { file: FILE, page: 16 }],
});

// --- NA-/NO-adjectives usage & だ-conjugation ---
const naNoExamples = [
  example("緑の車を買っている。", "I'm buying a green car.", 17, "みどりのくるまをかっている。"),
  example("緑の車です。", "It's a green car.", 17),
  example("きれいな車を買っている。", "I'm buying a beautiful car.", 17, "きれいなくるまをかっている。"),
  example("きれいな車です。", "It's a beautiful car.", 17),
  example("車は緑だ。", "The car is green.", 17),
  example("私の家は緑だ。", "My house is green.", 17),
  example("車はきれいだ。", "The car is beautiful.", 17),
  example("私の家はきれいだ。", "My house is beautiful.", 17),
  example("車は緑です。", "The car is green. [polite]", 17),
  example("車は緑じゃない。", "The car is not green.", 17),
  example("車は緑ではありません。", "The car is not green. [polite]", 17),
  example("車は緑だった。", "The car was green.", 17),
  example("車は緑でした。", "The car was green. [polite]", 17),
  example("車は緑じゃなかった。", "The car wasn't green.", 17),
  example("車は緑ではありませんでした。", "The car wasn't green. [polite]", 17),
];
examples.push(...naNoExamples);

conjugation.push({
  id: nextConjugationId(),
  appliesTo: "na-adjective",
  form: "dictionary",
  explanation: [
    {
      en: "NA- and NO-adjectives: before a noun, used as-is (緑の車 = green car, きれいな車 = beautiful car). As a predicate, the final element is replaced by the copula だ (which may be dropped for a more casual tone): 車は緑(だ), 車はきれい(だ). だ is then conjugated for tense/politeness/negation like any copula: だ/です (present), じゃない/ではありません (negative), だった/でした (past), じゃなかった/ではありませんでした (past negative).",
    },
  ],
  examples: [
    { form: "dictionary", surface: "緑だ", reading: "みどりだ" },
    { form: "na-adjective-negative", surface: "緑じゃない", reading: "みどりじゃない" },
    { form: "na-adjective-past", surface: "緑だった", reading: "みどりだった" },
    { form: "na-adjective-past-negative", surface: "緑じゃなかった", reading: "みどりじゃなかった" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 17 }],
});

grammar.push({
  id: nextGrammarId(),
  pattern: "NA-/NO-adjectives",
  explanation: [
    {
      en: "NA- and NO-adjectives behave like nouns grammatically. Before a noun they're used exactly as taught (緑の車, きれいな車). As the sentence predicate, replace whatever came last with the copula だ, optionally dropped for casualness (車は緑(だ) = the car is green); だ then conjugates for tense/politeness/negation on its own (だ/です, じゃない/ではありません, だった/でした, じゃなかった/ではありませんでした) rather than the adjective itself changing form.",
    },
  ],
  examples: naNoExamples,
  relatedConjugationRuleIds: [conjugation[conjugation.length - 1].id],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 17 }],
});

// --- 好き / 大好き (to like / to love) ---
const sukiExamples = [
  example("犬が好き。", "I like dogs.", 18),
  example("日本が好きです。", "I like Japan. [formal]", 18),
  example("ラーメンが好きじゃない。", "I don't like ramen.", 18),
  example("猫が好きではありません。", "I don't like cats. [formal]", 18),
  example("本が好きだった。", "I liked / used to like books.", 18),
  example("山が好きでした。", "I liked / used to like mountains. [formal]", 18),
  example("チーズが好きじゃなかった。", "I didn't like / used to not like cheese.", 18),
  example("魚が好きではありませんでした。", "I didn't like / used to not like fish. [formal]", 18),
  example("水を飲むのが好き。", "I like to drink water.", 18),
  example("りんごを食べるのが好きです。", "I like to eat apples. [formal]", 18),
  example("ラーメンを食べるのが好きじゃない。", "I don't like to eat ramen.", 18),
  example("猫と遊ぶのが好きではありません。", "I don't like to play with cats. [formal]", 18),
  example("本を読むのが好きだった。", "I liked / used to like to read books.", 18),
  example("山へ行くのが好きでした。", "I liked / used to like to go to the mountains. [formal]", 18),
  example("チーズを食べるのが好きじゃなかった。", "I didn't / used to not like to eat cheese.", 18),
  example("魚を食べるのが好きではありませんでした。", "I didn't / used to not like to eat fish. [formal]", 18),
];
examples.push(...sukiExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "好きな / 大好きな (to like / to love)",
  explanation: [
    {
      en: "好きな (liked) and 大好きな (loved) express liking/loving. With a noun: noun + が + (大)好き + だ-conjugation (だ itself usually dropped as unnatural: 犬が好き = I like dogs). With a verb: dictionary-form verb + の + が + (大)好き + だ-conjugation (水を飲むのが好き = I like to drink water) — の nominalises the verb phrase so it can take が like a noun.",
    },
  ],
  examples: sukiExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 18 }],
});

// --- こそあど demonstratives ---
const demoExamples = [
  example("これは犬だ。", "This is a dog.", 19),
  example("これは赤い。", "This is red.", 19),
  example("この犬は大きい。", "This dog is big.", 19),
  example("この学生は日本語を話す。", "This student speaks Japanese.", 19),
  example("ここにいます。", "I am here.", 19),
  example("ここで食べます。", "I eat here.", 19),
  example("ここに来て。", "Come here.", 19),
  example("こちらへ来てください。", "Come here, please. [polite]", 19),
  example("こっちへ来てください。", "Come here, please. [casual]", 19),
  example("こうしてください。", "Do it like this, please.", 19),
  example("こう食べます。", "I eat like this.", 19),
  example("こんな本が好き。", "I like books like this / such books.", 19),
];
examples.push(...demoExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "こそあど demonstratives",
  explanation: [
    {
      en: "The こ/そ/あ/ど demonstrative series covers pronouns, determiners, places, and directions, distinguished by proximity: こ- = near the speaker, そ- = near the listener, あ- = far from both, ど- = question form. Pronoun (\"this/that/which one\"): これ/それ/あれ/どれ. Determiner before a noun (\"this/that/which [noun]\"): この/その/あの/どの. Place (\"here/there/where\"): ここ/そこ/あそこ/どこ. Direction, polite (\"this/that way\"): こちら/そちら/あちら/どちら. Direction, casual: こっち/そっち/あっち/どっち. Manner (\"like this/how\"): こう/そう/ああ/どう. Kind (\"this kind of / what kind of\"): こんな/そんな/あんな/どんな.",
    },
  ],
  examples: demoExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 19 }, { file: FILE, page: 20 }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(conjugationPath, conjugation);

console.log(
  `${LESSON_ID}: ${vocab.length} vocab total, ${examples.length} examples total, ` +
    `${grammar.length} grammar entries total, ${conjugation.length} conjugation rules total.`,
);
