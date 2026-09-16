import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { KanaEntry, NoteEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored content for Class B (19 June 2026), transcribed from
 * "Class B - synthesis & assignments.pdf": the full katakana chart (base
 * grid, dakuten/handakuten, standard digraphs, and the extended digraphs
 * used for loanwords like ファ/ティ/ヴ), 30 katakana loanword vocabulary
 * words, useful external links, and the romaji-input typing guide.
 *
 * Usage: tsx scripts/extract/manual/class-b-content.ts
 */

const FILE = "Class B - synthesis & assignments.pdf";
const LESSON_ID = "class-b";
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
    chart: "katakana",
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

// --- Base grid ---
const baseRows: [string, string][] = [
  ["ア", "a"], ["カ", "ka"], ["ガ", "ga"], ["サ", "sa"], ["ザ", "za"], ["タ", "ta"], ["ダ", "da"], ["ナ", "na"], ["ハ", "ha"], ["バ", "ba"], ["パ", "pa"], ["マ", "ma"], ["ヤ", "ya"], ["ラ", "ra"], ["ワ", "wa"],
];
const iRow: [string, string][] = [["イ", "i"], ["キ", "ki"], ["ギ", "gi"], ["シ", "shi"], ["ジ", "ji"], ["チ", "chi"], ["ヂ", "ji"], ["ニ", "ni"], ["ヒ", "hi"], ["ビ", "bi"], ["ピ", "pi"], ["ミ", "mi"], ["リ", "ri"]];
const uRow: [string, string][] = [["ウ", "u"], ["ク", "ku"], ["グ", "gu"], ["ス", "su"], ["ズ", "zu"], ["ツ", "tsu"], ["ヅ", "zu"], ["ヌ", "nu"], ["フ", "fu"], ["ブ", "bu"], ["プ", "pu"], ["ム", "mu"], ["ユ", "yu"], ["ル", "ru"]];
const eRow: [string, string][] = [["エ", "e"], ["ケ", "ke"], ["ゲ", "ge"], ["セ", "se"], ["ゼ", "ze"], ["テ", "te"], ["デ", "de"], ["ネ", "ne"], ["ヘ", "he"], ["ベ", "be"], ["ペ", "pe"], ["メ", "me"], ["レ", "re"]];
const oRow: [string, string][] = [["オ", "o"], ["コ", "ko"], ["ゴ", "go"], ["ソ", "so"], ["ゾ", "zo"], ["ト", "to"], ["ド", "do"], ["ノ", "no"], ["ホ", "ho"], ["ボ", "bo"], ["ポ", "po"], ["モ", "mo"], ["ヨ", "yo"], ["ロ", "ro"], ["ヲ", "wo"]];
for (const [char, romaji] of [...baseRows, ...iRow, ...uRow, ...eRow, ...oRow]) addKana(char, romaji, "base");
addKana("ン", "n", "base");

// --- Standard digraphs ---
const digraphs: [string, string][] = [
  ["シャ", "sha"], ["ジャ", "ja"], ["チャ", "cha"], ["キャ", "kya"], ["ギャ", "gya"], ["ニャ", "nya"], ["ヒャ", "hya"], ["ビャ", "bya"], ["ピャ", "pya"], ["ミャ", "mya"], ["リャ", "rya"],
  ["シュ", "shu"], ["ジュ", "ju"], ["チュ", "chu"], ["キュ", "kyu"], ["ギュ", "gyu"], ["ニュ", "nyu"], ["ヒュ", "hyu"], ["ビュ", "byu"], ["ピュ", "pyu"], ["ミュ", "myu"], ["リュ", "ryu"],
  ["ショ", "sho"], ["ジョ", "jo"], ["チョ", "cho"], ["キョ", "kyo"], ["ギョ", "gyo"], ["ニョ", "nyo"], ["ヒョ", "hyo"], ["ビョ", "byo"], ["ピョ", "pyo"], ["ミョ", "myo"], ["リョ", "ryo"],
  ["シェ", "she"], ["ジェ", "je"], ["チェ", "che"],
];
for (const [char, romaji] of digraphs) addKana(char, romaji, "digraph");

// --- Extended digraphs used for loanword sounds not in the base/standard-digraph charts ---
// (The source's full TY/DY/KW/V/S/Z/T/D/TS table also repeats several base
// kana and offers alternate-convention readings for characters already
// covered above, e.g. チャ as both standard "cha" and alternate "tya" — only
// the combinations that introduce a genuinely new katakana glyph are kept
// here, to avoid asserting a specific romanisation for an ambiguous cell.)
const extendedDigraphs: [string, string][] = [
  ["ファ", "fa"], ["フィ", "fi"], ["フェ", "fe"], ["フォ", "fo"],
  ["ウィ", "wi"], ["ウェ", "we"], ["ウォ", "wo"],
  ["ヴァ", "va"], ["ヴィ", "vi"], ["ヴ", "vu"], ["ヴェ", "ve"], ["ヴォ", "vo"],
  ["ティ", "ti"], ["トゥ", "tu"], ["ディ", "di"], ["ドゥ", "du"],
  ["スィ", "si"], ["ズィ", "zi"],
  ["ツァ", "tsa"], ["ツィ", "tsi"], ["ツェ", "tse"], ["ツォ", "tso"],
];
for (const [char, romaji] of extendedDigraphs) addKana(char, romaji, "digraph");

notes.push({
  id: nextNoteId(),
  kind: "other",
  text: [
    { en: "Katakana follows the same break (ッ, doubles the following consonant) and long-vowel rules as hiragana, except the long vowel is always written with the dash ー rather than a repeated vowel kana." },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: PAGE }],
});

// --- Katakana loanword vocabulary ---
addVocab("エアー", "air");
addVocab("ケーキ", "cake");
addVocab("エコー", "echo");
addVocab("ココア", "cocoa");
addVocab("ソース", "sauce");
addVocab("スイカ", "watermelon");
addVocab("ソーセージ", "sausage");
addVocab("ドア", "door");
addVocab("チーズ", "cheese");
addVocab("テスト", "test");
addVocab("テニス", "tennis");
addVocab("ノート", "notebook");
addVocab("カジノ", "casino");
addVocab("スプーン", "spoon");
addVocab("ナイフ", "knife");
addVocab("フォーク", "fork");
addVocab("ハム", "ham");
addVocab("ゲーム", "game");
addVocab("メイク", "makeup");
addVocab("マヨネーズ", "mayonnaise");
addVocab("シャツ", "shirt");
addVocab("ニューヨーク", "New York");
addVocab("カメラ", "camera");
addVocab("ホテル", "hotel");
addVocab("ラジオ", "radio");
addVocab("ワイン", "wine");
addVocab("レストラン", "restaurant");
addVocab("パン", "bread");
addVocab("チャレンジ", "challenge");
addVocab("チューインガム", "chewing gum");
addVocab("ミュージシャン", "musician");
addVocab("ジュース", "juice");
addVocab("チョコレート", "chocolate");
addVocab("ソファ", "sofa");
addVocab("ファッション", "fashion");
addVocab("ショック", "shock");
addVocab("コンピューター", "computer");
addVocab("ベッド", "bed");
addVocab("サンドイッチ", "sandwich");
addVocab("ヨーグルト", "yoghurt");

// --- Useful links (p.1) ---
notes.push({
  id: nextNoteId(),
  kind: "useful-link",
  text: [
    {
      en: "Jisho (Japanese-English dictionary): jisho.org. PlayPhrase.me (words/sentences in movies): playphrase.me. YouGlish (words/sentences in YouTube videos): youglish.com/japanese. Say-It-In-Your-Language Glossary (collaborative multilingual glossary). A collaborative Spotify playlist made by the course community.",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 1, note: "Useful links section" }],
});

// --- Japanese keyboard / romaji input guide ---
notes.push({
  id: nextNoteId(),
  kind: "other",
  text: [
    {
      en: "Typing Japanese uses a QWERTY keyboard with romaji input, converted by the IME: type the romaji reading (e.g. \"arigatou\" for ありがとう) then press Enter to confirm. Punctuation: period → 。, comma → 、. Small kana (ゃゅょっ etc.) are typed by prefixing x or l (e.g. xya or lya → ゃ); a doubled consonant (っ) is typed by doubling the following consonant letter (e.g. \"kko\" → っこ). On Windows, F6/F7 convert the current input to hiragana/katakana; on Mac, control+J/control+K do the same. The long vowel mark ー is next to the \"0\" key. For kanji, type the reading and press the spacebar repeatedly to cycle through candidate kanji.",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 5, note: "Japanese Keyboard section" }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(`src/data/kana/${LESSON_ID}.json`, kana);
saveOwnArray(vocabPath, vocab);
saveOwnArray(`src/data/notes/${LESSON_ID}-content.json`, notes);

console.log(`${LESSON_ID}: ${kana.length} kana, ${vocab.length} vocab, ${notes.length} notes.`);
