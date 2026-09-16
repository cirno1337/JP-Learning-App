import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { ConjugationRule, DialogueEntry, ExampleSentence, GrammarEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/vocabulary content for class-08, transcribed from
 * "Class N°08 - synthesis & assignments.pdf" pages 4-12 (see
 * scripts/extract/.cache/class-08-remainder.txt): a vocabulary subcategory
 * the parser's section state machine missed, the "zoo" comprehensible-input
 * reading, potential form (can/be able to), locating things (position
 * words), すぎる ("too much"), and adverbs of quantity.
 *
 * Usage: tsx scripts/extract/manual/class-08-grammar.ts
 */

const FILE = "Class N°08 - synthesis & assignments.pdf";
const LESSON_ID = "class-08";

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

// --- Aquatic animals, insects & reptiles (p.4) — the parser's section state machine missed this subcategory ---
vocabWord(undefined, "クラゲ", "jellyfish", 4);
vocabWord(undefined, "タコ", "octopus", 4);
vocabWord(undefined, "サメ", "shark", 4);
vocabWord(undefined, "クジラ", "whale", 4);
vocabWord(undefined, "イルカ", "dolphin", 4);
vocabWord(undefined, "カエル", "frog", 4);
vocabWord(undefined, "ワニ", "crocodile", 4);
vocabWord(undefined, "ヘビ", "snake", 4);
vocabWord(undefined, "カメ", "turtle", 4);
vocabWord(undefined, "アリ", "ant", 4);
vocabWord(undefined, "ハチ", "bee", 4);
vocabWord("蝶", "ちょう", "butterfly", 4);
vocabWord(undefined, "クモ", "spider", 4);
vocabWord(undefined, "カタツムリ", "snail", 4);

// --- "Zoo" comprehensible-input reading (p.5-6) ---
const zooLines: [string, string, string][] = [
  ["動物園の前で、家族は二つ会った。", "どうぶつえんのまえで、ふたつのかぞくがあった。", "Two families met in front of the zoo."],
  ["上野動物園を選んだ。", "うえのどうぶつえんをえらんだ。", "They chose Ueno Zoo."],
  ["そして、動物を見た。", "そして、どうぶつをみた。", "And then, they saw the animals."],
  ["猿を見た。", "さるをみた。", "They saw a monkey."],
  ["猿は速かった。", "さるははやかった。", "The monkey was fast."],
  ["その後で、カメを見た。", "そのあとで、カメをみた。", "After that, they saw a turtle."],
  ["カメは遅かった。", "カメはおそかった。", "The turtle was slow."],
  ["ネズミも見た。", "ネズミもみた。", "They also saw a mouse."],
  ["ネズミは弱かった。", "ネズミはよわかった。", "The mouse was weak."],
  ["その後で、ワニを見た。", "そのあとで、ワニをみた。", "After that, they saw a crocodile."],
  ["ワニは強かった。", "ワニはつよかった。", "The crocodile was strong."],
  ["男の子が女の子を押した。", "おとこのこがおんなのこをおした。", "The boy pushed the girl."],
  ["女の子は転んで、泣いた。", "おんなのこはころんで、ないた。", "The girl fell down and cried."],
  ["女の子は悲しかった。", "おんなのこはかなしかった。", "The girl was sad."],
  ["お母さんも嬉しくなかった。", "おかあさんもうれしくなかった。", "The mother wasn't happy either."],
  ["女の子は立って、ジャンプした。", "おんなのこはたって、ジャンプした。", "The girl stood up and jumped."],
  ["そして、男の子を水の中に押した。", "そして、おとこのこをみずのなかにおした。", "And then, she pushed the boy into the water."],
];
dialogues.push({
  id: `${LESSON_ID}-dialogue-001`,
  title: "動物園 (The zoo) — comprehensible input reading passage",
  lines: zooLines.map(([jp, reading, en]) => ({ japanese: jp, reading, meanings: [{ en }] })),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 5, note: "Reading passage spans pages 5-6" }],
});

// --- Potential form (can / be able to) (p.9) ---
const potentialExamples = [
  example("英語が話せますか。", "Can you speak English?", 9),
  example("日本語が話せません。", "I can't speak Japanese.", 9),
  example("英語の歌が歌えます。", "I can sing English songs.", 9),
  example("日本語の歌が歌えません。", "I can't sing Japanese songs.", 9),
];
examples.push(...potentialExamples);
conjugation.push(
  {
    id: nextConjugationId(),
    appliesTo: "verb-godan",
    form: "dictionary",
    explanation: [
      {
        en: "Potential form (\"can/be able to\"): godan verbs take the -e stem + る (飲む→飲め→飲める, 話す→話せ→話せる) and become ichidan verbs, conjugating like any other ichidan verb from then on. The direct object particle を is often replaced by が: 英語が話せますか (can you speak English?).",
      },
    ],
    examples: [
      { form: "dictionary", surface: "飲める", reading: "のめる" },
      { form: "dictionary", surface: "話せる", reading: "はなせる" },
    ],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 9 }],
  },
  {
    id: nextConjugationId(),
    appliesTo: "verb-ichidan",
    form: "dictionary",
    explanation: [
      {
        en: "Potential form for ichidan verbs: -e stem + られる (食べる→食べ→食べられる, 見る→見→見られる). Irregular: 来る→来られる(こられる), する→できる (a wholly separate word, not a regular transformation).",
      },
    ],
    examples: [
      { form: "dictionary", surface: "食べられる", reading: "たべられる" },
      { form: "dictionary", surface: "見られる", reading: "みられる" },
      { form: "dictionary", surface: "来られる", reading: "こられる" },
      { form: "dictionary", surface: "できる" },
    ],
    exceptions: ["する → できる, a separate word rather than the regular -e+られる pattern"],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 9 }],
  },
);
grammar.push({
  id: nextGrammarId(),
  pattern: "Potential form (can / be able to)",
  explanation: [
    {
      en: "\"Can/be able to [verb]\" is formed by transforming the verb into a new ichidan verb: godan -e stem+る (飲める, 話せる), ichidan -e stem+られる (食べられる, 見られる); 来る→来られる, する→できる. These new verbs conjugate exactly like regular ichidan verbs. The object particle を is often replaced with が.",
    },
  ],
  examples: potentialExamples,
  relatedConjugationRuleIds: conjugation.slice(-2).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 9 }],
});

// --- To locate (position words) (p.10) ---
vocabWord("上", "うえ", "on, above, over", 10, ["noun"]);
vocabWord("下", "した", "under, below", 10, ["noun"]);
vocabWord("中", "なか", "in, inside", 10, ["noun"]);
vocabWord("外", "そと", "outside", 10, ["noun"]);
vocabWord("前", "まえ", "in front", 10, ["noun"]);
vocabWord("後ろ", "うしろ", "behind", 10, ["noun"]);
vocabWord("左", "ひだり", "left", 10, ["noun"]);
vocabWord("右", "みぎ", "right", 10, ["noun"]);
vocabWord("間", "あいだ", "between", 10, ["noun"]);
vocabWord("近く", "ちかく", "near", 10, ["noun"]);
const locateExamples = [example("テーブルの上", "on the table", 10, "テーブルのうえ"), example("家の中", "in the house", 10, "いえのなか")];
examples.push(...locateExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Locating things (position words)",
  explanation: [
    { en: "To locate something: [thing] + の + [position word]. Position words: 上(うえ)=on/above/over, 下(した)=under/below, 中(なか)=in/inside, 外(そと)=outside, 前(まえ)=in front, 後ろ(うしろ)=behind, 左(ひだり)=left, 右(みぎ)=right, 間(あいだ)=between, 近く(ちかく)=near." },
  ],
  examples: locateExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 10 }],
});

// --- すぎる (too much) (p.11) ---
const sugiruExamples = [
  example("水を飲みすぎる。", "I drink too much water.", 11, "みずをのみすぎる。"),
  example("日本語を勉強しすぎる。", "I study Japanese too much.", 11, "にほんごをべんきょうしすぎる。"),
  example("この犬は大きすぎる。", "This dog is too big.", 11, "このいぬはおおきすぎる。"),
  example("彼の本はきれいすぎる。", "His book is too clean/beautiful.", 11, "かれのほんはきれいすぎる。"),
];
examples.push(...sugiruExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "すぎる (too much / too...)",
  explanation: [
    {
      en: "\"Too much [verb]\": -i (masu) stem + すぎる (godan 飲む→飲み→飲みすぎる, 話す→話し→話しすぎる; ichidan 食べる→食べすぎる, 見る→見すぎる; irregular 来る→来すぎる(きすぎる), する→しすぎる). \"Too [adjective]\": adjective stem (drop い/な/の) + すぎる (大きい→大きすぎる, きれいな→きれいすぎる). すぎる itself then conjugates as a regular ichidan verb.",
    },
  ],
  examples: sugiruExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 11 }],
});

// --- Adverbs of quantity (p.12) ---
vocabWord("十分", "じゅうぶん", "enough", 12, ["adverb"]);
vocabWord("足りない", "たりない", "not enough", 12, ["i-adjective"]);
vocabWord(undefined, "たくさん", "a lot", 12, ["adverb"]);
vocabWord(undefined, "いくつか", "some", 12, ["adverb"]);
const quantityExamples = [
  example("水は十分あります。", "There is enough water.", 12, "みずはじゅうぶんあります。"),
  example("お金が足りない。", "I don't have enough money.", 12, "おかねがたりない。"),
  example("水をたくさん飲みます。", "I drink a lot of water.", 12, "みずをたくさんのみます。"),
  example("りんごがいくつかあります。", "There are some apples.", 12, "りんごがいくつかあります。"),
];
examples.push(...quantityExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Adverbs of quantity",
  explanation: [{ en: "十分(じゅうぶん) = enough; 足りない(たりない) = not enough; たくさん = a lot; いくつか = some. Placed before the verb they modify, like other adverbs." }],
  examples: quantityExamples,
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
