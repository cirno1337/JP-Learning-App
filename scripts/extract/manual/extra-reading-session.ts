import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { DialogueEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored content for "Extra Activity - Reading Session 1.pdf": a
 * 10-part reading passage with per-word furigana and English translations
 * given directly in the source text (no visual reading needed here — this
 * file's text extracted cleanly). Full sentence readings below combine the
 * given furigana with standard readings for the few words the source didn't
 * annotate (all common A2 vocabulary already used elsewhere in the course).
 *
 * Filed under the general "extra-practice" lesson bucket — see
 * docs/source-inventory.md group E.
 *
 * Usage: tsx scripts/extract/manual/extra-reading-session.ts
 */

const FILE = "Extra Activity - Reading Session 1.pdf";
const LESSON_ID = "extra-practice";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;
const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextDialogueId = makeIdSequencer(dialogues, `${LESSON_ID}-dialogue-`);

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

vocabWord("兄", "あに", "older brother", 2);
vocabWord("妹", "いもうと", "younger sister", 1);
vocabWord("辞書", "じしょ", "dictionary", 6);
vocabWord(undefined, "ノート", "notebook", 6);
vocabWord("新聞", "しんぶん", "newspaper", 9);
vocabWord("音楽", "おんがく", "music", 9);
vocabWord("自然", "しぜん", "nature", 8);
vocabWord("待つ", "まつ", "to wait", 7, ["verb-godan"]);
vocabWord("庭", "にわ", "garden", 10);
vocabWord("花", "はな", "flower", 10);

function l(japanese: string, reading: string, en: string) {
  return { japanese, reading, meanings: [{ en }] };
}

dialogues.push({
  id: nextDialogueId(),
  title: "Reading Session 1",
  lines: [
    l("私は日本人です。", "わたしはにほんじんです。", "I am Japanese."),
    l("家に父と母と兄と妹と犬がいます。", "いえにちちとははとあにといもうといぬがいます。", "At home, I have my father, mother, older brother, younger sister, and a dog."),
    l("父は先生です。", "ちちはせんせいです。", "My father is a teacher."),
    l("兄は大学へ行きます。", "あにはだいがくへいきます。", "My older brother goes to university."),
    l("妹は学校へ行きます。", "いもうとはがっこうへいきます。", "My younger sister goes to school."),
    l("私は学生です。", "わたしはがくせいです。", "I am a student."),
    l("朝、パンとチーズを食べます。", "あさ、パンとチーズをたべます。", "In the morning, I eat bread and cheese."),
    l("お茶を飲みます。", "おちゃをのみます。", "I drink tea."),
    l("学校へ行きます。", "がっこうへいきます。", "I go to school."),
    l("先生は日本語を話します。", "せんせいはにほんごをはなします。", "My teacher speaks Japanese."),
    l("私は日本語を聞きます。", "わたしはにほんごをききます。", "I listen to Japanese."),
    l("日本語を読みます。", "にほんごをよみます。", "I read Japanese."),
    l("友だちはフランス人です。", "ともだちはフランスじんです。", "My friend is French."),
    l("英語とフランス語を話します。", "えいごとフランスごをはなします。", "They speak English and French."),
    l("私は英語も話します。", "わたしはえいごもはなします。", "I also speak English."),
    l("家に本と辞書があります。", "いえにほんとじしょがあります。", "There are books and a dictionary at home."),
    l("ノートもあります。", "ノートもあります。", "There is also a notebook."),
    l("私は本を読みます。", "わたしはほんをよみます。", "I read books."),
    l("今日は日曜日です。", "きょうはにちようびです。", "Today is Sunday."),
    l("私は先生を待ちます。", "わたしはせんせいをまちます。", "I wait for my teacher."),
    l("家へ来ます。", "いえへきます。", "I come home."),
    l("家で日本語を読みます。", "いえでにほんごをよみます。", "I read Japanese at home."),
    l("山の上に雪があります。", "やまのうえにゆきがあります。", "There is snow on the mountain."),
    l("山の下に土があります。", "やまのしたにつちがあります。", "There is soil below the mountain."),
    l("自然があります。", "しぜんがあります。", "There is nature."),
    l("父は新聞を読みます。", "ちちはしんぶんをよみます。", "My father reads the newspaper."),
    l("母は音楽を聞きます。", "はははおんがくをききます。", "My mother listens to music."),
    l("兄はゲームをします。", "あにはゲームをします。", "My older brother plays games."),
    l("犬は庭にいます。", "いぬはにわにいます。", "The dog is in the garden."),
    l("庭に花があります。", "にわにはながあります。", "There are flowers in the garden."),
    l("空は青いです。", "そらはあおいです。", "The sky is blue."),
    l("山もあります。", "やまもあります。", "There is also a mountain."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 1, note: "10-part reading passage, pages 1-10" }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(dialoguesPath, dialogues);

console.log(`${LESSON_ID}: ${vocab.length} vocab total, ${dialogues.length} dialogues total (Reading Session 1 contribution).`);
