import {
  loadOwnArray,
  saveOwnArray,
  makeIdSequencer,
  loadCrossLessonIndex,
  writeDirtyExternalFiles,
  addOrMergeVocab,
} from "../lib/lessonFile";
import type {
  ConjugationRule,
  ExampleSentence,
  GrammarEntry,
  NoteEntry,
  NumberEntry,
  VocabularyEntry,
} from "../../../src/data/types";

/**
 * Hand-authored content for class-01, transcribed from "CLASS N°01 — The
 * Japanese Summer Challenge.pdf" (142 pages, no synthesis doc exists for
 * this class). The vocabulary section (pages 3-73) uses a furigana-over-
 * kanji vertical layout that scrambles in pdftotext, so it was read
 * visually from rendered page images (pdftoppm); the conjugation/grammar
 * sections (pages 74-142) extract cleanly as plain text and were read that
 * way. Kanji themselves are NOT re-extracted here — class-01's kanji are
 * already fully covered by KANJI - SET N°01 (via parseKanjiSet.ts); this
 * script only adds words/grammar the class deck itself introduces.
 *
 * Content:
 * - Vocabulary: countries/nationalities/languages (p.3-12, +30), a 156-word
 *   "optional" world country list (p.13-27, kept as one note rather than
 *   individual entries per the source's own "optional" framing), family &
 *   people (p.28-35), general vocabulary (p.46-49), animals (p.55-56),
 *   food & drink (p.65-69).
 * - Grammar/conjugation: pronouns incl. honorific suffixes (p.75-89), verb
 *   groups / the 5-stem (a-i-u-e-o) system incl. irregular verbs だ/ある/
 *   行く/来る/する (p.90-98), verbs of the week (p.100-104), essential
 *   particles は/が/を/に/と/も/から/か/よ (p.106-122), present tense
 *   affirmative/negative/polite/polite-negative (p.123-130), numbers 0-10
 *   (p.131-132).
 *
 * "Kanji related to the vocabulary" component/radical breakdown pages
 * scattered throughout (e.g. 私/僕/俺/自分/君/お前/皆さん/彼/様, 飲む/
 * 話す/見る/行く/来る, 三/四/六/七/八/九) are supplementary etymological
 * notes, not part of the course's actual kanji-of-the-week curriculum
 * (verified: none of those characters appear in KANJI - SET N°01), and are
 * skipped as low-value relative to effort (this is a case of the class
 * deck showing informational kanji trivia for words already taught, not
 * a taught reading -- most of these give no new reading anyway).
 *
 * Usage: tsx scripts/extract/manual/class-01-content.ts
 */

const FILE = "CLASS N°01 — The Japanese Summer Challenge.pdf";
const LESSON_ID = "class-01";

const vocabPath = `src/data/vocabulary/${LESSON_ID}.json`;
const examplesPath = `src/data/examples/${LESSON_ID}.json`;
const grammarPath = `src/data/grammar/${LESSON_ID}.json`;
const conjugationPath = `src/data/conjugation/${LESSON_ID}.json`;
const numbersPath = `src/data/numbers/${LESSON_ID}.json`;
const notesPath = `src/data/notes/${LESSON_ID}-content.json`;

const vocab = loadOwnArray<VocabularyEntry>(vocabPath);
const examples = loadOwnArray<ExampleSentence>(examplesPath);
const grammar = loadOwnArray<GrammarEntry>(grammarPath);
const conjugation = loadOwnArray<ConjugationRule>(conjugationPath);
const numbers = loadOwnArray<NumberEntry>(numbersPath);
const notes = loadOwnArray<NoteEntry>(notesPath);

const nextVocabId = makeIdSequencer(vocab, `${LESSON_ID}-vocab-`);
const nextExampleId = makeIdSequencer(examples, `${LESSON_ID}-example-`);
const nextGrammarId = makeIdSequencer(grammar, `${LESSON_ID}-grammar-`);
const nextConjugationId = makeIdSequencer(conjugation, `${LESSON_ID}-conjugation-`);
const nextNumberId = makeIdSequencer(numbers, `${LESSON_ID}-number-`);
const nextNoteId = makeIdSequencer(notes, `${LESSON_ID}-note-`);

const vocabDir = "src/data/vocabulary";
const vocabIndex = loadCrossLessonIndex<VocabularyEntry>(vocabDir, vocabPath, vocab, (v) => `${v.kanji ?? ""}|${v.kana}`);
const dirtyVocabFiles = new Set<string>();

function vocabWord(
  kanji: string | undefined,
  kana: string,
  meaning: string,
  page: number,
  pos?: VocabularyEntry["partOfSpeech"],
  notesText?: string,
) {
  return addOrMergeVocab(vocabIndex, dirtyVocabFiles, vocab, vocabPath, () => ({
    id: nextVocabId(),
    kanji,
    kana,
    meanings: [{ en: meaning }],
    partOfSpeech: pos,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page }],
    ...(notesText ? { notes: notesText } : {}),
  }));
}
function example(japanese: string, meaning: string, page: number, reading?: string): ExampleSentence {
  return { id: nextExampleId(), japanese, reading, meanings: [{ en: meaning }], origin: "course", source: [{ file: FILE, page }] };
}

// =====================================================================
// VOCABULARY: Countries, Nationalities & Languages (p.6-12)
// =====================================================================
type CountryDef = {
  country: [string, string, string];
  person?: [string, string, string];
  language?: [string, string, string];
};
const countries: CountryDef[] = [
  { country: ["中国", "ちゅうごく", "China"], person: ["中国人", "ちゅうごくじん", "Chinese (person)"], language: ["中国語", "ちゅうごくご", "Chinese (language)"] },
  { country: ["韓国", "かんこく", "South Korea"], person: ["韓国人", "かんこくじん", "Korean (person)"], language: ["韓国語", "かんこくご", "Korean (language)"] },
  { country: ["アメリカ", "アメリカ", "America (USA)"], person: ["アメリカ人", "アメリカじん", "American (person)"] },
  { country: ["日本", "にほん", "Japan"], person: ["日本人", "にほんじん", "Japanese (person)"], language: ["日本語", "にほんご", "Japanese (language)"] },
  { country: ["ロシア", "ロシア", "Russia"], person: ["ロシア人", "ロシアじん", "Russian (person)"], language: ["ロシア語", "ロシアご", "Russian (language)"] },
  { country: ["フランス", "フランス", "France"], person: ["フランス人", "フランスじん", "French (person)"], language: ["フランス語", "フランスご", "French (language)"] },
  { country: ["イギリス", "イギリス", "United Kingdom"], person: ["イギリス人", "イギリスじん", "British (person)"], language: ["英語", "えいご", "English (language)"] },
  { country: ["スペイン", "スペイン", "Spain"], person: ["スペイン人", "スペインじん", "Spanish (person)"], language: ["スペイン語", "スペインご", "Spanish (language)"] },
  { country: ["ドイツ", "ドイツ", "Germany"], person: ["ドイツ人", "ドイツじん", "German (person)"], language: ["ドイツ語", "ドイツご", "German (language)"] },
  { country: ["ベルギー", "ベルギー", "Belgium"], person: ["ベルギー人", "ベルギーじん", "Belgian (person)"] },
];
for (const c of countries) {
  const [ck, ckana, cmeaning] = c.country;
  vocabWord(ck === ckana ? undefined : ck, ckana, cmeaning, 6, ["proper-noun"]);
  if (c.person) {
    const [pk, pkana, pmeaning] = c.person;
    vocabWord(pk === pkana ? undefined : pk, pkana, pmeaning, 8, ["noun"]);
  }
  if (c.language) {
    const [lk, lkana, lmeaning] = c.language;
    vocabWord(lk === lkana ? undefined : lk, lkana, lmeaning, 9, ["noun"]);
  }
}

// The teacher's own "optional" full world country list (156 countries,
// p.13-27) — kept as one reference note rather than 156 individual
// VocabularyEntry records, matching the source's own "optional" framing.
notes.push({
  id: nextNoteId(),
  kind: "other",
  text: [
    {
      en: "Optional/bonus vocabulary: a full list of ~156 world country names in Japanese, explicitly marked optional by the teacher (not core vocabulary). Examples: アフガニスタン=Afghanistan, アメリカ/米国(べいこく)=America (USA), オーストラリア/濠洲(ごうしゅう)=Australia, 中国(ちゅうごく)=China, 英国(えいこく)/イギリス=Great Britain, 香港(ほんこん)=Hong Kong, 北朝鮮(きたちょうせん)=North Korea, 韓国(かんこく)=South Korea, 台湾(たいわん)=Taiwan, and many more — see the source PDF pages 13-27 for the complete list.",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 13, note: "Full list spans pages 13-27; not transcribed in full since the teacher marks it optional" }],
});

// =====================================================================
// VOCABULARY: Family & People (p.31-33)
// =====================================================================
vocabWord("母", "はは", "mother [own family, casual]", 31, ["noun"]);
vocabWord("父", "ちち", "father [own family, casual]", 31, ["noun"]);
vocabWord("姉", "あね", "older sister [own family, casual]", 31, ["noun"]);
vocabWord("兄", "あに", "older brother [own family, casual]", 31, ["noun"]);
vocabWord("弟", "おとうと", "younger brother [own family, casual]", 31, ["noun"]);
vocabWord("妹", "いもうと", "younger sister [own family, casual]", 31, ["noun"]);
vocabWord("お母さん", "おかあさん", "mother [polite / someone else's]", 32, ["noun"]);
vocabWord("お父さん", "おとうさん", "father [polite / someone else's]", 32, ["noun"]);
vocabWord("お姉さん", "おねえさん", "older sister [polite / someone else's]", 32, ["noun"]);
vocabWord("お兄さん", "おにいさん", "older brother [polite / someone else's]", 32, ["noun"]);
vocabWord("友だち", "ともだち", "friend", 33, ["noun"]);
vocabWord("学生", "がくせい", "student", 33, ["noun"]);
vocabWord("先生", "せんせい", "teacher", 33, ["noun"]);

// =====================================================================
// VOCABULARY: General Vocabulary (p.47)
// =====================================================================
vocabWord("家", "いえ・うち", "house, home", 47, ["noun"]);
vocabWord("学校", "がっこう", "school", 47, ["noun"]);
vocabWord("大学", "だいがく", "university", 47, ["noun"]);
vocabWord("本", "ほん", "book", 47, ["noun"]);
vocabWord("花", "はな", "flower", 47, ["noun"]);
vocabWord(undefined, "テーブル", "table", 47, ["noun"]);

// =====================================================================
// VOCABULARY: Animals (p.56)
// =====================================================================
vocabWord("犬", "いぬ", "dog", 56, ["noun"]);
vocabWord("猫", "ねこ", "cat", 56, ["noun"]);
vocabWord("馬", "うま", "horse", 56, ["noun"]);
vocabWord("牛", "うし", "cow", 56, ["noun"]);
vocabWord("魚", "さかな", "fish", 56, ["noun"]);

// =====================================================================
// VOCABULARY: Food & Drink (p.67-68)
// =====================================================================
vocabWord(undefined, "ピザ", "pizza", 67, ["noun"]);
vocabWord(undefined, "チョコレート", "chocolate", 67, ["noun"]);
vocabWord("寿司", "すし", "sushi", 67, ["noun"]);
vocabWord(undefined, "パン", "bread", 67, ["noun"]);
vocabWord(undefined, "チーズ", "cheese", 67, ["noun"]);
vocabWord(undefined, "コーヒー", "coffee", 68, ["noun"]);
vocabWord("水", "みず", "water", 68, ["noun"]);
vocabWord("お茶", "おちゃ", "tea", 68, ["noun"]);
vocabWord(undefined, "ジュース", "juice", 68, ["noun"]);

// =====================================================================
// GRAMMAR: Pronouns (p.75-89)
// =====================================================================
vocabWord("私", "わたし", "I / me [standard or feminine formal; +たち for plural]", 75, ["pronoun"]);
vocabWord("私", "あたし", "I / me [feminine; +たち for plural]", 75, ["pronoun"]);
vocabWord("私", "わたくし", "I / me [formal; +たち for plural]", 75, ["pronoun"]);
vocabWord("僕", "ぼく", "I / me [humble, masculine; +たち for plural]", 75, ["pronoun"]);
vocabWord("俺", "おれ", "I / me [virile, masculine; +たち for plural]", 75, ["pronoun"]);
vocabWord("自分", "じぶん", "I / myself [disciplined, modest, athletic, military]", 75, ["pronoun"]);
vocabWord(undefined, "あなた", "you [standard but too direct; +たち for plural]", 75, ["pronoun"]);
vocabWord("君", "きみ", "you [casual; +たち for plural]", 75, ["pronoun"]);
vocabWord("お前", "おまえ", "you [too direct, rude or provocative; +たち for plural]", 75, ["pronoun"]);
vocabWord("皆さん", "みなさん", "everyone / you all [very common]", 75, ["pronoun"]);
vocabWord("彼", "かれ", "he [+ら for plural]", 75, ["pronoun"]);
vocabWord("彼女", "かのじょ", "she [+たち for plural]", 75, ["pronoun"]);
vocabWord("あの人", "あのひと", "he or she [formal; +たち for plural]", 75, ["pronoun"]);

notes.push({
  id: nextNoteId(),
  kind: "teacher-note",
  text: [
    {
      en: "Third-person plural (common way): [name] + たち = \"they\". Honorific address suffixes for 2nd/3rd person: [name]+さん = standard; [name]+ちゃん = cute/feminine; [name]+くん = masculine; [name]+様(さま) = respectful/polite/formal; [name]+先生(せんせい) = teacher.",
    },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 75, note: "Honorific forms of address" }],
});

grammar.push({
  id: nextGrammarId(),
  pattern: "Pronouns",
  explanation: [
    {
      en: "Japanese has many pronouns for \"I\" and \"you\", chosen by formality/gender/register rather than being interchangeable. 1st person: 私(わたし, standard/feminine formal), 私(あたし, feminine), 私(わたくし, formal), 僕(ぼく, humble/masculine), 俺(おれ, virile/masculine), 自分(じぶん, disciplined/modest/athletic/military — \"myself\"). 2nd person: あなた (standard but too direct for common use), 君(きみ, casual), お前(おまえ, too direct/rude/provocative), 皆さん(みなさん, everyone/you all). 3rd person: 彼(かれ, he), 彼女(かのじょ, she), あの人(あのひと, formal he/she). Plurals mostly take +たち (彼+ら for 彼). Addressing someone by name uses an honorific suffix instead of a pronoun: -さん (standard), -ちゃん (cute/feminine), -くん (masculine), -様/さま (formal), -先生/せんせい (teacher).",
    },
  ],
  examples: [],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 75 }, { file: FILE, page: 89 }],
});

// =====================================================================
// GRAMMAR: Verb groups & the 5-stem (a-i-u-e-o) system (p.90-98)
// =====================================================================
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "dictionary",
  explanation: [
    {
      en: "All Japanese verbs end in an -u sound (historically + the copula う, as in である). There are two main verb groups: godan verbs (5 possible stem forms) and ichidan verbs (1 stem form). Godan verbs end in one of 9 sounds: う、つ、る、く、ぐ、ぬ、む、ぶ、す. To form each of the 5 stems, replace the final -u sound with the corresponding sound from the same consonant row, across the a/i/u/e/o vowels (e.g. む row: ま/み/む/め/も) — watch out: う becomes わ for the A-stem, not あ. Example (飲む \"to drink\"): A=飲ま, I=飲み, U=飲む, E=飲め, O=飲も. Example (話す \"to speak\"): A=話さ, I=話し, U=話す, E=話せ, O=話そ. These 5 stems are the basis for every other conjugated form (ない, ます, etc. attach to specific stems).",
    },
  ],
  examples: [
    { form: "dictionary", surface: "飲む", reading: "のむ" },
    { form: "dictionary", surface: "話す", reading: "はなす" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 90 }, { file: FILE, page: 91 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-ichidan",
  form: "dictionary",
  explanation: [
    {
      en: "Ichidan verbs end in -eru or -iru (with few exceptions). Their stem is formed simply by removing the final る — this same stem is used for the A/I/E/O forms (only the U-form, the dictionary/infinitive form, keeps る). Example (食べる \"to eat\"): A=食べ, I=食べ, U=食べる, E=食べ, O=食べ. Example (見る \"to see\"): A=見, I=見, U=見る, E=見, O=見.",
    },
  ],
  examples: [
    { form: "dictionary", surface: "食べる", reading: "たべる" },
    { form: "dictionary", surface: "見る", reading: "みる" },
  ],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 92 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-irregular",
  form: "dictionary",
  explanation: [
    {
      en: "Five verbs are irregular (though not in every tense): だ (to be, description), ある (to be located/to have/there is, for objects), 行く(いく, to go), 来る(くる, to come), する (to do — and any verb built as [noun]+する, e.g. 勉強する(べんきょうする) \"to study\"). Their 5-stem forms: だ → A:では(でわ)/じゃ, I:で, U:だ, E:であれ, O:だろ. ある → A:[empty], I:あり, U:ある, E:あれ, O:あろ. 行く → A:行か(いか), I:行き(いき), U:行く(いく), E:行け(いけ), O:行こ(いこ). 来る → A:来(こ), I:来(き), U:来る(くる), E:来(く), O:来(こ). する → A:し, I:し, U:する, E:すれ, O:しよう.",
    },
  ],
  examples: [
    { form: "dictionary", surface: "だ" },
    { form: "dictionary", surface: "ある" },
    { form: "dictionary", surface: "行く", reading: "いく" },
    { form: "dictionary", surface: "来る", reading: "くる" },
    { form: "dictionary", surface: "する" },
  ],
  exceptions: ["だ、ある、行く、来る、する are irregular and do not follow the regular godan/ichidan stem patterns"],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 98 }],
});
grammar.push({
  id: nextGrammarId(),
  pattern: "Verb groups (godan / ichidan / irregular)",
  explanation: [
    {
      en: "Verbs classify into godan (5 stem forms — replace the final -u sound with the a/i/u/e/o sound in the same consonant row), ichidan (1 stem form — drop the final る, used directly for most other conjugations), and 5 irregular verbs (だ, ある, 行く, 来る, する) whose stems don't follow either regular pattern. This 5-stem system (A/I/U/E/O) underlies every other conjugated form taught later (ない-form attaches to the A-stem, ます attaches to the I-stem, etc.).",
    },
  ],
  examples: [],
  relatedConjugationRuleIds: conjugation.slice(-3).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 90 }, { file: FILE, page: 98 }],
});

// =====================================================================
// GRAMMAR: Verbs of the Week (p.100-104)
// =====================================================================
vocabWord("行く", "いく", "to go [godan]", 100, ["verb-godan"]);
vocabWord("飲む", "のむ", "to drink [godan]", 100, ["verb-godan"]);
vocabWord("来る", "くる", "to come [irregular]", 100, ["verb-irregular"]);
vocabWord("話す", "はなす", "to speak [godan]", 100, ["verb-godan"]);
vocabWord(undefined, "する", "to do [irregular]", 100, ["verb-irregular"]);
vocabWord(undefined, "いる", "to be / to have / there is [living things, ichidan]", 101, ["verb-ichidan"]);
vocabWord("食べる", "たべる", "to eat [ichidan]", 101, ["verb-ichidan"]);
vocabWord("見る", "みる", "to see / look / watch [ichidan]", 101, ["verb-ichidan"]);
vocabWord(undefined, "だ", "to be [description, irregular]", 101, ["verb-irregular"]);
vocabWord(undefined, "ある", "to be / to have / there is [objects, irregular]", 101, ["verb-irregular"]);

// =====================================================================
// GRAMMAR: Essential Particles (p.106-122)
// =====================================================================
const waTopic = example("私は学生だ。", "I'm a student.", 122, "わたしわがくせいだ。");
const gaSubject = example("私が学生だ。", "I AM a student.", 122, "わたしががくせいだ。");
const woObject = example("私は水を飲む。", "I drink water.", 122, "わたしわみずおのむ。");
const niDestination = example("学校に行く。", "I go to school.", 122, "がっこうにいく。");
const toAnd = example("犬と猫は食べる。", "The dog and the cat eat.", 122, "いぬとねこわたべる。");
const moToo = example("君もパンを食べる。", "You also eat bread.", 122, "きみもすしをたべる。");
const karaFrom = example("日本から来た。", "I come from Japan.", 122, "にほんからきた。");
const kaQuestion = example("先生ですか。", "Are you a teacher?", 122, "せんせいですか。");
const yoExclaim = example("学生ですよ。", "I am a student!", 122, "がくせいですよ。");
const particleExamples = [waTopic, gaSubject, woObject, niDestination, toAnd, moToo, karaFrom, kaQuestion, yoExclaim];
examples.push(...particleExamples);

grammar.push({
  id: nextGrammarId(),
  pattern: "Essential particles (は, が, を, に, と, も, から, か, よ)",
  explanation: [
    {
      en: "Particles follow each sentence element and mark its grammatical role; the verb is (almost) always last. は(わ) = topic; が = subject (often more emphatic/specific than は); を(お) = direct object; に = destination; と = \"and\" (between nouns); も = \"too, as well\"; から = \"from\"; か = question marker; よ = exclamation/assertion.",
    },
  ],
  particles: [
    { particle: "は", meaning: [{ en: "topic" }], exampleSentenceId: waTopic.id },
    { particle: "が", meaning: [{ en: "subject" }], exampleSentenceId: gaSubject.id },
    { particle: "を", meaning: [{ en: "direct object" }], exampleSentenceId: woObject.id },
    { particle: "に", meaning: [{ en: "destination" }], exampleSentenceId: niDestination.id },
    { particle: "と", meaning: [{ en: "and" }], exampleSentenceId: toAnd.id },
    { particle: "も", meaning: [{ en: "too, as well" }], exampleSentenceId: moToo.id },
    { particle: "から", meaning: [{ en: "from" }], exampleSentenceId: karaFrom.id },
    { particle: "か", meaning: [{ en: "question" }], exampleSentenceId: kaQuestion.id },
    { particle: "よ", meaning: [{ en: "exclamation" }], exampleSentenceId: yoExclaim.id },
  ],
  examples: particleExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 106 }],
});

// =====================================================================
// GRAMMAR: Present Tense (p.123-130)
// =====================================================================
const presentAffExamples = [
  example("私は水を飲む。", "I drink water. [habit/near future]", 123),
  example("私はパンを食べる。", "I eat bread.", 123),
  example("私は学生だ。", "I am a student.", 123),
];
examples.push(...presentAffExamples);
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "dictionary",
  explanation: [
    { en: "Present affirmative is simply the dictionary (-u/infinitive) form; verbs don't change based on the pronoun. Used for habits or the near future. Pronouns are often dropped once context makes them clear." },
  ],
  examples: presentAffExamples.map((e) => ({ form: "dictionary" as const, surface: e.japanese })),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 123 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "nai",
  explanation: [
    {
      en: "Present negative: A-stem + ない. Godan: 飲む→飲ま→飲まない, 話す→話さ→話さない. Ichidan: 食べる→食べ→食べない, 見る→見→見ない, いる→い→いない. Four exceptions: だ→じゃ/では(でわ)→じゃない/ではない(でわない); ある→[empty]→ない; 来る→来(こ)→来ない(こない); する→し→しない.",
    },
  ],
  examples: [
    { form: "nai", surface: "飲まない", reading: "のまない" },
    { form: "nai", surface: "話さない", reading: "はなさない" },
    { form: "nai", surface: "食べない", reading: "たべない" },
    { form: "nai", surface: "見ない", reading: "みない" },
    { form: "nai", surface: "いない" },
    { form: "nai", surface: "じゃない" },
    { form: "nai", surface: "ない" },
    { form: "nai", surface: "来ない", reading: "こない" },
    { form: "nai", surface: "しない" },
  ],
  exceptions: ["だ→じゃない/ではない, ある→ない, 来る→来ない(こない), する→しない"],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 124 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "masu",
  explanation: [
    {
      en: "Polite present: I-stem + ます. Godan: 飲む→飲み→飲みます, 話す→話し→話します. Ichidan: 食べる→食べ→食べます, 見る→見→見ます, いる→い→います. Three exceptions: だ→です; 来る→来(き)→来ます(きます); する→し→します.",
    },
  ],
  examples: [
    { form: "masu", surface: "飲みます", reading: "のみます" },
    { form: "masu", surface: "話します", reading: "はなします" },
    { form: "masu", surface: "食べます", reading: "たべます" },
    { form: "masu", surface: "見ます", reading: "みます" },
    { form: "masu", surface: "います" },
    { form: "masu", surface: "です" },
    { form: "masu", surface: "来ます", reading: "きます" },
    { form: "masu", surface: "します" },
  ],
  exceptions: ["だ→です, 来る→来ます(きます), する→します"],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 128 }],
});
conjugation.push({
  id: nextConjugationId(),
  appliesTo: "verb-godan",
  form: "masu-negative",
  explanation: [
    {
      en: "Polite present negative: I-stem + ません. Godan: 飲む→飲み→飲みません, 話す→話し→話しません. Ichidan: 食べる→食べ→食べません, 見る→見→見ません, いる→い→いません. Three exceptions: だ→ではありません(でわありません); 来る→来(き)→来ません(きません); する→し→しません.",
    },
  ],
  examples: [
    { form: "masu-negative", surface: "飲みません", reading: "のみません" },
    { form: "masu-negative", surface: "食べません", reading: "たべません" },
    { form: "masu-negative", surface: "ではありません", reading: "でわありません" },
    { form: "masu-negative", surface: "来ません", reading: "きません" },
    { form: "masu-negative", surface: "しません" },
  ],
  exceptions: ["だ→ではありません, 来る→来ません(きません), する→しません"],
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 130 }],
});
grammar.push({
  id: nextGrammarId(),
  pattern: "Present tense (affirmative / negative / polite)",
  explanation: [
    {
      en: "Present affirmative = dictionary form (no change for pronoun). Present negative (casual) = A-stem + ない. Polite present = I-stem + ます. Polite present negative = I-stem + ません. だ/ある/来る/する are irregular in each of these forms (see the linked conjugation rules for the exact irregular forms).",
    },
  ],
  examples: presentAffExamples,
  relatedConjugationRuleIds: conjugation.slice(-4).map((c) => c.id),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 123 }, { file: FILE, page: 130 }],
});

// =====================================================================
// Numbers 0-10 (p.132)
// =====================================================================
const numberDefs: [string, string, string][] = [
  ["ゼロ", "ゼロ", "0"],
  ["一", "いち", "1"],
  ["二", "に", "2"],
  ["三", "さん", "3"],
  ["四", "よん", "4"],
  ["五", "ご", "5"],
  ["六", "ろく", "6"],
  ["七", "なな", "7"],
  ["八", "はち", "8"],
  ["九", "きゅう", "9"],
  ["十", "じゅう", "10"],
];
for (const [japanese, reading, valueStr] of numberDefs) {
  numbers.push({
    id: nextNumberId(),
    category: "cardinal",
    value: Number(valueStr),
    japanese,
    reading: japanese === reading ? undefined : reading,
    lessonIds: [LESSON_ID],
    origin: "course",
    source: [{ file: FILE, page: 132 }],
  });
}

writeDirtyExternalFiles(vocabIndex, dirtyVocabFiles);
saveOwnArray(vocabPath, vocab);
saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(conjugationPath, conjugation);
saveOwnArray(numbersPath, numbers);
saveOwnArray(notesPath, notes);

console.log(
  `${LESSON_ID}: ${vocab.length} vocab, ${examples.length} examples, ${grammar.length} grammar, ` +
    `${conjugation.length} conjugation, ${numbers.length} numbers, ${notes.length} notes.`,
);
