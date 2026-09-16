import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { ExampleSentence, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored content for "Extra Activity - Building Sentences 1.pdf":
 * 24 example sentences (bullet/『reading』/=meaning triples, same shape as
 * the "BUILT SENTENCES" sections elsewhere) plus its vocabulary table,
 * which is an image (confirmed via pdftotext returning nothing for that
 * page) and was read visually.
 *
 * Filed under the general "extra-practice" lesson bucket (not tied to a
 * numbered class) — see docs/source-inventory.md group E.
 *
 * Usage: tsx scripts/extract/manual/extra-building-sentences.ts
 */

const FILE = "Extra Activity - Building Sentences 1.pdf";
const LESSON_ID = "extra-practice";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();
function vocabWord(kanji: string | undefined, kana: string, meaning: string, pos?: VocabularyEntry["partOfSpeech"]) {
  return addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kanji,
    kana,
    meanings: [{ en: meaning }],
    partOfSpeech: pos,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 5, note: "Vocabulary table image" }],
  }));
}
function example(jp: string, reading: string, en: string, page: number) {
  const e: ExampleSentence = { id: nextExampleId(), japanese: jp, reading, meanings: [{ en }], origin: "course", source: [{ file: FILE, page }] };
  examples.push(e);
  return e;
}

// --- Vocabulary table (page 5, image) ---
vocabWord("猫", "ねこ", "cat");
vocabWord("黒い", "くろい", "black", ["i-adjective"]);
vocabWord("本", "ほん", "book");
vocabWord("来る", "くる", "to come", ["verb-irregular"]);
vocabWord("犬", "いぬ", "dog");
vocabWord("飲む", "のむ", "to drink", ["verb-godan"]);
vocabWord("食べる", "たべる", "to eat", ["verb-ichidan"]);
vocabWord(undefined, "サッカー", "football, soccer");
vocabWord("友だち", "ともだち", "friend");
vocabWord(undefined, "あげる", "to give", ["verb-ichidan"]);
vocabWord("行く", "いく", "to go", ["verb-godan"]);
vocabWord("緑の", "みどりの", "green", ["no-adjective"]);
vocabWord(undefined, "ある", "to have / there is [inanimate]", ["verb-godan"]);
vocabWord(undefined, "いる", "to have / there is [animate]", ["verb-ichidan"]);
vocabWord("日本人", "にほんじん", "Japanese [person]");
vocabWord("好きな", "すきな", "liked, likeable", ["na-adjective"]);
vocabWord("大好きな", "だいすきな", "loved, much liked", ["na-adjective"]);
vocabWord("牛乳", "ぎゅうにゅう", "milk");
vocabWord("月曜日", "げつようび", "Monday");
vocabWord("山", "やま", "mountain");
vocabWord("母", "はは", "mother");
vocabWord("遊ぶ", "あそぶ", "to play", ["verb-godan"]);
vocabWord(undefined, "する", "to play [sport] / to do", ["verb-irregular"]);
vocabWord(undefined, "ラーメン", "ramen");
vocabWord("読む", "よむ", "to read", ["verb-godan"]);
vocabWord("言う", "いう", "to say", ["verb-godan"]);
vocabWord("学校", "がっこう", "school");
vocabWord("見る", "みる", "to see", ["verb-ichidan"]);
vocabWord("学生", "がくせい", "student");
vocabWord("日曜日", "にちようび", "Sunday");
vocabWord("話す", "はなす", "to talk, to speak", ["verb-godan"]);
vocabWord("お茶", "おちゃ", "tea");
vocabWord("弟", "おとうと", "younger brother");
vocabWord("水", "みず", "water");

// --- Example sentences (pages 1-4) ---
example("これは猫だ。", "これはねこだ。", "This is a cat.", 1);
example("私は日本人だ。", "わたしはにほんじんだ。", "I am Japanese.", 1);
example("私が日本人だ。", "わたしがにほんじんだ。", "I am the one who is Japanese. / I am Japanese.", 1);
example("これは私の猫だ。", "これはわたしのねこだ。", "This is my cat.", 1);
example("猫は黒い。", "ねこはくろい。", "Cats are black. / The cat is black.", 1);
example("黒い猫を見る。", "くろいねこをみる。", "I see a black cat.", 1);
example("りんごは緑。", "りんごはみどり。", "Apples are green. / The apple is green.", 1);
example("緑のりんごを食べる。", "みどりのりんごをたべる。", "I eat a green apple.", 2);
example("黒い猫に緑のりんごをあげる。", "くろいねこにみどりのりんごをあげる。", "I give a green apple to a black cat.", 2);
example("猫は水と牛乳を飲む。", "ねこはみずとぎゅうにゅうをのむ。", "The cat drinks water and milk.", 2);
example("猫と遊びたい。", "ねことあそびたい。", "I want to play with the cat.", 2);
example("日曜日に母とお茶を飲む。", "にちようびにははとおちゃをのむ。", "On Sunday, I drink tea with my mother.", 2);
example("黒い猫がいる。", "わたしにはくろいねこがいる。", "I have a black cat.", 2);
example("お茶がある。", "おちゃがある。", "I have tea. / There is tea.", 2);
example("月曜日にサッカーをして、本を読んで、ラーメンを食べる。", "げつようびにさっかーをして、ほんをよんで、らーめんをたべる。", "On Monday, I play football, read a book, and eat ramen.", 2);
example("弟も月曜日にお茶を飲む。", "おとうともげつようびにおちゃをのむ。", "My younger brother also drinks tea on Monday.", 2);
example("弟は日本から来た。", "おとうとはにほんからきた。", "My younger brother comes from Japan.", 3);
example("あなたの弟は日本人だの？", "あなたのおとうとはにほんじんだの？", "Is your younger brother Japanese?", 3);
example("あなたの弟は日本人ですか？", "あなたのおとうとはにほんじんですか？", "Is your younger brother Japanese?", 3);
example("弟は日本人だよ。", "おとうとはにほんじんだよ。", "My younger brother is Japanese.", 3);
example("これは友だちの犬だ。", "これはともだちのいぬだ。", "This is my friend's dog.", 3);
example("友だちは「こんにちは」と言う。", "ともだちは「こんにちは」という。", 'My friend says "hello."', 3);
example("学校に本がある。", "がっこうにほんがある。", "There is a book at school.", 3);
example("学校で学生が話す。", "がっこうでがくせいがはなす。", "Students talk at school.", 3);
example("山に行きたい。", "やまにいきたい。", "I want to go to the mountains.", 3);
example("山へ行きたい。", "やまへいきたい。", "I want to go to the mountains.", 4);
example("山が好き。", "やまがすき。", "I like mountains.", 4);
example("山が大好き。", "やまがだいすき。", "I love mountains.", 4);

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);

console.log(`${LESSON_ID}: ${vocab.length} vocab total, ${examples.length} examples total (Building Sentences contribution).`);
