import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { KanaEntry, NoteEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored content for Class A (12 June 2026), transcribed from
 * "Class A - synthesis & assignments.pdf": the full hiragana chart (base
 * grid, dakuten/handakuten, digraphs, long-vowel rule, っ), 30 kana-only
 * vocabulary words practising the kana, and ~22 basic expressions.
 *
 * Usage: tsx scripts/extract/manual/class-a-content.ts
 */

const FILE = "Class A - synthesis & assignments.pdf";
const LESSON_ID = "class-a";
const PAGE = 1;

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const kana: KanaEntry[] = [];
const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const notes: NoteEntry[] = [];

const nextKanaId = makeIdSequencer(kana, `${LESSON_ID}-kana-`);
const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextNoteId = makeIdSequencer(notes, `${LESSON_ID}-note-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();

function addKana(character: string, romaji: string, variantType: KanaEntry["variantType"], baseCharacterId?: string): KanaEntry {
  const entry: KanaEntry = {
    id: nextKanaId(),
    character,
    chart: "hiragana",
    romaji,
    variantType,
    baseCharacterId,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: PAGE }],
  };
  kana.push(entry);
  return entry;
}

// --- Base grid (a-i-u-e-o rows) ---
const baseRows: [string, [string, string][]][] = [
  ["a", [["あ", "a"], ["か", "ka"], ["さ", "sa"], ["た", "ta"], ["な", "na"], ["は", "ha"], ["ま", "ma"], ["や", "ya"], ["ら", "ra"], ["わ", "wa"]]],
  ["i", [["い", "i"], ["き", "ki"], ["し", "shi"], ["ち", "chi"], ["に", "ni"], ["ひ", "hi"], ["み", "mi"], ["り", "ri"]]],
  ["u", [["う", "u"], ["く", "ku"], ["す", "su"], ["つ", "tsu"], ["ぬ", "nu"], ["ふ", "fu"], ["む", "mu"], ["ゆ", "yu"], ["る", "ru"]]],
  ["e", [["え", "e"], ["け", "ke"], ["せ", "se"], ["て", "te"], ["ね", "ne"], ["へ", "he"], ["め", "me"], ["れ", "re"]]],
  ["o", [["お", "o"], ["こ", "ko"], ["そ", "so"], ["と", "to"], ["の", "no"], ["ほ", "ho"], ["も", "mo"], ["よ", "yo"], ["ろ", "ro"], ["を", "wo"]]],
];
const baseKanaById = new Map<string, KanaEntry>();
for (const [, entries] of baseRows) {
  for (const [char, romaji] of entries) {
    const e = addKana(char, romaji, "base");
    baseKanaById.set(char, e);
  }
}
addKana("ん", "n", "base");

// --- Dakuten / handakuten ---
const dakutenPairs: [string, string, string][] = [
  // [base char, voiced char, romaji]
  ["か", "が", "ga"], ["き", "ぎ", "gi"], ["く", "ぐ", "gu"], ["け", "げ", "ge"], ["こ", "ご", "go"],
  ["さ", "ざ", "za"], ["し", "じ", "ji"], ["す", "ず", "zu"], ["せ", "ぜ", "ze"], ["そ", "ぞ", "zo"],
  ["た", "だ", "da"], ["ち", "ぢ", "ji"], ["つ", "づ", "zu"], ["て", "で", "de"], ["と", "ど", "do"],
  ["は", "ば", "ba"], ["ひ", "び", "bi"], ["ふ", "ぶ", "bu"], ["へ", "べ", "be"], ["ほ", "ぼ", "bo"],
];
for (const [baseChar, char, romaji] of dakutenPairs) {
  addKana(char, romaji, "dakuten", baseKanaById.get(baseChar)?.id);
}
const handakutenPairs: [string, string, string][] = [
  ["は", "ぱ", "pa"], ["ひ", "ぴ", "pi"], ["ふ", "ぷ", "pu"], ["へ", "ぺ", "pe"], ["ほ", "ぽ", "po"],
];
for (const [baseChar, char, romaji] of handakutenPairs) {
  addKana(char, romaji, "handakuten", baseKanaById.get(baseChar)?.id);
}

// --- Digraphs (small ゃゅょ) ---
const digraphRows: [string, string, string, string][] = [
  ["しゃ", "sha", "しゅ", "shu"],
  ["じゃ", "ja", "じゅ", "ju"],
  ["ちゃ", "cha", "ちゅ", "chu"],
  ["きゃ", "kya", "きゅ", "kyu"],
  ["ぎゃ", "gya", "ぎゅ", "gyu"],
  ["にゃ", "nya", "にゅ", "nyu"],
  ["ひゃ", "hya", "ひゅ", "hyu"],
  ["びゃ", "bya", "びゅ", "byu"],
  ["ぴゃ", "pya", "ぴゅ", "pyu"],
  ["みゃ", "mya", "みゅ", "myu"],
  ["りゃ", "rya", "りゅ", "ryu"],
];
const digraphOSounds: [string, string][] = [
  ["しょ", "sho"], ["じょ", "jo"], ["ちょ", "cho"], ["きょ", "kyo"], ["ぎょ", "gyo"], ["にょ", "nyo"],
  ["ひょ", "hyo"], ["びょ", "byo"], ["ぴょ", "pyo"], ["みょ", "myo"], ["りょ", "ryo"],
];
for (const [a, aRomaji, u, uRomaji] of digraphRows) {
  addKana(a, aRomaji, "digraph");
  addKana(u, uRomaji, "digraph");
}
for (const [o, oRomaji] of digraphOSounds) {
  addKana(o, oRomaji, "digraph");
}
addKana("っ", "[small tsu — doubles the following consonant]", "small");

notes.push({
  id: nextNoteId(),
  kind: "other",
  text: [
    {
      en: "Long vowels: to lengthen a vowel sound, add あ after an -a syllable, い after -i or -e, う after -u or -o (e.g. おかあさん, おにいさん, せんせい, くうき, とおい). っ (small tsu) before a consonant doubles it, holding the consonant sound briefly (e.g. がっこう).",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: PAGE }],
});

// --- Vocabulary practising the kana (all kana-only) ---
function addVocab(kana_: string, meaning: string): void {
  addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kana: kana_,
    meanings: [{ en: meaning }],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: PAGE }],
  }));
}
addVocab("あおい", "blue");
addVocab("いえ", "house");
addVocab("うえ", "up, above");
addVocab("かお", "face");
addVocab("きく", "to hear, to listen");
addVocab("おおきい", "big");
addVocab("すし", "sushi");
addVocab("かぞく", "family");
addVocab("さけ", "alcohol");
addVocab("した", "below, under");
addVocab("つち", "earth, soil");
addVocab("だいがく", "university");
addVocab("なに", "what");
addVocab("いぬ", "dog");
addVocab("おかね", "money");
addVocab("はな", "flower");
addVocab("ひと", "person");
addVocab("ぶた", "pig");
addVocab("みず", "water");
addVocab("むすめ", "daughter");
addVocab("にわ", "garden");
addVocab("まつ", "to wait");
addVocab("やま", "mountain");
addVocab("よむ", "to read");
addVocab("ゆき", "snow");
addVocab("そら", "sky");
addVocab("する", "to do");
addVocab("だれ", "who");
addVocab("わかる", "to understand");
addVocab("わたし", "I");
addVocab("りんご", "apple");
addVocab("よん", "four");
addVocab("にほんご", "Japanese [language]");
addVocab("おちゃ", "tea");
addVocab("ひゃく", "hundred");
addVocab("じしょ", "dictionary");
addVocab("かのじょ", "she");
addVocab("ちょっと", "a bit");
addVocab("がっこう", "school");
addVocab("せんせい", "teacher");

// --- Basic expressions ---
function addExpression(kanaText: string, meaning: string, kanjiText?: string): void {
  addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kanji: kanjiText,
    kana: kanaText,
    meanings: [{ en: meaning }],
    partOfSpeech: ["expression"],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: PAGE }],
  }));
}
addExpression("こんにちは", "hello");
addExpression("おはよう（ございます）", "good morning [formal]");
addExpression("こんばんは", "good evening");
addExpression("おやすみ（なさい）", "good night [formal]");
addExpression("さようなら", "goodbye");
addExpression("またあした", "see you tomorrow", "また明日");
addExpression("またね", "see you");
addExpression("おつかれさま（でした）", "goodbye [you've done a great job]", "お疲れ様（でした）");
addExpression("はじめまして", "nice to meet you");
addExpression("よろしく（おねがいします）", "nice to meet you [formal]", "よろしく（お願いします）");
addExpression("おげんきですか", "how are you?", "お元気ですか");
addExpression("げんきです", "I'm doing well", "元気です");
addExpression("ください", "please [used with verbs]");
addExpression("おねがいします", "please [used with nouns, formal]", "お願いします");
addExpression("ありがとう（ございます）", "thank you");
addExpression("どういたしまして", "you're welcome");
addExpression("すみません", "excuse me");
addExpression("ごめん（なさい）", "I'm sorry [formal]");
addExpression("はい", "yes");
addExpression("いいえ", "no");
addExpression("いってきます", "[said when leaving] I'm leaving", "行ってきます");
addExpression("いってらっしゃい", "[said to see someone off] take care", "行ってらっしゃい");

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(`src/data/kana/${LESSON_ID}.json`, kana);
saveOwnArray(vocabPath, vocab);
saveOwnArray(`src/data/notes/${LESSON_ID}-content.json`, notes);

console.log(`${LESSON_ID}: ${kana.length} kana, ${vocab.length} vocab, ${notes.length} notes.`);
