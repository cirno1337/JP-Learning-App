import { loadOwnArray, saveOwnArray, makeIdSequencer } from "../lib/lessonFile";
import type { DialogueEntry, ExampleSentence, GrammarEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/reading content for class-05, transcribed from the
 * parts of "Class N°05 - synthesis & assignments.pdf" that
 * parseClassSynthesis.ts could not safely auto-parse (see
 * scripts/extract/.cache/class-05-remainder.txt, pages 5-19): the
 * "COMPREHENSIBLE INPUT" reading passage (no BUILT SENTENCES section this
 * week), the full question-word system, indefinite pronouns (か/でも/も),
 * から (because), but/after/before linking words, and adverbs.
 *
 * Usage: tsx scripts/extract/manual/class-05-grammar.ts
 */

const FILE = "Class N°05 - synthesis & assignments.pdf";
const LESSON_ID = "class-05";

const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;

const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);

const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);

function example(japanese: string, meaning: string, page: number, reading?: string): ExampleSentence {
  return { id: nextExampleId(), japanese, reading, meanings: [{ en: meaning }], origin: "course", source: [{ file: FILE, page }] };
}

// --- "Leo the butcher" comprehensible-input reading passage (p.5-6) ---
dialogues.push({
  id: `${LESSON_ID}-dialogue-001`,
  title: "レオさん (Leo the butcher) — comprehensible input reading passage",
  lines: [
    { japanese: "彼はレオさんです。", reading: "かれ は レオさん です。", meanings: [{ en: "He is Leo." }] },
    { japanese: "レオさんは肉屋です。", reading: "レオさん は にくや です。", meanings: [{ en: "Leo is a butcher." }] },
    {
      japanese: "若いです。でも、悲しくて貧しいです。",
      reading: "わかい です。でも、かなしくて まずしい です。",
      meanings: [{ en: "He is young. But he is sad and poor." }],
    },
    {
      japanese: "毎日起きて、立ちます。",
      reading: "まいにち おきて、たちます。",
      meanings: [{ en: "Every day, he wakes up and gets up." }],
    },
    {
      japanese: "そのあとで、朝ご飯を食べます。",
      reading: "そのあとで、あさごはん を たべます。",
      meanings: [{ en: "After that, he eats breakfast." }],
    },
    {
      japanese: "りんごとチーズを食べて、お茶を飲みます。",
      reading: "りんご と チーズ を たべて、おちゃ を のみます。",
      meanings: [{ en: "He eats an apple and cheese, then drinks tea." }],
    },
    {
      japanese: "お茶は熱いです。でも、りんごは冷たいです。",
      reading: "おちゃ は あつい です。でも、りんご は つめたい です。",
      meanings: [{ en: "The tea is hot. But the apple is cold." }],
    },
    {
      japanese: "食べたあとで、出て、走ります。仕事に行きます。",
      reading: "たべた あとで、でて、はしります。しごと に いきます。",
      meanings: [{ en: "After eating, he goes out, runs, and goes to work." }],
    },
    { japanese: "暑いです。", reading: "あつい です。", meanings: [{ en: "It is hot." }] },
    {
      japanese: "そのあとで、駅に着きます。電車に乗ります。",
      reading: "そのあとで、えき に つきます。でんしゃ に のります。",
      meanings: [{ en: "After that, he arrives at the station. He gets on the train." }],
    },
    {
      japanese: "今、レオさんは電車にいます。仕事へ行っています。",
      reading: "いま、レオさん は でんしゃ に います。しごと へ いっています。",
      meanings: [{ en: "Now, Leo is on the train. He is going to work." }],
    },
    {
      japanese: "そのあとで、電車を降ります。肉屋に着きます。",
      reading: "そのあとで、でんしゃ を おります。にくや に つきます。",
      meanings: [{ en: "After that, he gets off the train. He arrives at the butcher shop." }],
    },
    {
      japanese: "肉屋に入って、彼の友達を見ます。「おはようございます」と言います。",
      reading: "にくや に はいって、かれ の ともだち を みます。「おはようございます」と いいます。",
      meanings: [{ en: 'He enters the butcher shop, sees his friend, and says, "Good morning."' }],
    },
    {
      japanese: "友達は年を取った人です。でも、うれしくてお金持ちです。",
      reading: "ともだち は とし を とった ひと です。でも、うれしくて おかねもち です。",
      meanings: [{ en: "His friend is an elderly person. But he is happy and rich." }],
    },
    {
      japanese: "そのあとで、レオさんは玉ねぎを切って、料理します。",
      reading: "そのあとで、レオさん は たまねぎ を きって、りょうり します。",
      meanings: [{ en: "After that, Leo cuts onions and cooks." }],
    },
    {
      japanese: "玉ねぎを切るのは難しいです。しかし、肉を料理するのはやさしいです。",
      reading: "たまねぎ を きる の は むずかしい です。しかし、にく を りょうり する の は やさしい です。",
      meanings: [{ en: "Cutting onions is difficult. However, cooking meat is easy." }],
    },
    {
      japanese: "そのあとで、家に帰ります。寒いです。",
      reading: "そのあとで、いえ に かえります。さむい です。",
      meanings: [{ en: "After that, he goes home. It is cold." }],
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 5, note: "Reading passage spans pages 5-6" }],
});

// --- Question words ---
const whoExamples = [
  example("あのひとは誰ですか。", "Who is that person? [polite]", 10),
  example("あのひとは誰だの。", "Who is that person? [casual]", 10),
  example("誰が来ますか。", "Who is coming? [polite]", 10),
  example("誰が来るの。", "Who is coming? [casual]", 10),
  example("君は誰を見るの。", "Who are you looking at?", 10),
  example("君は誰と話すの。", "Who are you talking with?", 10),
];
const whatExamples = [
  example("君は何を食べるの。", "What are you eating?", 11),
  example("これは何ですか。", "What is this? [polite]", 11),
  example("これは何だの。", "What is this? [casual]", 11),
  example("何が好き？", "What do you like?", 11),
  example("彼は何歳ですか。", "How old is he?", 11, undefined),
  example("犬が何匹いますか。", "How many dogs are there?", 11),
  example("何曜日ですか。", "What day of the week is it?", 11),
  example("何時ですか。", "What time is it?", 11),
];
const whereWhenExamples = [
  example("犬はどこですか。", "Where is the dog?", 12),
  example("どこに住んでいるの。", "Where do you live?", 12),
  example("どこで勉強するの。", "Where do you study?", 12),
  example("いつ来るの。", "When are you coming?", 12),
  example("いつ日本へ行きますか。", "When are you going to Japan?", 12),
];
const whyHowExamples = [
  example("なぜ日本語を話しますか。", "Why do you speak Japanese? [formal]", 13),
  example("どうして本を読みますか。", "Why do you read books? [oral]", 13),
  example("なんでりんごを食べるの。", "Why do you eat apples? [casual]", 13),
  example("どうラーメンを食べますか。", "How do you eat ramen?", 13),
  example("どうやって日本に行きましたか。", "How (by what means) did you go to Japan?", 13),
  example("君の本はどれですか。", "Which one is your book?", 13),
  example("どの本が赤いですか。", "Which book is red?", 13),
];
const directionHowMuchExamples = [
  example("どっちへ行くの。", "Which way are you going? [casual]", 14),
  example("どちらへ行きますか。", "Which way are you going? [polite]", 14),
  example("テーブルがいくつあるの。", "How many tables are there?", 14),
  example("おいくつですか。", "How old are you? [polite]", 14),
  example("いくらですか。", "How much does it cost?", 14),
  example("この本はいくらですか。", "How much does this book cost?", 14),
  example("日本語をどれくらい勉強しましたか。", "For how long have you been studying Japanese?", 14),
];
const questionExamples = [...whoExamples, ...whatExamples, ...whereWhenExamples, ...whyHowExamples, ...directionHowMuchExamples];
examples.push(...questionExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Question words",
  explanation: [
    {
      en: "A question word takes the same position in the sentence that its answer would occupy in an affirmative sentence. Particles stay the same except は, which becomes が on the questioned element (it's now being emphasized/asked about). Question word inventory: 誰/どなた(formal) = who; 何(なに alone/with particles, なん elsewhere, also \"how much\" with a counter) = what; どこ = where; いつ = when; なぜ(formal)/どうして(oral)/なんで(casual) = why; どう/どうやって(emphasizing method) = how; どれ = which one; どの = which [+noun]; どんな = what kind of; どちら/どっち(casual) = where/which way (direction); いくつ/おいくつ(polite, also used for age) = how many; いくら = how much (price); どれくらい = how long.",
    },
  ],
  examples: questionExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 9 }, { file: FILE, page: 15 }],
});

// --- Indefinite pronouns: か / でも / も+negation ---
const indefiniteExamples = [
  example("誰か来ました。", "Somebody came.", 16),
  example("何か見ます。", "I see something.", 16),
  example("どこか行きます。", "I am going somewhere.", 16),
  example("いつか日本へ行きます。", "One day, I'll go to Japan.", 16),
  example("誰でもできます。", "Anybody can do it.", 16),
  example("何でも食べます。", "I eat anything.", 16),
  example("どこでもいいです。", "I am fine with going anywhere.", 16),
  example("いつでも来てください。", "Feel free to come anytime.", 16),
  example("誰も来ません。", "Nobody came.", 16),
  example("何も見ません。", "I see nothing.", 16),
  example("どこも行きません。", "I am going nowhere.", 16),
  example("いつも日本へ行きません。", "I don't always go to Japan.", 16),
  example("いつも牛乳を飲みます。", "I always drink milk.", 16),
];
examples.push(...indefiniteExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Indefinite pronouns (か / でも / も+negation)",
  explanation: [
    {
      en: "Question words combine with か/でも/も to form indefinite pronouns: question-word + か = \"some-\" (誰か = somebody, 何か = something, どこか = somewhere, いつか = someday); question-word + でも = \"any-\" (誰でも = anybody, 何でも = anything, どこでも = anywhere, いつでも = anytime); question-word + も + negative verb = \"no-\" (誰も来ません = nobody came, 何も見ません = I see nothing, どこも行きません = I'm going nowhere); いつも without a negative instead means \"always\".",
    },
  ],
  examples: indefiniteExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 16 }],
});

// --- から (because) ---
const karaExamples = [
  example("学生だ。学生だから。", "I am a student. Because I am a student.", 17),
  example("赤いです。赤いですから。", "It is red. Because it is red.", 17),
  example("赤いですから、この車を買いたいです。", "Because it is red, I want to buy this car.", 17),
];
examples.push(...karaExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "から (because)",
  explanation: [
    {
      en: "\"Because\" is expressed with から, placed at the end of the reason clause. It answers なぜ/どうして/なんで questions. When both the reason and the main sentence are given together, the reason (with から) comes first: 赤いですから、この車を買いたいです = Because it is red, I want to buy this car.",
    },
  ],
  examples: karaExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 17 }],
});

// --- but / after / before ---
const linkingExamples = [
  example("本を買いたいです。でも、お金がありません。", "I want to buy books. But I don't have money.", 18),
  example("日本に行きたいです。しかし、日本語を話しません。", "I want to go to Japan. But I don't speak Japanese.", 18),
  example("その後で食べます。", "After that, I'll eat.", 18, "そのあとで"),
  example("学校の後でレストランに行く。", "After school, I'll go to the restaurant.", 18),
  example("食べた後で寝ます。", "After eating, I'll sleep.", 18),
  example("寝た後でレストランに行く。", "After sleeping, I'll go to the restaurant.", 18),
  example("その前に食べます。", "Before that, I'll eat.", 18, "そのまえに"),
  example("学校の前にレストランに行く。", "Before school, I'll go to the restaurant.", 18),
  example("食べる前に寝ます。", "Before eating, I'll sleep.", 18),
  example("寝る前にレストランに行く。", "Before sleeping, I'll go to the restaurant.", 18),
];
examples.push(...linkingExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "でも / しかし (but), 後で (after), 前に (before)",
  explanation: [
    {
      en: "\"But\" is でも (casual) or its formal version しかし. \"After [noun]\" is [noun]+の後で; \"after [verb]\" is ta-form+後で. \"Before [noun]\" is [noun]+の前に; \"before [verb]\" is dictionary-form (u-stem)+前に — note 前に always takes the dictionary form regardless of tense, unlike 後で which takes the ta-form.",
    },
  ],
  examples: linkingExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 18 }],
});

// --- Adverbs ---
const adverbExamples = [
  example("月曜日に一緒に食べます。", "On Mondays, we eat together.", 19),
  example("この犬はとても小さいです。", "This dog is very small.", 19),
  example("もう食べました。", "I already ate.", 19),
  example("まだ食べます。", "I am still eating.", 19),
  example("まだ食べていません。", "I didn't eat yet.", 19),
];
examples.push(...adverbExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Adverbs of time/degree (一緒に, たくさん/とても, もう, まだ)",
  explanation: [
    {
      en: "Adverbs are placed just before the verb they modify. 一緒に = together; たくさん/とても = very/a lot (don't confuse with たくさんの = \"a lot of\" [+noun]); もう = already; まだ = still, and まだ + negative = \"not yet\".",
    },
  ],
  examples: adverbExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 19 }],
});

saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(dialoguesPath, dialogues);

console.log(`${LESSON_ID}: ${examples.length} examples total, ${grammar.length} grammar entries total, ${dialogues.length} dialogues total.`);
