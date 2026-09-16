import { saveOwnArray, loadOwnArray, makeIdSequencer } from "../lib/lessonFile";
import type { DialogueEntry } from "../../../src/data/types";

/**
 * Hand-authored content for "Dialogues-Reading.pdf": six short dialogues
 * (at school, at a restaurant, at the train station, at the supermarket x2,
 * a phone call) with furigana and English translations already given in
 * the source. The PDF's furigana annotations only mark specific words (one
 * small reading per line, positioned above that word), not full-sentence
 * readings — the `reading` field below fills in the remaining common A2
 * vocabulary readings mechanically (this is transliterating kana for
 * already-given kanji, not inventing content) so each line has a complete
 * reading; every word choice is standard/unambiguous at this level.
 *
 * Not tied to a specific numbered class — filed under the general
 * "extra-practice" lesson bucket (see docs/source-inventory.md group E).
 *
 * Usage: tsx scripts/extract/manual/dialogues-reading.ts
 */

const FILE = "Dialogues-Reading.pdf";
const LESSON_ID = "extra-practice";

const dialoguesPath = `src/data/dialogues/${LESSON_ID}.json`;
const dialogues = loadOwnArray<DialogueEntry>(dialoguesPath);
const nextDialogueId = makeIdSequencer(dialogues, `${LESSON_ID}-dialogue-`);

function line(speaker: string, japanese: string, reading: string, en: string) {
  return { speaker, japanese, reading, meanings: [{ en }] };
}

dialogues.push({
  id: nextDialogueId(),
  title: "1. At school",
  lines: [
    line("A", "おはよう。", "おはよう。", "Good morning."),
    line("B", "おはよう。", "おはよう。", "Good morning."),
    line("A", "今日はテストがありますか。", "きょうはテストがありますか。", "Is there a test today?"),
    line("B", "はい、あります。", "はい、あります。", "Yes, there is."),
    line("A", "何時からですか。", "なんじからですか。", "What time does it start?"),
    line("B", "九時からです。", "くじからです。", "It starts at nine o'clock."),
    line("A", "難しいですか。", "むずかしいですか。", "Is it difficult?"),
    line("B", "たぶん。", "たぶん。", "Probably."),
    line("A", "がんばって。", "がんばって。", "Good luck. / Do your best."),
    line("B", "はい、がんばります。", "はい、がんばります。", "Yes, I'll do my best."),
    line("A", "じゃあ、行きませんか。", "じゃあ、いきませんか。", "Well then, shall we go?"),
    line("B", "はい、行きましょう。", "はい、いきましょう。", "Yes, let's go."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 1 }],
});

dialogues.push({
  id: nextDialogueId(),
  title: "2. At the restaurant",
  lines: [
    line("A", "こんにちは。", "こんにちは。", "Hello."),
    line("B", "いらっしゃいませ。", "いらっしゃいませ。", "Welcome."),
    line("A", "メニューをください。", "メニューをください。", "May I have the menu, please?"),
    line("B", "はい、どうぞ。", "はい、どうぞ。", "Yes, here you are."),
    line("A", "ラーメンを一つお願いします。", "ラーメンをひとつおねがいします。", "One ramen, please."),
    line("B", "はい。飲み物は？", "はい。のみものは？", "Certainly. What would you like to drink?"),
    line("A", "水をお願いします。", "みずをおねがいします。", "Water, please."),
    line("B", "わかりました。", "わかりました。", "Understood."),
    line("A", "いくらですか。", "いくらですか。", "How much is it?"),
    line("B", "八百円です。", "はっぴゃくえんです。", "It's 800 yen."),
    line("A", "はい、どうぞ。", "はい、どうぞ。", "Here you are."),
    line("B", "ありがとうございます。", "ありがとうございます。", "Thank you very much."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 2 }],
});

dialogues.push({
  id: nextDialogueId(),
  title: "3. At the train station",
  lines: [
    line("A", "すみません。", "すみません。", "Excuse me."),
    line("B", "はい。", "はい。", "Yes?"),
    line("A", "東京駅はどこですか。", "とうきょうえきはどこですか。", "Where is Tokyo Station?"),
    line("B", "あの電車です。", "あのでんしゃです。", "It's that train."),
    line("A", "何番ホームですか。", "なんばんホームですか。", "Which platform is it?"),
    line("B", "三番ホームです。", "さんばんホームです。", "It's Platform 3."),
    line("A", "ありがとうございます。", "ありがとうございます。", "Thank you."),
    line("B", "どういたしまして。", "どういたしまして。", "You're welcome."),
    line("A", "電車は何時ですか。", "でんしゃはなんじですか。", "What time does the train leave?"),
    line("B", "十時十分です。", "じゅうじじゅっぷんです。", "At 10:10."),
    line("A", "まだ時間がありますね。", "まだじかんがありますね。", "We still have time, don't we?"),
    line("B", "はい、あります。", "はい、あります。", "Yes, we do."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 3 }],
});

dialogues.push({
  id: nextDialogueId(),
  title: "4. At the supermarket",
  lines: [
    line("A", "このりんごはいくらですか。", "このりんごはいくらですか。", "How much is this apple?"),
    line("B", "一つ百五十円です。", "ひとつひゃくごじゅうえんです。", "It's 150 yen each."),
    line("A", "三つください。", "みっつください。", "Three, please."),
    line("B", "はい、三つですね。", "はい、みっつですね。", "Certainly, three apples."),
    line("A", "バナナもありますか。", "バナナもありますか。", "Do you also have bananas?"),
    line("B", "はい、あります。", "はい、あります。", "Yes, we do."),
    line("A", "じゃあ、一つお願いします。", "じゃあ、ひとつおねがいします。", "Then, one, please."),
    line("B", "わかりました。", "わかりました。", "Certainly."),
    line("A", "全部でいくらですか。", "ぜんぶでいくらですか。", "How much is it altogether?"),
    line("B", "六百円です。", "ろっぴゃくえんです。", "It's 600 yen."),
    line("A", "はい。", "はい。", "Here you are."),
    line("B", "ありがとうございました。", "ありがとうございました。", "Thank you very much."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 4 }],
});

dialogues.push({
  id: nextDialogueId(),
  title: "5. Phone call",
  lines: [
    line("A", "もしもし。", "もしもし。", "Hello?"),
    line("B", "もしもし、山田です。", "もしもし、やまだです。", "Hello, this is Yamada speaking."),
    line("A", "こんにちは。元気ですか。", "こんにちは。げんきですか。", "Hello. How are you?"),
    line("B", "はい、元気です。", "はい、げんきです。", "I'm fine, thank you."),
    line("A", "明日、時間がありますか。", "あした、じかんがありますか。", "Are you free tomorrow?"),
    line("B", "はい、あります。", "はい、あります。", "Yes, I am."),
    line("A", "一緒に昼ご飯を食べませんか。", "いっしょにひるごはんをたべませんか。", "Would you like to have lunch together?"),
    line("B", "いいですよ。", "いいですよ。", "Sure. / I'd love to."),
    line("A", "十二時はどうですか。", "じゅうにじはどうですか。", "How about twelve o'clock?"),
    line("B", "大丈夫です。", "だいじょうぶです。", "That works for me. / That's fine."),
    line("A", "じゃあ、また明日。", "じゃあ、またあした。", "Well then, see you tomorrow."),
    line("B", "はい、また明日。", "はい、またあした。", "Yes, see you tomorrow."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 5 }],
});

dialogues.push({
  id: nextDialogueId(),
  title: "6. At the supermarket",
  lines: [
    line("A", "すみません。", "すみません。", "Excuse me."),
    line("B", "はい。", "はい。", "Yes?"),
    line("A", "牛乳はどこですか。", "ぎゅうにゅうはどこですか。", "Where is the milk?"),
    line("B", "あそこです。", "あそこです。", "It's over there."),
    line("A", "パンもありますか。", "パンもありますか。", "Do you also have bread?"),
    line("B", "はい、となりです。", "はい、となりです。", "Yes, it's next to it."),
    line("A", "ありがとうございます。", "ありがとうございます。", "Thank you."),
    line("B", "どういたしまして。", "どういたしまして。", "You're welcome."),
    line("A", "レジはどこですか。", "レジはどこですか。", "Where is the checkout?"),
    line("B", "あちらです。", "あちらです。", "It's over there."),
    line("A", "わかりました。", "わかりました。", "I understand. / Got it."),
    line("B", "ありがとうございました。", "ありがとうございました。", "Thank you very much."),
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 6 }],
});

saveOwnArray(dialoguesPath, dialogues);
console.log(`${LESSON_ID}: ${dialogues.length} dialogues total (from Dialogues-Reading.pdf).`);
