# Japanese A2 Maintenance App — Instructions for Claude Code

## 0. Goal

Build a self-study Japanese revision application from the approximately 80 PDF files in this project folder.

The PDFs are the **source of truth**. They contain material from approximately 20 Japanese lessons, including kanji, vocabulary, grammar, numbers, examples, exercises, and other lesson material.

The application is intended for me and my classmates/friends to maintain the approximately **A2 level of Japanese** reached after these lessons.

The app should be practical for repeated use rather than being a passive PDF viewer.

### Core requirements

- Default UI language: **English**
- Optional UI language: **Polish**
- Japanese content remains Japanese.
- Do **not** translate Japanese learning content blindly. Preserve Japanese text exactly where possible and provide English/Polish meanings separately.
- The application must work offline after installation/build where reasonably possible.
- No backend or external API should be required for the core learning experience.
- Do not require an LLM at runtime.
- The content pipeline must be deterministic and editable.
- The application must eventually contain the useful material from **all relevant PDFs**, not merely a sample.

---

# 1. Very important: work incrementally

There are ~80 PDFs.

**Do NOT attempt to read all PDFs into one giant context and generate the entire final database in one pass.**

Instead, use a staged pipeline:

1. Inspect the project and PDFs.
2. Design the application architecture and data schema.
3. Build the application shell/skeleton.
4. Identify and group the PDFs by lesson/topic/type.
5. Process PDFs **one by one** (or in very small batches when clearly safe).
6. Extract structured learning data from each PDF.
7. Validate the extracted data.
8. Add it to the application's content dataset.
9. Continue until every relevant PDF has been processed.
10. Run consistency checks.
11. Build/test the complete application.
12. Only then polish UX and add secondary features.

The important principle is:

> **The application code should not depend on keeping all PDF contents in Claude's context. The PDFs should be converted into a structured local knowledge base incrementally.**

---

# 2. First task: inspect before coding

Before making major implementation decisions:

- List all files in the project.
- Identify all PDFs.
- Determine their filenames, sizes and page counts where practical.
- Inspect a representative sample.
- Determine whether PDFs contain selectable text, scanned pages, tables, images, handwriting, etc.
- Determine whether filenames contain lesson numbers or useful categorisation.
- Identify duplicate PDFs or alternate versions.
- Determine whether there are non-PDF assets that should also be used.
- Do not assume the PDF filenames are perfectly organised.

Create a short project inventory, for example:

```text
docs/
  lesson-01-...
  lesson-02-...
  kanji-...
  vocabulary-...
```

Use the actual structure discovered in the project rather than inventing one.

If OCR is needed, identify an appropriate local tool and document the process.

---

# 3. Architecture

Choose a sensible architecture based on what you actually find in the PDFs.

A web application is completely acceptable and is probably preferable.

A good default would be:

- TypeScript
- React
- Vite
- local/static content
- CSS or a lightweight UI system
- local persistence via IndexedDB or localStorage
- optional PWA/offline support

However:

**Do not blindly use this stack if another architecture is clearly better.**

The application should not require a server merely to display and test learning content.

The important separation is:

```text
PDF source material
        ↓
extraction / normalisation
        ↓
structured content dataset
        ↓
application
        ↓
user progress / review state
```

Keep source data separate from UI code.

---

# 4. Content data architecture

Do NOT hard-code hundreds/thousands of vocabulary/kanji entries directly into React components.

Create a structured dataset.

Possible structure:

```text
src/
  app/
  components/
  features/
    kanji/
    vocabulary/
    grammar/
    numbers/
    lessons/
    review/
  data/
    lessons/
    kanji/
    vocabulary/
    grammar/
    numbers/
  i18n/
  lib/
  styles/
scripts/
  extract/
  validate/
docs/
  source-inventory.md
  extraction-log.md
```

The exact structure may differ.

The important thing is that content is data, not presentation code.

---

# 5. Content provenance is mandatory

Every extracted item should retain enough metadata to identify where it came from.

For example:

```json
{
  "id": "lesson-03-vocab-017",
  "lessonId": "lesson-03",
  "source": {
    "file": "some-original-file.pdf",
    "page": 7
  }
}
```

Use appropriate metadata for other item types.

This is important because extraction mistakes must be traceable back to the PDF.

Do not silently invent source material.

If an item is generated from source material, mark it as generated/derived.

---

# 6. Extraction rules

For every PDF:

1. Extract text if possible.
2. Preserve Japanese characters exactly.
3. Identify headings and sections.
4. Identify lesson number/topic.
5. Extract kanji.
6. Extract readings.
7. Extract vocabulary.
8. Extract grammatical structures.
9. Extract example sentences.
10. Extract number/counter material.
11. Extract exercises/questions where useful.
12. Record source page numbers.
13. Record uncertainty where OCR/extraction is questionable.

Do not treat OCR output as automatically correct.

Pay special attention to:

- ー
- ゃゅょ
- っ
- ゛ / ゜
- similar kanji
- punctuation
- particles
- conjugated forms
- furigana
- tables
- vertical text
- handwritten annotations
- PDF text ordering

When uncertain, preserve the uncertainty in the extraction log instead of silently guessing.

---

# 7. Do not lose useful information from PDFs

The PDFs may contain things that don't fit neatly into "vocabulary" or "grammar".

The content pipeline should therefore support:

- notes
- teacher explanations
- example sentences
- dialogues
- patterns
- conjugation tables
- counters
- cultural notes
- exercises
- exceptions
- common mistakes
- mnemonic information
- lesson-specific notes

If something is useful for maintaining Japanese ability, don't throw it away merely because the first schema did not anticipate it.

Extend the schema when necessary.

---

# 8. Main application sections

The main navigation should include at least:

1. **Dashboard**
2. **Kanji Lessons**
3. **Kanji Test**
4. **Vocabulary Lessons**
5. **Vocabulary Test**
6. **Grammar**
7. **Numbers & Counters**
8. **Lesson Review**
9. **Conjugation / Forms**
10. **Kana Review**
11. **Mixed Review**
12. **Weak Areas**
13. **Progress / Statistics**
14. **Settings**

If the source PDFs do not contain enough material for a section, do not fabricate a large curriculum. The section can gracefully explain that there is currently no source material.

---

# 9. Dashboard

The dashboard should make it easy to start studying immediately.

Show things such as:

- Continue last session
- Quick review
- Today's recommended review
- Weakest categories
- Recent accuracy
- Items due for review
- Lesson progress
- Overall progress
- Current streak, if useful
- Quick buttons:
  - Kanji Test
  - Vocabulary Test
  - Grammar
  - Numbers
  - Mixed Review

Do not make gamification dominate the application.

The purpose is learning, not collecting meaningless points.

---

# 10. Kanji Lessons

Provide a browsing/study mode for kanji.

For each kanji, where available:

- kanji
- meaning(s)
- on'yomi
- kun'yomi
- vocabulary examples
- example sentences
- lesson
- source reference

Useful interactions:

- reveal/hide readings
- reveal meanings
- reveal example words
- mark as difficult
- mark as known
- previous/next
- filter by lesson
- filter by difficulty/status

Do not invent readings or meanings not supported by the source data unless clearly marked as externally generated.

---

# 11. Kanji Test

This should be an actual input test, **not multiple choice**.

Support both directions:

### Japanese → English

Display:

```text
食
```

User types a meaning.

Accept one of the valid source meanings where appropriate.

### English → Japanese

Display:

```text
eat / food
```

User enters:

```text
食
```

The test should not demand exact string equality when that would be unreasonable.

For example, normalise:

- whitespace
- casing where relevant
- punctuation
- common formatting differences

But do not make the acceptance system so permissive that almost anything counts as correct.

---

# 12. "I was close enough" system

This is important.

The application is for self-learning, so a strict automatic grader is not always appropriate.

After an answer is marked wrong, provide:

- `I was close enough`
- `Wrong`
- optionally `Show answer`

If the user selects **I was close enough**, count the answer as accepted for that attempt.

Store the distinction:

```text
automatically correct
self-marked correct
wrong
```

This allows statistics to remain honest without frustrating the learner.

For example:

```text
Accuracy:
  Auto-correct: 78%
  Accepted by learner: 9%
  Total accepted: 87%
```

Do not shame the user for self-correcting.

---

# 13. Vocabulary Lessons

Vocabulary should show, where available:

- kanji
- hiragana/katakana
- English meaning
- Polish meaning
- part of speech
- example sentence
- lesson
- source
- notes

If a word is normally written only in kana, preserve that.

If multiple spellings exist, represent them properly rather than collapsing them into one string.

---

# 14. Vocabulary Test

Like the kanji test, this should primarily use **typed answers**.

Support:

### Japanese → English

Show:

```text
食べる
たべる
```

User types meaning.

### English → Japanese

Show:

```text
to eat
```

User enters:

```text
食べる
```

or the accepted kana form where appropriate.

Consider testing:

- kanji + kana
- kana only
- meaning
- reading

depending on the selected test mode.

Do not make everything multiple choice.

---

# 15. Grammar

Grammar should be more interactive than simply displaying notes.

Use the grammar patterns found in the PDFs.

Possible exercise types:

### Fill the blank

```text
昨日、映画を ______。
```

### Choose the correct conjugation

Example:

```text
行く → ?

A. 行きます
B. 行った
C. 行くて
D. 行いて
```

### Sentence transformation

```text
Present → past
Positive → negative
Plain → polite
```

### Particle selection

```text
学校 ___ 行きます。
```

### Form selection

Use the actual grammatical structures taught in the source lessons.

---

# 16. Japanese conjugation/form engine

This deserves its own reusable module.

Japanese forms can become complicated depending on:

- verb class
- adjective type
- tense
- polarity
- politeness
- te-form
- ta-form
- nai-form
- dictionary form
- potential/other forms if actually taught

Do not implement a giant Japanese grammar engine just for theoretical completeness.

Instead:

1. Identify which forms are actually present in the PDFs.
2. Implement those forms.
3. Make the engine data-driven where practical.
4. Add tests for conjugation rules.
5. Add exceptions explicitly.

Example internal model:

```ts
type ConjugationRequest = {
  lemma: string;
  form: string;
  polarity?: "positive" | "negative";
  tense?: "nonpast" | "past";
  politeness?: "plain" | "polite";
};
```

The exact implementation is up to you.

The grammar system should be robust enough for the actual A2 material in the PDFs.

---

# 17. Numbers & Counters

Give Japanese numbers their own section.

Include, where supported by the source material:

- cardinal numbers
- dates
- time
- prices
- ages
- people
- objects
- counters
- irregular pronunciations
- number reading patterns

Create both:

### Lesson mode

Browse explanations and examples.

### Test mode

Examples:

```text
42 → Japanese
```

or:

```text
よんじゅうに → 42
```

or:

```text
3 people → Japanese
```

The exact categories should be derived from the source material.

---

# 18. Lesson Review

Create review sections for Lessons 1–20 (or the actual lesson count discovered in the PDFs).

Each lesson should have:

### Study / Lessons mode

Break material into digestible chunks.

Do NOT show an entire lesson as one giant wall of text.

A good default is to divide each lesson into cards/sections such as:

```text
Lesson 7

1. Vocabulary
2. Kanji
3. Grammar pattern A
4. Grammar pattern B
5. Example sentences
6. Numbers / counters
7. Notes
8. Mini review
```

The exact grouping should follow the source material.

### Test mode

Generate a mixed test from that lesson:

- vocabulary
- kanji
- grammar
- numbers
- sentence completion
- reading/meaning

The learner should be able to choose:

- short
- normal
- long

rather than being forced to review the entire lesson every time.

---

# 19. Digestible review chunks

Do not arbitrarily split lessons every N items.

Prefer semantic chunks.

For example:

```text
Lesson 4
  Part 1 — vocabulary
  Part 2 — kanji
  Part 3 — grammar: X
  Part 4 — grammar: Y
  Part 5 — examples
```

If a lesson is particularly large, split it further.

The goal is that a learner can reasonably complete a chunk in roughly 5–15 minutes.

---

# 20. Kana Review

If the PDFs contain hiragana/katakana learning or useful kana exercises, add a Kana section.

Possible modes:

- kana → romaji
- romaji → kana
- mixed kana recognition
- small ゃゅょ
- small っ
- dakuten/handakuten

However, do not spend excessive development effort here if the source material assumes kana is already mastered.

---

# 21. Mixed Review

Create a mode that randomly mixes:

- kanji
- vocabulary
- grammar
- numbers
- kana
- lesson material

Allow filtering:

```text
All
Kanji
Vocabulary
Grammar
Numbers
Lessons
```

And ideally:

```text
Easy
Medium
Hard
Weak only
```

---

# 22. Weak Areas

Track per-item performance.

A simple model is sufficient initially.

For example:

```ts
type ItemStats = {
  itemId: string;
  attempts: number;
  automaticCorrect: number;
  selfAccepted: number;
  wrong: number;
  lastSeen?: string;
  lastCorrect?: string;
  difficultyScore?: number;
};
```

Use this to surface:

- frequently missed items
- items not reviewed recently
- grammar patterns with low accuracy
- kanji with repeated mistakes
- vocabulary that needs reinforcement

Do not over-engineer spaced repetition at first.

A simple Leitner-style or lightweight SM-2-inspired system is enough if useful.

---

# 23. Spaced repetition

Implement spaced repetition only after the basic test system works correctly.

The review algorithm should be replaceable.

Possible initial states:

```text
New
Learning
Review
Mastered
```

A user answering:

- correct
- self-accepted
- wrong

should affect the review schedule differently.

Suggested principle:

- wrong → review sooner
- self-accepted → moderate interval
- automatic correct → longer interval

Do not pretend the algorithm is scientifically perfect.

The goal is practical maintenance.

---

# 24. Answer evaluation

Create reusable answer-normalisation functions.

For English:

- trim whitespace
- normalise casing
- tolerate harmless punctuation differences
- support multiple valid meanings
- support synonyms only when explicitly configured or safely derived

For Japanese:

- trim whitespace
- normalise Unicode where appropriate
- handle kana/kanji variants when the item explicitly allows them
- do not automatically treat unrelated spellings as equivalent

For example, an item could contain:

```json
{
  "acceptedAnswers": [
    "to eat",
    "eat"
  ]
}
```

For Japanese:

```json
{
  "acceptedAnswers": [
    "食べる",
    "たべる"
  ]
}
```

Keep answer acceptance transparent and editable.

---

# 25. English and Polish UI

The UI should be internationalised from the beginning.

Default:

```text
English
```

Optional:

```text
Polski
```

Use translation keys, not duplicated UI components.

Example:

```ts
{
  "nav.kanji": {
    "en": "Kanji",
    "pl": "Kanji"
  },
  "test.submit": {
    "en": "Check answer",
    "pl": "Sprawdź odpowiedź"
  }
}
```

Japanese learning content itself should be represented separately from UI translations.

Do not automatically machine-translate all PDF content into Polish.

Where the source provides English meanings, use those.

Where useful, add Polish meanings carefully and mark them as translated/derived if they are not present in the source.

---

# 26. Data model suggestion

Start with something along these lines, then adapt to the real source material.

```ts
type Lesson = {
  id: string;
  number: number;
  title?: string;
  description?: string;
  sourceFiles: SourceReference[];
  sections: LessonSection[];
};

type SourceReference = {
  file: string;
  page?: number;
};

type KanjiEntry = {
  id: string;
  character: string;
  meanings: LocalizedText[];
  onyomi?: string[];
  kunyomi?: string[];
  vocabularyIds?: string[];
  lessonIds: string[];
  source: SourceReference[];
};

type VocabularyEntry = {
  id: string;
  kanji?: string;
  kana: string;
  meanings: LocalizedText[];
  partOfSpeech?: string[];
  exampleSentenceIds?: string[];
  lessonIds: string[];
  source: SourceReference[];
};

type GrammarEntry = {
  id: string;
  pattern: string;
  explanation: LocalizedText[];
  examples: ExampleSentence[];
  lessonIds: string[];
  source: SourceReference[];
};

type NumberEntry = {
  id: string;
  value?: number;
  japanese: string;
  reading?: string;
  counter?: string;
  notes?: LocalizedText[];
  lessonIds: string[];
  source: SourceReference[];
};

type ExampleSentence = {
  japanese: string;
  reading?: string;
  meanings: LocalizedText[];
  source: SourceReference[];
};
```

Use a flexible model where necessary.

---

# 27. Generated exercises

Exercises may be generated from extracted source data.

For example, from:

```text
Vocabulary:
学校 — がっこう — school
```

the application can generate:

```text
What does 学校 mean?
```

or:

```text
How do you write "school" in Japanese?
```

For grammar, generate exercises based on actual patterns and example sentences.

**Do not invent grammar that was not taught.**

Generated questions should have provenance such as:

```json
{
  "generated": true,
  "basedOn": [
    "lesson-04-grammar-02"
  ]
}
```

If a generated exercise could be ambiguous, do not include it.

---

# 28. PDF processing workflow

Create a repeatable extraction workflow.

For each source PDF:

```text
PDF
 ↓
text/OCR extraction
 ↓
page-aware intermediate representation
 ↓
human/LLM-assisted classification
 ↓
structured JSON
 ↓
validation
 ↓
application dataset
```

Do not make the UI directly parse PDFs at runtime unless there is a strong reason.

The PDFs are source material, not the application's primary runtime database.

---

# 29. Extraction log

Maintain a file such as:

```text
docs/extraction-log.md
```

Track every PDF:

```text
| File | Lesson | Type | Status | Notes |
|------|--------|------|--------|-------|
| xxx.pdf | 1 | vocabulary | complete | |
| yyy.pdf | 1 | kanji | complete | OCR page 3 |
| zzz.pdf | 2 | grammar | needs-review | ambiguous table |
```

Possible statuses:

- pending
- processing
- complete
- needs-review
- skipped
- duplicate

**Never silently skip a PDF.**

If a PDF contains no useful learning content, record that explicitly.

---

# 30. Validation

Build validation scripts.

At minimum check:

- duplicate IDs
- missing lesson IDs
- broken references
- empty Japanese fields
- empty meanings
- duplicate vocabulary
- malformed JSON
- invalid source references
- grammar items without examples where examples are required
- impossible conjugation definitions
- orphaned items

Example command:

```bash
npm run validate-content
```

The command should fail loudly if the dataset is invalid.

---

# 31. Progress persistence

User progress must survive application restarts.

Use local storage/IndexedDB.

Store:

- attempts
- correctness
- self-accepted answers
- review schedule
- last studied
- known/difficult flags
- settings
- language
- preferred test directions
- session history if useful

Do not store sensitive personal information.

Provide:

- Export progress
- Import progress
- Reset progress

A JSON export is sufficient initially.

---

# 32. Test session UX

A test should feel quick and responsive.

Example flow:

```text
Question
 ↓
User types answer
 ↓
Check
 ↓
Result
    ✓ Correct
    ✗ Wrong
    ~ Close enough
 ↓
Show explanation/source if useful
 ↓
Next
```

Keyboard-first interaction is strongly preferred.

Useful shortcuts:

- Enter = submit
- Enter = next after result
- maybe `C` = close enough
- maybe `S` = show answer

Do not force mouse usage.

---

# 33. Test configuration

Before starting a test, allow:

- category
- lesson
- number of questions
- direction
- difficulty
- weak-only
- include mastered items
- Japanese → English
- English → Japanese

For vocabulary, optionally:

- kanji required
- kana accepted
- meaning test
- reading test

Keep configuration simple enough that the user can start quickly.

---

# 34. Visual design

Aim for:

- clean
- calm
- readable
- slightly Japanese-inspired but not cliché
- excellent Japanese typography
- dark/light mode
- responsive desktop/mobile layout
- large Japanese text during tests
- clear answer feedback
- minimal distractions

Avoid:

- excessive anime decoration
- giant flags
- fake Japanese aesthetic
- gamification overload
- corporate dashboard aesthetics

This is a learning tool.

---

# 35. Accessibility

Support:

- keyboard navigation
- visible focus states
- sufficient contrast
- screen-reader-friendly controls
- readable Japanese fonts
- scalable text
- mobile touch targets

Do not use colour alone to indicate correctness.

---

# 36. Search and filtering

Once the dataset is large, provide global search.

Search should find:

- kanji
- kana
- English
- Polish
- grammar pattern
- lesson
- source

For example:

```text
食べる
eat
たべる
Lesson 3
```

should lead to the same vocabulary item where appropriate.

---

# 37. Lesson/source navigation

For every learning item, optionally expose:

```text
Source: Lesson 7 — page 12
```

This is useful when someone wants to verify the original lesson material.

If the application can safely link to/open the original PDF locally, consider adding that.

Do not make source navigation mandatory for normal study flow.

---

# 38. Error handling

The application should fail gracefully.

Examples:

- missing content file
- malformed dataset
- unknown lesson
- missing translation
- unsupported exercise type
- corrupted progress data

Show useful errors rather than blank screens.

---

# 39. Development strategy

Implement in phases.

## Phase 1 — Skeleton

Build:

- application shell
- routing/navigation
- theme
- language switch
- dashboard
- empty states
- data model
- progress storage abstraction

At this stage it is fine for content to be minimal.

## Phase 2 — Content pipeline

Build:

- PDF inventory
- extraction scripts
- intermediate format
- final structured dataset
- validation
- extraction log

## Phase 3 — First complete feature

Fully implement:

- Kanji Lessons
- Kanji Test
- answer evaluation
- self-accepted answers
- progress tracking

Use a small amount of real extracted content first to prove the architecture.

## Phase 4

Implement:

- Vocabulary Lessons
- Vocabulary Test

## Phase 5

Implement:

- Grammar
- conjugation/forms
- grammar exercises

## Phase 6

Implement:

- Numbers & Counters

## Phase 7

Implement:

- Lesson Reviews 1–20
- digestible lesson chunks

## Phase 8

Implement:

- Kana
- Mixed Review
- Weak Areas
- spaced repetition

## Phase 9

Process the remaining PDFs and complete the dataset.

## Phase 10

Final validation, UX polish, testing, build and documentation.

---

# 40. How to process the PDFs during development

When processing the source material, prefer this loop:

```text
1. Pick ONE PDF.
2. Read/extract it.
3. Identify its lesson/topic.
4. Extract useful structured content.
5. Add provenance.
6. Validate.
7. Commit/save the resulting data.
8. Update extraction-log.md.
9. Move to the next PDF.
```

If several PDFs are clearly pages/parts of the same document, they can be processed together.

Do not load all 80 PDFs into one prompt merely for convenience.

If context becomes large, continue from the persisted dataset/log instead.

---

# 41. Avoid data duplication

The same vocabulary or kanji may appear in several lessons.

Do not blindly create duplicate entities.

Prefer:

```text
canonical vocabulary item
       ↓
lesson associations
```

rather than:

```text
Lesson 1 copy
Lesson 5 copy
Lesson 8 copy
```

However, lesson-specific notes/examples should remain associated with the appropriate lesson.

---

# 42. Preserve lesson context

A word may have different importance depending on where it appears.

Keep:

- canonical item
- lesson associations
- source references
- lesson-specific examples/notes

This lets the app support both:

```text
All vocabulary
```

and:

```text
Vocabulary from Lesson 8
```

---

# 43. No hallucinated curriculum

This is one of the most important rules.

Do not add:

- random N5/N4 grammar
- random kanji
- random vocabulary
- invented lesson content
- unsupported meanings
- invented example sentences presented as source material

unless explicitly marked as generated supplementary material.

The primary curriculum must come from the PDFs.

If something is missing, say so in the data rather than filling the gap invisibly.

---

# 44. Supplementary content

After the complete source curriculum works, it is acceptable to add supplementary features.

Examples:

- additional example sentences
- alternative translations
- extra practice questions
- small explanations

But clearly distinguish:

```text
From your lesson
```

from:

```text
Supplementary
```

The source material remains authoritative for this application.

---

# 45. Japanese correctness

Be especially careful with generated Japanese.

For any generated Japanese sentence/exercise:

- verify grammar
- verify conjugation
- verify intended meaning
- avoid unnatural sentences
- do not create ambiguous questions

If uncertain, prefer using an actual sentence from the lesson.

---

# 46. Testing

Add automated tests for:

### Data

- schema validation
- duplicate detection
- broken references

### Japanese forms

- verb conjugations actually used by the curriculum
- adjective forms
- particles where applicable

### Answer grading

- exact correct
- normalisation
- multiple accepted answers
- close-enough/manual acceptance
- clearly wrong answers

### UI

At minimum test the core test flow:

```text
start test
→ display question
→ enter answer
→ check
→ mark result
→ next
→ save progress
```

---

# 47. Performance

There may eventually be thousands of learning items.

Do not load unnecessarily huge structures into every component.

Use:

- lazy loading where appropriate
- indexed content
- memoisation where useful
- efficient search

But do not prematurely optimise.

A static local dataset of a few thousand items should be perfectly manageable with a sensible architecture.

---

# 48. README

Create a useful README explaining:

- what the application does
- stack
- how to install
- how to run
- how content is generated
- how to validate content
- how to add/process another PDF
- how progress is stored
- how to build the production version

Example:

```bash
npm install
npm run dev
npm run validate-content
npm run build
```

Adapt commands to the actual stack.

---

# 49. Claude Code operating instructions

When working on this project:

### Before major changes

Inspect the existing code first.

Do not overwrite working architecture without a reason.

### When extracting PDFs

Process incrementally.

Persist results immediately.

### When uncertain

Prefer:

1. inspecting the source PDF,
2. checking surrounding pages,
3. checking existing extracted data,
4. recording uncertainty,

over guessing.

### When adding features

Keep content, business logic and UI separate.

### When finishing a task

Run relevant tests/validation.

Do not claim that all PDFs have been processed unless the extraction log confirms it.

---

# 50. Definition of done

The project is considered complete when:

- [ ] Application runs locally.
- [ ] English UI works.
- [ ] Polish UI works.
- [ ] All relevant PDFs are inventoried.
- [ ] Every relevant PDF has a status in `extraction-log.md`.
- [ ] Source content has been converted into structured data.
- [ ] Source references are preserved.
- [ ] Kanji Lessons work.
- [ ] Kanji Tests work.
- [ ] Typed answers work.
- [ ] JP → EN works.
- [ ] EN → JP works.
- [ ] "I was close enough" works.
- [ ] Vocabulary Lessons work.
- [ ] Vocabulary Tests work.
- [ ] Grammar lessons work.
- [ ] Grammar exercises work.
- [ ] Relevant conjugation/forms work.
- [ ] Numbers & Counters work.
- [ ] Lesson Reviews work.
- [ ] Lessons can be consumed in digestible chunks.
- [ ] Kana review exists when supported by the source material.
- [ ] Mixed Review works.
- [ ] Weak Areas works.
- [ ] Progress persists between sessions.
- [ ] Progress can be exported/imported.
- [ ] Content validation passes.
- [ ] Automated tests for critical functionality pass.
- [ ] Production build succeeds.
- [ ] README documents the project.
- [ ] No major source material was silently omitted.

---

# 51. Suggested future enhancements

Do not implement these before the core system is solid, but leave the architecture open for:

- audio pronunciation
- text-to-speech
- handwriting/kanji drawing practice
- pitch-accent information
- JLPT-style mixed tests
- configurable spaced repetition algorithms
- study-session timers
- daily goals
- PWA installation
- optional cloud sync
- multiple user profiles
- import/export of the content dataset
- teacher-created custom exercises

These are secondary to accurately representing the existing 20-lesson curriculum.

---

# 52. Final principle

The application should feel like a **personal Japanese revision system built from the lessons we actually took**, not like a generic Japanese-learning app.

Priorities, in order:

1. **Accuracy of source material**
2. **Complete coverage of the PDFs**
3. **Useful typed-answer testing**
4. **Good grammar/form practice**
5. **Fast, frictionless review**
6. **Progress tracking**
7. **Good UX**
8. **Extra features**

When forced to choose between flashy features and correctly importing another lesson's material:

> **Import the lesson material.**
