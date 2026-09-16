# Source PDF Inventory

This document is the result of Phase 1 inspection (see
`Japanese_A2_App_Claude_Instructions.md`, section 2). It records what every
PDF in the project root actually is, before any extraction happens. It is a
**living reference** — update it if a file's role changes, but do not delete
history from it.

Extraction status per file is tracked separately in `docs/extraction-log.md`.

## Course identity

The core curriculum is a course called **"The Japanese Summer Challenge"**,
taught by an instructor going by **"Black Moon"**, running weekly from
**12 June 2026 to 28 August 2026**. It has two parallel weekly tracks:

- **Main classes**: intro classes "Class A" and "Class B", then numbered
  classes **N°01–N°10** (vocabulary, conjugation, grammar each week).
- **Kanji sets**: **Set n°01–n°10**, run a few days after the matching
  numbered class, each introducing ~10–25 new kanji plus related vocabulary.

Confirmed timeline (dates read from each file's title page):

| Date (2026) | Item |
|---|---|
| 12 Jun | Class A |
| 19 Jun | Class B |
| 26 Jun | Class N°01 |
| 28 Jun | Kanji Set 01 |
| 3 Jul | Class N°02 |
| 5 Jul | Kanji Set 02 |
| 10 Jul | Class N°03 |
| 12 Jul | Kanji Set 03 |
| 17 Jul | Class N°04 |
| 19 Jul (doc header says "19th June", likely a typo in the source) | Kanji Set 04 |
| 24 Jul | Class N°05 |
| 26 Jul | Kanji Set 05 |
| 31 Jul | Class N°06 |
| 2 Aug | Kanji Set 06 |
| 7 Aug | Class N°07 |
| 9 Aug | Kanji Set 07 |
| 14 Aug | Class N°08 |
| 16 Aug | Kanji Set 08 |
| 21 Aug | Class N°09 |
| 23 Aug | Kanji Set 09 |
| 28 Aug | Class N°10 |
| 29 Aug | Kanji Set 10 |

This gives **12 "lesson" units** for Lesson Review purposes: `class-a`,
`class-b`, `class-01` … `class-10`, each carrying its paired kanji set where
one exists (`class-01`↔`kanji-set-01` … `class-10`↔`kanji-set-10`; A and B
have no paired kanji set).

## File format findings

- All sampled PDFs (including the largest slide decks, 293 pages) have a real
  **embedded text layer** — `pdftotext -layout` extracts genuine Unicode
  Japanese/English text, not garbage. **No OCR pipeline is required** for any
  file in this project.
- The **4 "printable flashcard" PDFs** (`JLPT N4/N5 Grammar/Kanji Flashcards`)
  are the one exception: each "page" is a rasterized card image with only a
  copyright footer as real text (confirmed via `pdfimages -list`, one
  1080×1080 image per card). Their content is a strict subset of other
  text-based files in this same folder, so they are **skipped rather than
  OCR'd** (not worth the effort/error risk to re-derive text already
  available cleanly elsewhere).
- The big slide decks (`CLASS N°xx — The Japanese Summer Challenge.pdf`,
  `ACTIVE KANJI — Set n°xx.pdf`) use a layout where furigana is placed as
  separate text objects positioned above/around kanji. `pdftotext -layout`
  extracts this in a visually-jumbled reading order (e.g. individual furigana
  mora interleaved with surrounding decorative text). These decks are
  therefore **secondary/cross-reference sources**, used to fill gaps or
  verify ambiguous entries — not the primary extraction source.
- The `... - synthesis & assignments.pdf` files (per main class) and
  `KANJI - SET N°xx - synthesis & assignments.pdf` files are clean, linearly
  laid out text: `word (reading) = meaning` tables, grammar explanations,
  conjugation tables, particle tables, and example sentences with a
  phonetic reading line in `『...』`. **These are the primary extraction
  source** wherever they exist.
- All `... - synthesis & assignments.pdf` files (Class A/B, Class N°03–10,
  Kanji Set 01–10) embed a font that maps the **"tt" and "ff" ligatures to
  Private Use Area Unicode codepoints** (U+E009 = "tt", U+E007 = "ff")
  instead of standard Unicode text, so `pdftotext` extracts literal unmapped
  PUA characters wherever the source PDF used those ligatures (e.g. in
  "better", "https://", "setting off"). This was confirmed by cross-checking
  words split around the PUA character against context (`hE009ps://` =
  "https://", `beE009er` = "better", `insuE007iciency` = "insufficiency").
  No other PUA codepoints were found anywhere else in the project's ~80
  PDFs. `scripts/extract/lib/pdftext.ts` fixes both codepoints
  automatically for every file it processes. This only affects Latin/English
  prose text (mostly in assignments/bonus sections and grammar explanations);
  it cannot affect Japanese text since kana/kanji are unrelated codepoints.
- Exact duplicate files exist (identical MD5): `N4 Kanji List -
  JLPTsensei.com (1).pdf` = `N4 Kanji List - JLPTsensei.com.pdf`, and
  `JLPT N5 Verbs Ebook by JLPTsensei.com (1).pdf` = `JLPT N5 Verbs Ebook by
  JLPTsensei.com.pdf`.
- `FULLKANJI (1).pdf` is a literal concatenation of `N5 Kanji List -
  JLPTsensei.com.pdf` + the N4 kanji list content (verified via `diff`).
  `FULLVOC.pdf` is a concatenation of the N5 nouns list + N5 verbs list (and
  likely more vocabulary lists further in). Both are **compiled duplicates**
  of standalone files already in this folder, not original course material.

## Inventory by group

### A. Intro classes (pre-numbered)

| File | Pages | Role |
|---|---|---|
| `Class A - Japanese Language System.pdf` | 12 | Slide deck: overview of writing/vocab/grammar/conjugation systems |
| `Class A — Basic Expressions.pdf` | 10 | Slide deck: greetings/basic expressions table |
| `Class A - synthesis & assignments.pdf` | 10 | Clean synthesis: hiragana table, etc. |
| `Class B - synthesis & assignments.pdf` | 14 | Clean synthesis: katakana, useful links (Jisho, PlayPhrase.me, etc.) |

### B. Main weekly classes N°01–10

| File | Pages | Role |
|---|---|---|
| `CLASS N°01 — The Japanese Summer Challenge.pdf` | 142 | Slide deck (secondary source) |
| `CLASS N°02 — The Japanese Summer Challenge.pdf` | 135 | Slide deck (secondary source) — **no synthesis doc exists for 01/02** |
| `Class N°03 - synthesis & assignments.pdf` | 24 | Primary source |
| `CLASS N°03 — The Japanese Summer Challenge.pdf` | 87 | Slide deck (secondary source) |
| `Class N°04 - synthesis & assignments.pdf` | 28 | Primary source |
| `CLASS N°04 — The Japanese Summer Challenge.pdf` | 121 | Slide deck (secondary source) |
| `Class N°05 - synthesis & assignments.pdf` | 28 | Primary source |
| `CLASS N°05 — The Japanese Summer Challenge.pdf` | 109 | Slide deck (secondary source) |
| `Class N°06 - synthesis & assignments.pdf` | 27 | Primary source |
| `CLASS N°06 — The Japanese Summer Challenge.pdf` | 110 | Slide deck (secondary source) |
| `Class N°07 - synthesis & assignments.pdf` | 21 | Primary source |
| `CLASS N°07 — The Japanese Summer Challenge.pdf` | 77 | Slide deck (secondary source) |
| `Class N°08 - synthesis & assignments.pdf` | 18 | Primary source |
| `CLASS N°08 — The Japanese Summer Challenge.pdf` | 65 | Slide deck (secondary source) |
| `Class N°09 - synthesis & assignments.pdf` | 20 | Primary source |
| `CLASS N°09 — The Japanese Summer Challenge.pdf` | 77 | Slide deck (secondary source) |
| `Class N°10 - synthesis & assignments.pdf` | 19 | Primary source |
| `CLASS N°10 — The Japanese Summer Challenge.pdf` | 77 | Slide deck (secondary source) |

### C. Kanji sets 01–10

| File | Pages | Role |
|---|---|---|
| `ACTIVE KANJI  — Set n°01.pdf` … `n°10.pdf` | 68–70 each | Slide decks, one kanji per page + exercises (secondary source, but useful for extra example words/exercises) |
| `KANJI - SET N°01 - synthesis & assignments.pdf` … `N°10` | 11 each | Primary source: condensed `漢字 (reading) = meaning` + vocab lines |

### D. Assignments

| File | Pages | Role |
|---|---|---|
| `ASSIGNMENT N°06.pdf` | 3 | Standalone vocabulary-gap-fill assignment tied to Class N°06. Only assignment file present despite 10 classes. |

### E. Extra practice / supplementary course material

| File | Pages | Role |
|---|---|---|
| `Dialogues-Reading.pdf` | 12 | Dialogue reading practice with furigana |
| `Extra Activity - Building Sentences 1.pdf` | 5 | Example sentence bank |
| `Extra Activity - Dictation 1.pdf` | 2 | Dictation exercise (JP text + EN translation) |
| `Extra Activity - Reading Session 1.pdf` | 10 | Reading passage w/ furigana + translation |
| `Peppa Pig Analysis 1_4.pdf` … `4_4.pdf` | 20–24 each | Episode transcript/sentence analysis exercises |

These are not tied to a specific class number by filename; lesson association
(if any) will be determined during extraction from internal dates/content and
otherwise filed under a generic "Extra Practice" bucket.

### F. External reference material (JLPT Sensei) — supplementary, not original course content

| File | Pages | Status |
|---|---|---|
| `JLPT SENSEI - N4 Grammar List.pdf` | 5 | Usable text source |
| `JLPT N4 Grammar Master Ebook by JLPTsensei.com.pdf` | 293 | Usable text source |
| `JLPT SENSEI - N4 Vocabulary - い adjectives List.pdf` | 1 | Usable text source |
| `JLPT SENSEI - N4 Vocabulary - な adjectives List.pdf` | 1 | Usable text source |
| `N4 Kanji List - JLPTsensei.com.pdf` | 12 | Usable text source |
| `N4 Kanji List - JLPTsensei.com (1).pdf` | 12 | **Duplicate** of the above (identical MD5) |
| `N4 Vocabulary - Adverbs List - JLPTsensei.com.pdf` | 2 | Usable text source |
| `N4 Vocabulary - Katakana Words List - JLPTsensei.com.pdf` | 2 | Usable text source |
| `N4 Vocabulary - Nouns List - JLPTsensei.com.pdf` | 16 | Usable text source |
| `N4 Vocabulary - Particles List - JLPTsensei.com.pdf` | 2 | Usable text source |
| `N4 Vocabulary - Verbs List - JLPT Sensei.pdf` | 20 | Usable text source |
| `N5 Kanji List - JLPTsensei.com.pdf` | 7 | Usable text source |
| `JLPT N5 Grammar Master Ebok by JLPTsensei.com (1).pdf` | 192 | Usable text source |
| `N5 Verbs LIST (1).pdf` | 8 | Usable text source |
| `JLPT N5 Verbs Ebook by JLPTsensei.com.pdf` | 130 | Usable text source |
| `JLPT N5 Verbs Ebook by JLPTsensei.com (1).pdf` | 130 | **Duplicate** of the above (identical MD5) |
| `JLPT N5 Vocabulary Nouns Ebook by JLPTsensei.com.pdf` | 439 | Usable text source |
| `Vocabulary - N5 Nouns List - JLPT Sensei.pdf` | 16 | Usable text source |
| `N5 Vocabulary - Adjectives (い) List - JLPT Sensei V2.pdf` | 3 | Usable text source |
| `N5 Vocabulary - Adjectives (な) List - JLPT Sensei V2.pdf` | 1 | Usable text source |
| `JLPT N4 Grammar List Flashcards (printable set).pdf` | 23 | **Image-only**, skip (superseded by `JLPT SENSEI - N4 Grammar List.pdf` / ebook) |
| `JLPT N4 Kanji Flashcards (printable set).pdf` | 29 | **Image-only**, skip (superseded by `N4 Kanji List - JLPTsensei.com.pdf`) |
| `JLPT N5 Grammar List Flashcards (printable set).pdf` | 15 | **Image-only**, skip (superseded by N5 Grammar Master ebook) |
| `JLPT N5 Kanji List Flashcards (printable set).pdf` | 14 | **Image-only**, skip (superseded by `N5 Kanji List - JLPTsensei.com.pdf`) |
| `FULLKANJI (1).pdf` | 67 | **Compiled duplicate** of N5+N4 kanji lists, skip |
| `FULLVOC.pdf` | 78 | **Compiled duplicate** of N5 nouns+verbs (+more) lists, skip |

All Group F content will be imported as clearly-labeled **supplementary
reference** (JLPT N5/N4 official lists), never merged into or presented as
the original "from your lesson" curriculum, per instructions section 44.

## Open questions / risks to revisit during extraction

- Kanji Set 04's synthesis doc header date ("19th June 2026") is
  inconsistent with the rest of the sequence — treat as a source typo, not a
  reordering; verify against its content once extracted.
- Only one `ASSIGNMENT N°xx.pdf` exists (N°06). Do not fabricate the missing
  assignments 01–05, 07–10.
- Extra Activity / Dialogues-Reading / Peppa Pig files are not dated/numbered
  to a specific class; they'll be filed as general "Extra Practice" content
  rather than forced into a specific lesson slot, unless internal content
  reveals a clear link during extraction.
