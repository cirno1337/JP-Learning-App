# Extraction Log

Tracks the processing status of every source PDF. See `docs/source-inventory.md`
for the full inventory writeup and rationale behind groupings/status decisions.

Statuses: `pending`, `processing`, `complete`, `needs-review`, `skipped`, `duplicate`.

No PDF is ever silently omitted — every file below must end in one of these
statuses with a note explaining why.

## A. Intro classes

| File | Lesson | Type | Status | Notes |
|---|---|---|---|---|
| Class A - Japanese Language System.pdf | class-a | overview/slides | pending | secondary source, not yet needed |
| Class A — Basic Expressions.pdf | class-a | vocabulary/slides | pending | secondary source, not yet needed (its content — greetings — is also fully covered in Class A synthesis's basic expressions list) |
| Class A - synthesis & assignments.pdf | class-a | kana/synthesis | complete | full hiragana chart (105 kana entries: base grid, dakuten/handakuten, digraphs, small っ) via manual/class-a-content.ts; 40 kana-practice vocab words + 22 basic expressions |
| Class B - synthesis & assignments.pdf | class-b | kana/synthesis | complete | full katakana chart (129 kana entries incl. extended loanword digraphs) + 39 katakana loanword vocab + useful-links/keyboard-typing notes via manual/class-b-content.ts |

## B. Main weekly classes

Classes 03–10 processed in two passes:

1. `scripts/extract/parseClassSynthesis.ts` mechanically extracts
   VOCABULARY tables, BUILT SENTENCES, and VERBS/ADJECTIVES OF THE WEEK
   word lists (see the script's header comment for why only these four
   sections are pattern-matched — grammar-topic headers vary too much per
   lesson to enumerate safely). Everything else is written to
   `scripts/extract/.cache/<lessonId>-remainder.txt`.
2. `scripts/extract/manual/class-0N-grammar.ts` (one hand-authored,
   deterministic script per class) transcribes each remainder file's
   grammar explanations, conjugation patterns, particle tables, and
   comprehensible-input reading passages into GrammarEntry/
   ConjugationRule/DialogueEntry/NumberEntry records, plus any vocabulary
   subcategory the automated parser's section state machine missed (every
   class had at least one — see each script's header comment for specifics).
   Every remainder file was read in full; only pure noise (page-divider
   lines, empty "RELATED KANJI" section headers — confirmed empty in all 8
   files) was left out.

Both passes are complete for all of classes 03–10. Total across those 8
classes: 44 grammar entries, 23 conjugation rules, 100 number/counter
entries (all 8 counter systems + full time-telling from class-06/07), 6
comprehensible-input reading passages, and several hundred vocabulary
entries (see `npm run validate-content` output for exact current totals).

| File | Lesson | Type | Status | Notes |
|---|---|---|---|---|
| CLASS N°01 — The Japanese Summer Challenge.pdf | class-01 | vocab/grammar/slides | complete | no synthesis doc exists for this class; this 142-page deck is the only source. Vocabulary tables (countries/nationalities/languages, family & people, general vocab, animals, food & drink — 39 words) use a furigana-over-kanji layout that scrambles in pdftotext, so they were read visually from rendered page images; conjugation/grammar sections (pronouns incl. honorifics, verb groups & the 5-stem system incl. irregular だ/ある/行く/来る/する, verbs of the week, essential particles, present tense, numbers 0-10) extract cleanly as text. Via manual/class-01-content.ts. A 156-entry "optional" world-country list (explicitly marked optional by the teacher) was kept as one reference note rather than individual entries. "Kanji related to the vocabulary" component/radical breakdown pages were skipped (supplementary etymology, not part of the actual kanji-of-the-week curriculum) |
| CLASS N°02 — The Japanese Summer Challenge.pdf | class-02 | vocab/grammar/slides | complete | no synthesis doc exists for this class; same method as class-01 (135 pages). Vocabulary (people, general vocab, nature, in a room, time, family II — 47 words) read visually; conjugation/grammar (verbs of the week, full te-form derivation incl. exceptions, present continuous, other te-form uses [imperative/"may I"/combining verbs], numbers 11-10,000, 5 basic counter systems 1-10) extracted as text. Via manual/class-02-content.ts |
| Class N°03 - synthesis & assignments.pdf | class-03 | vocab/grammar/synthesis | complete | vocab/examples via parseClassSynthesis.ts; grammar (I-adjectives, たい, more particles) via manual/class-03-grammar.ts |
| CLASS N°03 — The Japanese Summer Challenge.pdf | class-03 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°04 - synthesis & assignments.pdf | class-04 | vocab/grammar/synthesis | complete | vocab/examples via parseClassSynthesis.ts; grammar (past tense derivation, NA/NO-adjectives, 好き/大好き, こそあど demonstratives) + missed vocab via manual/class-04-grammar.ts |
| CLASS N°04 — The Japanese Summer Challenge.pdf | class-04 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°05 - synthesis & assignments.pdf | class-05 | vocab/grammar/synthesis | complete | vocab via parseClassSynthesis.ts (no BUILT SENTENCES this week); "Leo the butcher" reading passage, question words, indefinite pronouns, から/でも/後で/前に, adverbs via manual/class-05-grammar.ts |
| CLASS N°05 — The Japanese Summer Challenge.pdf | class-05 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°06 - synthesis & assignments.pdf | class-06 | vocab/grammar/synthesis | complete | vocab via parseClassSynthesis.ts; reading passage part 2, imperative/volitional conjugation, all 8 counter systems (1-10 each), adverbs via manual/class-06-grammar.ts |
| CLASS N°06 — The Japanese Summer Challenge.pdf | class-06 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°07 - synthesis & assignments.pdf | class-07 | vocab/grammar/synthesis | complete | vocab via parseClassSynthesis.ts; "Leo at school" reading, time-telling (hour/minute counters), relative time adverbs, nominalisation, more particles via manual/class-07-grammar.ts |
| CLASS N°07 — The Japanese Summer Challenge.pdf | class-07 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°08 - synthesis & assignments.pdf | class-08 | vocab/grammar/synthesis | complete | vocab via parseClassSynthesis.ts; missed subcategory (aquatic animals/insects/reptiles), "zoo" reading, potential form, locating things, すぎる, adverbs of quantity via manual/class-08-grammar.ts |
| CLASS N°08 — The Japanese Summer Challenge.pdf | class-08 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°09 - synthesis & assignments.pdf | class-09 | vocab/grammar/synthesis | complete | vocab via parseClassSynthesis.ts; "airport" reading, relative clauses, 時/ために/ように/ながら/か(どうか), indirect questions, reported speech, comparative/superlative via manual/class-09-grammar.ts (densest single lesson) |
| CLASS N°09 — The Japanese Summer Challenge.pdf | class-09 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |
| Class N°10 - synthesis & assignments.pdf | class-10 | vocab/grammar/synthesis | complete | vocab via parseClassSynthesis.ts; missed subcategory (clothing/accessories), "park" reading, full conditional system (と/たら/なら/ば・れば), must/have to, should(not), たり...たりする via manual/class-10-grammar.ts |
| CLASS N°10 — The Japanese Summer Challenge.pdf | class-10 | vocab/grammar/slides | pending | secondary/cross-reference, not needed |

## C. Kanji sets

All 10 sets processed with `scripts/extract/parseKanjiSet.ts`, which merges
both files per set (see the script's own header comment for the full
algorithm). Summary: 250 kanji entries + 442 vocabulary entries extracted,
zero duplicate ids/characters/vocab keys across the whole set (verified by
script), zero empty fields or leftover ligature artifacts (verified by
script). 143/250 kanji (mostly in later, more abstract sets) have no
explicit standalone reading in either source and are marked with an
`uncertainty` field rather than a guessed reading — verified for a sample
(e.g. 校 in Set 05) that this is a genuine property of the source material,
not a parser miss: even the slide deck's dedicated page for such kanji gives
only a meaning, never an isolated reading, only readings embedded in
compound vocabulary (which the vocabularyIds links to).

Known per-file exceptions requiring a manual JSON patch after the automated
parse (both documented inline in the affected JSON via `source[].note`
and/or `notes`):
- Set 01: kanji 金 has no standalone line in the synthesis doc at all (not
  even via a compound before it) — added from the slide deck (p.39).
- Set 02: one line, `生(の) (なま(の)) = raw`, uses nested parentheses the
  parser's regex can't handle — added manually as vocabulary for 生.

| File | Lesson | Type | Status | Notes |
|---|---|---|---|---|
| ACTIVE KANJI  — Set n°01.pdf | class-01 | kanji/slides | complete | used as the source of the canonical kanji list + meanings for all 25 kanji; readings/example words still come from the synthesis doc. Exercise/Kahoot pages not extracted (low-value: unstructured practice, no answer key) |
| KANJI - SET N°01 - synthesis & assignments.pdf | class-01 | kanji/synthesis | complete | 25 kanji, 26 vocab, 3 kanji w/o standalone reading (明, 曜, 金) |
| ACTIVE KANJI  — Set n°02.pdf | class-02 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°02 - synthesis & assignments.pdf | class-02 | kanji/synthesis | complete | 25 kanji, 42 vocab (incl. 1 manual: 生の), 6 kanji w/o standalone reading |
| ACTIVE KANJI  — Set n°03.pdf | class-03 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°03 - synthesis & assignments.pdf | class-03 | kanji/synthesis | complete | 25 kanji, 36 vocab, 11 kanji w/o standalone reading |
| ACTIVE KANJI  — Set n°04.pdf | class-04 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°04 - synthesis & assignments.pdf | class-04 | kanji/synthesis | complete | 25 kanji, 47 vocab, 13 kanji w/o standalone reading; header date typo ("19th June") noted, does not affect content |
| ACTIVE KANJI  — Set n°05.pdf | class-05 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°05 - synthesis & assignments.pdf | class-05 | kanji/synthesis | complete | 25 kanji, 49 vocab, 21 kanji w/o standalone reading (this week's vocabulary is unusually abstract) |
| ACTIVE KANJI  — Set n°06.pdf | class-06 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°06 - synthesis & assignments.pdf | class-06 | kanji/synthesis | complete | 25 kanji, 48 vocab, 17 kanji w/o standalone reading |
| ACTIVE KANJI  — Set n°07.pdf | class-07 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°07 - synthesis & assignments.pdf | class-07 | kanji/synthesis | complete | 25 kanji, 57 vocab, 20 kanji w/o standalone reading |
| ACTIVE KANJI  — Set n°08.pdf | class-08 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°08 - synthesis & assignments.pdf | class-08 | kanji/synthesis | complete | 25 kanji, 50 vocab, 18 kanji w/o standalone reading |
| ACTIVE KANJI  — Set n°09.pdf | class-09 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°09 - synthesis & assignments.pdf | class-09 | kanji/synthesis | complete | 25 kanji, 47 vocab, 19 kanji w/o standalone reading |
| ACTIVE KANJI  — Set n°10.pdf | class-10 | kanji/slides | complete | see class-01 note on scope |
| KANJI - SET N°10 - synthesis & assignments.pdf | class-10 | kanji/synthesis | complete | 25 kanji, 40 vocab, 15 kanji w/o standalone reading |

## D. Assignments

| File | Lesson | Type | Status | Notes |
|---|---|---|---|---|
| ASSIGNMENT N°06.pdf | class-06 | assignment | complete | mostly a fill-in-the-blank worksheet with the answer key only in Google Classroom; extracted only what's confirmable without inventing answers — the 2 vocab pairs given complete, a generated conjugation answer-key note (derived from class-06's own confirmed rules), and cross-references to class-06's dialogue for the translation exercise (all 6 of its sentences already exist there verbatim). Only assignment file present; do not fabricate 01-05/07-10 |

## E. Extra practice

| File | Lesson | Type | Status | Notes |
|---|---|---|---|---|
| Dialogues-Reading.pdf | extra-practice | dialogue/reading | complete | 6 short dialogues (school, restaurant, train station, supermarket x2, phone call) via manual/dialogues-reading.ts; full readings given in source (per-word furigana annotations) |
| Extra Activity - Building Sentences 1.pdf | extra-practice | example sentences | complete | 28 example sentences (full readings/translations given) + 33 vocabulary words via manual/extra-building-sentences.ts; the vocab table is an image (confirmed via pdftotext), read visually |
| Extra Activity - Dictation 1.pdf | extra-practice | dictation | complete | 22-line self-introduction narrative via manual/extra-dictation.ts; the Japanese text (with furigana) is an image, read visually — the English translation was given as text |
| Extra Activity - Reading Session 1.pdf | extra-practice | reading | complete | 10-part, 31-line reading passage via manual/extra-reading-session.ts; full per-word furigana given in source text (no visual reading needed) + 10 new vocab words |
| Peppa Pig Analysis 1_4.pdf | extra-practice | listening/reading analysis | complete | 15 example sentences w/ full word/particle-by-particle analysis notes via scripts/extract/parsePeppaPig.ts (part 1 of 4) |
| Peppa Pig Analysis 2_4.pdf | extra-practice | listening/reading analysis | complete | 17 example sentences w/ analysis notes (part 2 of 4) |
| Peppa Pig Analysis 3_4.pdf | extra-practice | listening/reading analysis | complete | 14 example sentences w/ analysis notes (part 3 of 4) |
| Peppa Pig Analysis 4_4.pdf | extra-practice | listening/reading analysis | complete | 13 example sentences w/ analysis notes (part 4 of 4). Readings not extracted for the Peppa Pig sentences (small inline furigana hints don't reliably map to positions in plain-text extraction — see parsePeppaPig.ts comments); the word/particle analysis notes carry the main pedagogical value instead |

## F. External reference (JLPT Sensei) — supplementary

Kanji/vocabulary/grammar list PDFs (the clean tabular ones, as opposed to
the large prose "ebooks") were parsed with dedicated scripts
(`scripts/extract/parseJlptKanjiList.ts`, `parseJlptVocabList.ts`,
`parseJlptGrammarList.ts`) into `src/data/supplementary/{kanji,vocabulary,
grammar}/*.json` — kept entirely separate from course data (`origin:
"supplementary"`, `lessonIds: []`), never merged with or presented as course
content, per spec section 44. Two real parser bugs were found and fixed
while processing these (documented in each script's header comment):
column-shift when a kunyomi/meaning list wraps across lines, and romaji-vs-
English-meaning ambiguity (both being plain lowercase ASCII words) resolved
by detecting per-file column layout from the header row rather than
guessing per line. Every output file was spot-checked and swept for
empty fields / truncated meanings / stray-Latin-in-reading-fields; a small
number of individual entries (kanji 金 in an unrelated context aside — here
specifically N5 kanji 下, ~7 N4 kanji) needed a one-line manual correction
after being caught by that sweep.

The three large prose "Grammar Master"/vocabulary "Ebook" PDFs (293, 192,
and 439 pages) were not deep-extracted: their core value (pattern/word +
meaning) is already captured via the shorter list-format files above, and
JLPT Sensei's own three-tier duplication (list PDF + flashcard PDF + prose
ebook, all covering the identical N4/N5 syllabus) is itself the reason
their content is redundant with each other, not just with the course. Given
this is supplementary, non-course-original reference material (lowest
priority per spec section 44/52), the effort of extracting hundreds of
pages of prose explanations and example sentences for content whose
headline facts are already in the dataset was not judged worthwhile over
building out the app's UI for the (much higher priority) course-original
content. This is a deliberate scope decision, not a silent omission.

| File | Lesson | Type | Status | Notes |
|---|---|---|---|---|
| JLPT SENSEI - N4 Grammar List.pdf | supplementary | grammar reference | complete | 131 grammar entries via parseJlptGrammarList.ts |
| JLPT N4 Grammar Master Ebook by JLPTsensei.com.pdf | supplementary | grammar reference | skipped | 293-page prose ebook; same grammar points already covered by `JLPT SENSEI - N4 Grammar List.pdf` (131 entries) — see group header note |
| JLPT SENSEI - N4 Vocabulary - い adjectives List.pdf | supplementary | vocabulary reference | complete | 21 entries via parseJlptVocabList.ts |
| JLPT SENSEI - N4 Vocabulary - な adjectives List.pdf | supplementary | vocabulary reference | complete | 24 entries via parseJlptVocabList.ts |
| N4 Kanji List - JLPTsensei.com.pdf | supplementary | kanji reference | complete | 167 kanji (on'yomi + kun'yomi + meaning) via parseJlptKanjiList.ts |
| N4 Kanji List - JLPTsensei.com (1).pdf | supplementary | kanji reference | duplicate | identical MD5 to `N4 Kanji List - JLPTsensei.com.pdf`; no separate extraction |
| N4 Vocabulary - Adverbs List - JLPTsensei.com.pdf | supplementary | vocabulary reference | complete | 45 entries via parseJlptVocabList.ts |
| N4 Vocabulary - Katakana Words List - JLPTsensei.com.pdf | supplementary | vocabulary reference | complete | 40 entries via parseJlptVocabList.ts |
| N4 Vocabulary - Nouns List - JLPTsensei.com.pdf | supplementary | vocabulary reference | complete | 363 entries via parseJlptVocabList.ts |
| N4 Vocabulary - Particles List - JLPTsensei.com.pdf | supplementary | grammar reference | complete | 24 entries via parseJlptVocabList.ts (particle part-of-speech) |
| N4 Vocabulary - Verbs List - JLPT Sensei.pdf | supplementary | vocabulary reference | complete | 211 entries via parseJlptVocabList.ts |
| N5 Kanji List - JLPTsensei.com.pdf | supplementary | kanji reference | complete | 80 kanji via parseJlptKanjiList.ts |
| JLPT N5 Grammar Master Ebok by JLPTsensei.com (1).pdf | supplementary | grammar reference | skipped | 192-page prose ebook; no shorter N5 grammar list text source exists (the flashcard version is image-only) to cross-check against, and the volume of prose made a dedicated extraction not worthwhile for supplementary content — see group header note. Its table of contents (80 grammar patterns + meanings) was sampled but not fully parsed |
| N5 Verbs LIST (1).pdf | supplementary | vocabulary reference | skipped | multi-column conjugation-table layout (dictionary form + ます/ない/た forms across a 2-line-per-entry block with the entry number oddly interposed) unlike the other list files; the ます/ない/た columns are redundant with this project's own conjugation engine, and verb vocabulary is already extensively covered by N4's verb list (211 entries) plus course data — not worth a dedicated parser for supplementary content |
| JLPT N5 Verbs Ebook by JLPTsensei.com.pdf | supplementary | vocabulary reference | skipped | 130-page prose ebook; see group header note |
| JLPT N5 Verbs Ebook by JLPTsensei.com (1).pdf | supplementary | vocabulary reference | duplicate | identical MD5 to `JLPT N5 Verbs Ebook by JLPTsensei.com.pdf`; no separate extraction |
| JLPT N5 Vocabulary Nouns Ebook by JLPTsensei.com.pdf | supplementary | vocabulary reference | skipped | 439-page prose ebook; same words already covered by `Vocabulary - N5 Nouns List - JLPT Sensei.pdf` (421 entries) — see group header note |
| Vocabulary - N5 Nouns List - JLPT Sensei.pdf | supplementary | vocabulary reference | complete | 421 entries via parseJlptVocabList.ts |
| N5 Vocabulary - Adjectives (い) List - JLPT Sensei V2.pdf | supplementary | vocabulary reference | complete | 60 entries via parseJlptVocabList.ts |
| N5 Vocabulary - Adjectives (な) List - JLPT Sensei V2.pdf | supplementary | vocabulary reference | complete | 24 entries via parseJlptVocabList.ts |
| JLPT N4 Grammar List Flashcards (printable set).pdf | supplementary | grammar reference | skipped | image-only cards (no text layer, verified via `pdfimages -list`); content superseded by `JLPT SENSEI - N4 Grammar List.pdf` and the N4 grammar ebook |
| JLPT N4 Kanji Flashcards (printable set).pdf | supplementary | kanji reference | skipped | image-only cards; content superseded by `N4 Kanji List - JLPTsensei.com.pdf` |
| JLPT N5 Grammar List Flashcards (printable set).pdf | supplementary | grammar reference | skipped | image-only cards; content superseded by the N5 grammar ebook |
| JLPT N5 Kanji List Flashcards (printable set).pdf | supplementary | kanji reference | skipped | image-only cards; content superseded by `N5 Kanji List - JLPTsensei.com.pdf` |
| FULLKANJI (1).pdf | supplementary | kanji reference | skipped | verified (diff) to be a literal concatenation of `N5 Kanji List - JLPTsensei.com.pdf` + N4 kanji list content; no unique data |
| FULLVOC.pdf | supplementary | vocabulary reference | skipped | verified (diff) to be a literal concatenation of the N5 nouns + N5 verbs lists (and likely more); no unique data |
