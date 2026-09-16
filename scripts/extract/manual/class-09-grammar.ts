import { loadOwnArray, saveOwnArray, makeIdSequencer } from "../lib/lessonFile";
import type { DialogueEntry, ExampleSentence, GrammarEntry } from "../../../src/data/types";

/**
 * Hand-authored grammar/reading content for class-09, transcribed from
 * "Class N°09 - synthesis & assignments.pdf" pages 4-13 (see
 * scripts/extract/.cache/class-09-remainder.txt): the "airport" reading,
 * relative clauses, 時/ために/ように/ながら/か(どうか), indirect questions,
 * reported speech, and comparative/superlative. This is the densest single
 * grammar lesson in the course.
 *
 * Usage: tsx scripts/extract/manual/class-09-grammar.ts
 */

const FILE = "Class N°09 - synthesis & assignments.pdf";
const LESSON_ID = "class-09";

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

// --- "Airport" comprehensible-input reading (p.4-5) ---
const airportLines: [string, string, string][] = [
  ["今日はレオさんの誕生日です。", "きょうはレオさんのたんじょうびです。", "Today is Leo's birthday."],
  ["レオさんと友だちは町でタクシーに乗っています。", "レオさんとともだちはまちでタクシーにのっています。", "Leo and his friends are getting into a taxi in the city."],
  ["スーツケースがたくさんある。", "スーツケースがたくさんある", "They have a lot of suitcases."],
  ["タクシーで空港へ行きます。", "タクシーでくうこうへいきます。", "They are going to the airport by taxi."],
  ["タクシーの運転手は「どこへ旅行したいですか」と聞きます。", "タクシーのうんてんしゅは「どこへりょこうしたいですか」とききます。", 'The taxi driver asks, "Where do you want to travel?"'],
  ["レオさんは「韓国へ行きます」と答えます。", "レオさんは「かんこくへいきます」とこたえます。", 'Leo answers, "We are going to Korea."'],
  ["レオさんと友だちは旅行するのが大好きです。", "レオさんとともだちはりょこうするのがだいすきです。", "Leo and his friends love traveling."],
  ["羽田空港は近くないです。ちょっと遠いです。", "はねだくうこうはちかくないです。ちょっととおいです。", "Haneda Airport is not nearby. It is a little far away."],
  ["その後で、銀行の前で男の人が電話を盗むのを見ます。", "そのあとで、ぎんこうのまえでおとこのひとがでんわをぬすむのをみます。", "On the way, they see a man stealing a mobile phone in front of a bank."],
  ["タクシーが止まります。", "タクシーがとまります。", "The taxi stops."],
  [
    "レオさんたちは警察官を見て、「だれかが銀行の前で電話を盗みました」と言います。",
    "レオさんたちはけいさつかんをみて、「だれかがぎんこうのまえででんわをぬすみました」といいます。",
    'Leo and his friends see a police officer and say, "Someone stole a mobile phone in front of a bank."',
  ],
  ["警察官はバイクに乗って、銀行へ行きます。", "けいさつかんはバイクにのって、ぎんこうへいきます。", "The police officer gets on a motorcycle and goes to the bank."],
  ["そして、男の人を止めます。", "そして、おとこのひとをとめます。", "Then, the police officer stops the man."],
  ["タクシーは空港に着きました。", "タクシーはくうこうにつきました。", "The taxi arrives at the airport."],
  ["レオさんたちは韓国へ旅行します。", "レオさんたちはかんこくへりょこうします。", "Leo and his friends travel to Korea."],
];
dialogues.push({
  id: `${LESSON_ID}-dialogue-001`,
  title: "空港へ (To the airport) — comprehensible input reading passage",
  lines: airportLines.map(([jp, reading, en]) => ({ japanese: jp, reading, meanings: [{ en }] })),
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 4, note: "Reading passage spans pages 4-5" }],
});

// --- Relative clauses ("that...") (p.8) ---
const relativeExamples = [
  example("読む本", "the book that I read", 8),
  example("食べる寿司", "the sushi that I eat", 8),
  example("読んでいる本", "the book that I am reading", 8),
  example("食べた寿司", "the sushi that I ate", 8),
  example("月曜日に読んだ本", "the book that I read on Monday", 8),
  example("君と食べた寿司", "the sushi that I ate with you", 8),
  example("君が月曜日に家で弟と食べた寿司", "the sushi that you ate with my brother on Monday at home", 8),
  example("月曜日に読んだ本は青い。", "The book that I read on Monday is blue.", 8),
  example("君と食べた寿司を買っている。", "I am buying the sushi that I ate with you.", 8),
  example("月曜日に読んだ本が好き。", "I like the book that I read on Monday.", 8),
  example("君が日本で見た学校へ行く。", "I go to the school that you saw in Japan.", 8),
];
examples.push(...relativeExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Relative clauses (\"that/which...\")",
  explanation: [
    {
      en: "A relative clause is simply a verb placed directly before the noun it modifies — no separate relative pronoun like English \"that\": 読む本 (the book that I read), from 本を読む. The verb can be any tense/form: 読んでいる本 (the book I'm reading), 食べた寿司 (the sushi I ate). Details (time, companions, etc.) can be added before the verb: 月曜日に読んだ本 (the book I read on Monday), 君と食べた寿司 (the sushi I ate with you) — these can stack: 君が月曜日に家で弟と食べた寿司 (the sushi you ate with my brother on Monday at home). The whole relative-clause+noun phrase then works as the subject/object/etc. of a main sentence like any noun phrase.",
    },
  ],
  examples: relativeExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 8 }],
});

// --- 時 (when) (p.9) ---
const tokiExamples = [
  example("自分のパンケーキを焼く時にやって見せてください。", "Show us, when you'll cook your own pancake.", 9),
  example("食べる時、話さないでください。", "Don't talk, when you eat.", 9),
  example("日本へ行く時に寿司を食べた。", "I ate sushi when I was going to Japan.", 9),
  example("日本へ行った時に寿司を食べた。", "I ate sushi when I went to Japan.", 9),
];
examples.push(...tokiExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "時に (when...)",
  explanation: [
    {
      en: "\"When [verb]\" = verb + 時(に). The tense of the verb before 時 matters: dictionary form means the main action happens before/during that event (日本へ行く時に寿司を食べた = I ate sushi when [in the process of] going to Japan), while past (ta-form) means it had already happened (日本へ行った時に寿司を食べた = I ate sushi when I [had already] gone to Japan / after arriving).",
    },
  ],
  examples: tokiExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 9 }],
});

// --- ために (for / so that) (p.9-10) ---
const tameniExamples = [
  example("家族のために", "for my family", 9),
  example("学校のために", "for school", 9),
  example("君のために", "for you", 9),
  example("家族のために働く。", "I work for my family.", 9),
  example("学校のためにパンケーキを作っている。", "I am making pancakes for school.", 9),
  example("君のために本を買った。", "I bought a book for you.", 9),
];
examples.push(...tameniExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "ために (for)",
  explanation: [{ en: "\"For [noun]\" = noun + の + ために: 家族のために (for my family), 学校のために (for school). Combines with a main sentence: 家族のために働く (I work for my family)." }],
  examples: tameniExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 9 }],
});

// --- ために vs ように (so that) (p.10) ---
const soThatExamples = [
  example("食べるために", "so I eat / so that I eat", 10),
  example("話すために", "so I speak / so that I speak", 10),
  example("分かるように", "so I understand / so that I understand", 10),
  example("私は君が食べるように", "I ... so that you eat", 10),
  example("食べないように", "so I don't eat", 10),
  example("食べられるように", "so I can eat / so that I can eat", 10),
  example("食べるためにピザを買った。", "I bought a pizza, so that I eat.", 10),
  example("私は君が食べるようにピザを買った。", "I bought a pizza, so that you eat.", 10),
  example("食べられるようにピザを買った。", "I bought a pizza, so that I can eat.", 10),
];
examples.push(...soThatExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "ために vs ように (so that)",
  explanation: [
    {
      en: "Both verb+ために and verb+ように mean \"so that\", but ために requires the subject to have full control over the action (volitional verbs; the subject of the purpose clause can differ from the main clause's), while ように is used when there's no full control over the action — with negative forms (食べないように), potential forms (食べられるように), or inherently non-volitional verbs (to understand, to be sunny, etc.), and typically shares its subject with the main clause (私は君が食べるように = lit. \"I, so that you eat\"). Example: 食べるためにピザを買った (I bought a pizza so that I [would] eat [it]) vs 食べられるようにピザを買った (I bought a pizza so that I could eat, i.e. so it would be possible).",
    },
  ],
  examples: soThatExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 10 }],
});

// --- ながら (while) (p.11) ---
const nagaraExamples = [
  example("飲みながら", "while drinking", 11),
  example("食べながら", "while eating", 11),
  example("お茶を飲みながら", "while drinking tea", 11),
  example("ピザを食べながら", "while eating pizza", 11),
  example("お茶を飲みながらテレビを見る。", "I watch television while drinking tea.", 11),
  example("ピザを食べながら本を読む。", "I read a book while eating pizza.", 11),
];
examples.push(...nagaraExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "ながら (while)",
  explanation: [{ en: "\"While [verb]-ing\" = -i (masu) stem + ながら: 飲みながら (while drinking), 食べながら (while eating). Both actions are done by the same subject at the same time: お茶を飲みながらテレビを見る (I watch TV while drinking tea)." }],
  examples: nagaraExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 11 }],
});

// --- か(どうか) (if/whether) ---
const kaDoukaExamples = [
  example("飲むか", "if I will drink?", 11),
  example("飲んだかどうか", "if I drank, or not", 11),
  example("彼がお茶を飲んだか知りません。", "I don't know if he drank tea.", 11),
  example("来るかどうか言って。", "Tell me if you'll come or not.", 11),
];
examples.push(...kaDoukaExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "か(どうか) (if / whether)",
  explanation: [
    { en: "\"If/whether [verb]\" = plain-form verb + か (or +かどうか to emphasize \"or not\"). Useful with verbs like 知る (to know) and 言う (to say): 彼がお茶を飲んだか知りません (I don't know if he drank tea), 来るかどうか言って (tell me if you'll come or not)." },
  ],
  examples: kaDoukaExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 11 }],
});

// --- Indirect questions (p.12) ---
const indirectQExamples = [
  example("いつ飲むか", "when you drink", 12),
  example("いつ飲んだか", "when you drank", 12),
  example("いつ彼がお茶を飲んだか知りません。", "I don't know when he drank tea.", 12),
  example("どこで食べたいか言って。", "Tell me where you want to eat.", 12),
];
examples.push(...indirectQExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Indirect questions",
  explanation: [
    { en: "An indirect question embeds a question inside a larger sentence: question-word + ... + plain-form verb + か. Useful with 知る/言う/聞く etc.: いつ彼がお茶を飲んだか知りません (I don't know when he drank tea), どこで食べたいか言って (tell me where you want to eat)." },
  ],
  examples: indirectQExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 12 }],
});

// --- Reported speech (p.12) ---
const reportedExamples = [
  example("彼が飲むと", "that he drinks", 12),
  example("彼が飲んだと", "that he drank", 12),
  example("彼は私の友達がお茶を飲みたいと言った。", "He said that my friend wants to drink tea.", 12),
  example("彼は私たちがお茶を飲むのが好きと思った。", "He thought that we like to drink tea.", 12),
];
examples.push(...reportedExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Reported speech (と言う / と思う)",
  explanation: [
    { en: "Reported speech = reported sentence (plain form) + と + a verb like 言う (to say) or 思う (to think): 彼が飲むと言った = he said that he drinks; 彼は私たちがお茶を飲むのが好きと思った = he thought that we like to drink tea." },
  ],
  examples: reportedExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 12 }],
});

// --- Comparative & superlative (p.13) ---
const comparativeExamples = [
  example("ピザはパスタより美味しい。", "Pizza is more delicious than pasta.", 13),
  example("猫はクモよりかわいい。", "Cats are cuter than spiders.", 13),
  example("私は君よりたくさん働く。", "I work more than you.", 13),
  example("猫はクモよりたくさん寝る。", "Cats sleep more than spiders.", 13),
];
const superlativeExamples = [
  example("ピザが一番美味しい。", "Pizza is the most delicious.", 13),
  example("猫が一番かわいい。", "Cats are the cutest.", 13),
  example("私が一番よく働く。", "I work the most.", 13),
  example("猫が一番よく寝る。", "Cats sleep the most.", 13),
];
examples.push(...comparativeExamples, ...superlativeExamples);
grammar.push({
  id: nextGrammarId(),
  pattern: "Comparative (より)",
  explanation: [
    {
      en: "\"A is more [adjective] than B\" = A + は + B + より + adjective: ピザはパスタより美味しい (pizza is more delicious than pasta). \"A [verb]s more than B\" = A + は + B + より + たくさん + verb: 私は君よりたくさん働く (I work more than you).",
    },
  ],
  examples: comparativeExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 13 }],
});
grammar.push({
  id: nextGrammarId(),
  pattern: "Superlative (一番)",
  explanation: [
    {
      en: "\"A is the most [adjective]\" = A + が + 一番(いちばん) + adjective: ピザが一番美味しい (pizza is the most delicious). \"A [verb]s the most\" = A + が + 一番 + よく + verb: 私が一番よく働く (I work the most).",
    },
  ],
  examples: superlativeExamples,
  lessonIds: [LESSON_ID],
  origin: "course",
  source: [{ file: FILE, page: 13 }],
});

saveOwnArray(examplesPath, examples);
saveOwnArray(grammarPath, grammar);
saveOwnArray(dialoguesPath, dialogues);

console.log(`${LESSON_ID}: ${examples.length} examples total, ${grammar.length} grammar entries total, ${dialogues.length} dialogues total.`);
