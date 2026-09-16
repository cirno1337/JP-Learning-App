# Japanese A2 Revision App

A self-study web app for revising the content taught in "The Japanese Summer
Challenge" (taught by Black Moon), supplemented with JLPT N5/N4 reference
material. Every fact in the app is traceable back to a specific PDF and page
— nothing is invented by the extraction pipeline or the app itself.

## What it does

- **Kanji, Vocabulary, Grammar, Numbers & Counters, Conjugation/Forms, Kana** —
  browsable lesson views plus typed-answer tests (not multiple choice), with
  an "I was close enough" self-grading option for near-miss answers.
- **Lesson Review** — every class from the course as a digestible, section-by-
  section chunk, with a per-lesson test (short/normal/long).
- **Mixed Review** and **Weak Areas** — cross-category typed tests, the
  latter built from your own answer history (anything you've gotten wrong).
- **Progress / Statistics** and **Dashboard** — local, Leitner-style spaced
  repetition tracking (streaks, due items, per-category accuracy).
- **Settings** — UI language (English/Polish) and theme.

Course-original content is kept visibly distinct from supplementary JLPT
reference content throughout the app (`origin: "course" | "supplementary"`).

## Stack

- Vite + React 19 + TypeScript
- react-router-dom for navigation
- oxlint for linting, vitest for unit tests
- No backend, no LLM at runtime, no network calls — fully offline once
  built. Progress is stored in the browser's `localStorage`.

## Getting started

```bash
npm install
npm run dev            # start the dev server
npm run build           # type-check (tsc -b) + production build
npm run preview          # preview the production build locally
npm run test              # run the vitest unit test suite
npm run lint               # oxlint
npm run validate-content    # check the extracted content dataset for schema/consistency issues
```

## Project layout

```
src/
  data/            # extracted content (JSON), grouped by category; auto-
                    # discovered via import.meta.glob in src/data/index.ts
  data/supplementary/  # JLPT reference content, kept separate from course content
  data/types.ts    # the content schema (Lesson, KanjiEntry, VocabularyEntry, ...)
  features/        # one folder per nav section (kanji, vocabulary, grammar, ...)
  lib/
    grading/       # typed-answer comparison (normalisation, accepted-answer matching)
    srs/           # Leitner-style spaced-repetition scheduling
    storage/       # localStorage-backed progress persistence
    testing/       # shared test-question helpers (e.g. splitting meanings into accepted answers)
  i18n/            # English/Polish UI translations + content localisation helpers

scripts/
  extract/         # the PDF → JSON extraction pipeline (see below)
  validate/        # validate-content.ts, run via `npm run validate-content`

docs/
  source-inventory.md    # full inventory of every source PDF and its extraction status
  extraction-log.md      # per-file status table (complete/skipped/duplicate/pending)
```

## How content extraction works

The source PDFs (course slide decks, synthesis documents, JLPT reference
lists — kept locally, not committed; see `.gitignore`) are the single source
of truth for all curriculum content. There is deliberately **no single
"extract everything" command** — each source PDF (or small family of
same-format PDFs) has its own small, deterministic, hand-written parser
script under `scripts/extract/`, because the documents don't share a
consistent enough layout for one generic parser to handle safely. Each
script is run individually with `tsx`, e.g.:

```bash
npx tsx scripts/extract/parseKanjiSet.ts
npx tsx scripts/extract/manual/class-05-grammar.ts
```

Every script reads its known source PDF(s) with `poppler-utils` (via
`scripts/extract/lib/pdftext.ts`), writes structured entries into
`src/data/<category>/*.json`, and records a `source: [{file, page}]` on
every entry it produces. `scripts/extract/lib/lessonFile.ts` provides the
shared, carefully-tested helpers (`loadOwnArray`/`saveOwnArray`,
`loadCrossLessonIndex`, `addOrMergeVocab`, ...) that every script uses to
avoid three specific bugs found during development: overwriting a lesson's
own file on re-run, colliding IDs between scripts, and losing merges into a
shared file when two different in-memory copies of it get read.

### Adding another PDF

1. Open the PDF and inspect its raw layout (`pdftotext -layout` is usually
   the fastest way) before writing anything — the format families in this
   course are inconsistent enough that assumptions from one document rarely
   transfer cleanly to another.
2. Add it as a new row in `docs/source-inventory.md` and
   `docs/extraction-log.md` so its status is tracked.
3. Either extend an existing parser (if the new PDF matches an existing
   format family) or write a new one-off script under `scripts/extract/`
   (or `scripts/extract/manual/` for content transcribed by hand, which is
   sometimes more reliable than parsing for small/irregular documents).
   Give every emitted entry a `source` reference and, for course lessons,
   wire the new items into the relevant lesson's `sections` in
   `src/data/lessons/*.json` (see `generateKanjiLessonSections.ts` for the
   pattern).
4. Run `npm run validate-content` to check the new entries pass schema and
   consistency checks (duplicate IDs, empty required fields, dangling
   references, etc.).
5. Update `docs/extraction-log.md` to mark the file complete (or
   skipped/duplicate, with a one-line reason).

### The three content-loss bugs `lessonFile.ts` prevents

- **Self-overwrite**: writing a lesson's newly-parsed items straight to its
  own file on every run wipes out any items from a previous run that didn't
  collide with anything this run. `loadOwnArray`/`saveOwnArray` treat the
  file's array as one live object that's mutated in place, not replaced.
- **ID collisions**: two scripts touching the same shared file (e.g. two
  classes both adding new vocabulary entries) starting their ID counters at
  1 independently. `makeIdSequencer` derives the next ID from the existing
  file's current maximum.
- **Double-read desync**: reading the same external file twice (once for a
  general index, once for dirty-tracking) means a merge into one in-memory
  copy never reaches the copy that actually gets saved.
  `loadCrossLessonIndex` returns one shared map per file so every merge and
  every save operates on the same object.

## How progress is stored

All learner progress lives in the browser's `localStorage`, under a single
versioned key (see `src/lib/storage/progressStore.ts`). It's per-browser,
never sent anywhere, and can be exported/imported/reset from the Settings
page. Each item (kanji, vocabulary word, grammar pattern, number, kana)
tracks attempt counts, a Leitner-style review bucket, a due date, and a
difficulty score used to power the Weak Areas page.
