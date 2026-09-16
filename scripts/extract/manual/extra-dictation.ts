import { loadOwnArray, saveOwnArray, makeIdSequencer } from "../lib/lessonFile";
import type { DialogueEntry } from "../../../src/data/types";

/**
 * Hand-authored content for "Extra Activity - Dictation 1.pdf": a
 * self-introduction narrative. The Japanese text is an image with full
 * furigana (pdftotext returns nothing for that page) and was read
 * visually; the English translation was given as regular text.
 *
 * Filed under the general "extra-practice" lesson bucket — see
 * docs/source-inventory.md group E.
 *
 * Usage: tsx scripts/extract/manual/extra-dictation.ts
 */

const FILE = "Extra Activity - Dictation 1.pdf";
const LESSON_ID = "extra-practice";

const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);
const nextDialogueId = makeIdSequencer(dialogues, `${LESSON_ID}-dialogue-`);

function l(japanese: string, reading: string, en: string) {
  return { speaker: "Takumi", japanese, reading, meanings: [{ en }] };
}

dialogues.push({
  id: nextDialogueId(),
  title: "Dictation 1 — Takumi's self-introduction",
  lines: [
    l("こんにちは。", "こんにちは。", "Hello."),
    l("たくみだ。", "たくみだ。", "I'm Takumi."),
    l("日本人だ。", "にほんじんだ。", "I'm Japanese."),
    l("二十二歳だ。", "にじゅうにさいだ。", "I'm twenty-two years old."),
    l("日本から来た。", "にほんからきた。", "I come from Japan."),
    l("これは私の家族だ。", "これはわたしのかぞくだ。", "This is my family."),
    l("母はみのりだ。", "はははみのりだ。", "My mother's name is Minori."),
    l("中国から来た。", "ちゅうごくからきた。", "She comes from China."),
    l("父はりゅうだ。", "ちちはりゅうだ。", "My father's name is Ryū."),
    l("韓国人だ。", "かんこくじんだ。", "He is Korean."),
    l("弟が二人いる。", "おとうとがふたりいる。", "I have two younger brothers."),
    l("あきらとやまとだ。", "あきらとやまとだ。", "Their names are Akira and Yamato."),
    l("あきらは学校へ行く。", "あきらはがっこうへいく。", "Akira goes to school."),
    l("でも、やまとは大学へ行く。", "でも、やまとはだいがくへいく。", "But Yamato goes to university."),
    l("私は日本語と中国語と韓国語を話す。", "わたしはにほんごとちゅうごくごとかんこくごをはなす。", "I speak Japanese, Chinese, and Korean."),
    l(
      "土曜日に働いて、本を読んで、フランス語を勉強する。",
      "どようびにはたらいて、ほんをよんで、フランスごをべんきょうする。",
      "On Saturdays, I work, read books, and study French.",
    ),
    l("フランスで働きたい。", "フランスではたらきたい。", "I want to work in France."),
    l("弟はフランス語を話さない。", "おとうとはフランスごをはなさない。", "My younger brothers don't speak French."),
    l("英語を勉強する。", "えいごをべんきょうする。", "They study English."),
    l("家に犬が一匹と猫が三匹いる。", "いえにいぬがいっぴきとねこがさんびきいる。", "At home, I have one dog and three cats."),
    l("でも、魚がいない。", "でも、さかながいない。", "But I don't have any fish."),
    l("またね。", "またね。", "See you."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 1, note: "Japanese text is an image with furigana; read visually" }],
});

saveOwnArray(dialoguesPath, dialogues);
console.log(`${LESSON_ID}: ${dialogues.length} dialogues total (Dictation 1 contribution).`);
