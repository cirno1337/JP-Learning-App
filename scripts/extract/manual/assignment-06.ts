import { loadOwnArray, saveOwnArray, makeIdSequencer, loadCrossLessonIndex, writeDirtyExternalFiles, addOrMergeVocab } from "../lib/lessonFile";
import type { NoteEntry, VocabularyEntry } from "../../../src/data/types";

/**
 * Hand-authored content for "ASSIGNMENT N°06.pdf" (tied to class-06). This
 * is a fill-in-the-blank worksheet: most cells are intentionally left blank
 * for the student, with the answer key only in Google Classroom (not
 * available here) — so most of it cannot be extracted without inventing
 * answers, which the project's instructions explicitly forbid.
 *
 * What IS extracted:
 * - Exercise 1 (vocabulary): only the two pairs given complete in the
 *   source (アパート/apartment building, 鏡/mirror). The blank pairs
 *   (壁/床/地下室/冷蔵庫 needing English; toothbrush/hair dryer/wardrobe/
 *   paper/computer needing Japanese) are NOT guessed.
 * - Exercise 2 & 3 (imperative / volitional conjugation drills): the six
 *   practice verbs (to eat/play/speak/sleep/listen/do) are all regular and
 *   the conjugation rules were already confirmed from class-06's own
 *   grammar section (src/data/conjugation/class-06.json) — recorded here as
 *   a derived answer-key note, not fabricated.
 * - Exercise 4 (translation): every sentence in this exercise is verified
 *   to already exist in class-06's comprehensible-input dialogue (see
 *   src/data/dialogues/class-06.json) — cross-referenced, not re-typed as
 *   new content.
 * - Exercise 5 (kanji word-search grid, "wall"): a visual puzzle with no
 *   standalone extractable content beyond kanji already in the dataset.
 *
 * Usage: tsx scripts/extract/manual/assignment-06.ts
 */

const FILE = "ASSIGNMENT N°06.pdf";
const LESSON_ID = "class-06";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const notesPath = `src/data/notes/${LESSON_ID}-assignment.json`;
const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const notes: NoteEntry[] = [];

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextNoteId = makeIdSequencer(notes, `${LESSON_ID}-note-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();
function vocabWord(kanji: string | undefined, kana: string, meaning: string) {
  return addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kanji,
    kana,
    meanings: [{ en: meaning }],
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 1 }],
  }));
}

// Only the pairs given complete (not left blank) in Exercise 1.
vocabWord(undefined, "アパート", "apartment building");
vocabWord("鏡", "かがみ", "mirror");

notes.push({
  id: nextNoteId(),
  kind: "teacher-note",
  text: [
    {
      en: "Exercise 2 & 3 answer key (imperative / volitional forms of the week's regular verbs, derived from class-06's own conjugation rules, all regular — no exceptions apply to these six verbs): 食べる(たべる, to eat) → 食べてください / 食べないでください / 食べよう / 食べましょう. 遊ぶ(あそぶ, to play) → 遊んでください / 遊ばないでください / 遊ぼう / 遊びましょう. 話す(はなす, to speak) → 話してください / 話さないでください / 話そう / 話しましょう. 寝る(ねる, to sleep) → 寝てください / 寝ないでください / 寝よう / 寝ましょう. 聞く(きく, to listen) → 聞いてください / 聞かないでください / 聞こう / 聞きましょう. する(to do) → してください / しないでください / しよう / しましょう.",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "generated",
  source: [{ file: FILE, note: "Exercise 2 & 3 — answers derived from class-06's own imperative/volitional conjugation rules, not given in the source" }],
});

notes.push({
  id: nextNoteId(),
  kind: "other",
  text: [
    {
      en: "Exercise 4 (translation practice) reuses sentences from this class's own comprehensible-input reading passage almost verbatim (see the class-06 dialogue for the confirmed Japanese/English pairs and readings): 朝でした (it was morning), 明るかったです (it was bright), 電話でメッセージを読みました (he read messages on his phone), その後で、朝ご飯を食べました (after that, he ate breakfast), 食べた後で、部屋に行きました (after eating, he went to his room), 朝ご飯の前に手を洗いました (he washed his hands before breakfast).",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, note: "Exercise 4 — cross-referenced against src/data/dialogues/class-06.json" }],
});

notes.push({
  id: nextNoteId(),
  kind: "other",
  text: [
    {
      en: "Exercise 1 (vocabulary) and Exercise 5 (kanji word-search grid, themed around \"wall\") in this assignment are largely fill-in-the-blank with the answer key only in Google Classroom — not extracted here to avoid inventing unconfirmed vocabulary/kanji pairings.",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, note: "Exercise 1 and 5 — left blank in source, not extracted" }],
});

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(notesPath, notes);

console.log(`${LESSON_ID}: +2 vocab (confirmed pairs only), ${notes.length} notes (Assignment N°06 contribution).`);
