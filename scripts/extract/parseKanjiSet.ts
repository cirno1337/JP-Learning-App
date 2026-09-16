import { extractPages } from "./lib/pdftext";
import { parseActiveKanjiDeck, type ActiveKanjiEntry } from "./lib/activeKanjiDeck";
import { writeJson } from "./lib/dataFiles";
import {
  loadOwnArray,
  saveOwnArray,
  makeIdSequencer,
  loadCrossLessonIndex,
  writeDirtyExternalFiles,
  mergeMeaning,
} from "./lib/lessonFile";
import type { KanjiEntry, LocalizedText, NoteEntry, SourceReference, VocabularyEntry } from "../../src/data/types";

/**
 * Combined parser for one "kanji of the week" set, merging two sources:
 *
 * - "ACTIVE KANJI — Set n°xx.pdf" (the slide deck) gives the AUTHORITATIVE
 *   ordered list of which kanji were taught this set, each with a terse
 *   canonical meaning — one dedicated page per kanji, always present even
 *   when the kanji is only ever used inflected/in compounds (verified: e.g.
 *   Set 02's 大/小/切/生/以/午 never appear as a bare line in the synthesis
 *   doc, but each has a full slide with an explicit "— Meaning —").
 * - "KANJI - SET N°xx - synthesis & assignments.pdf" (the synthesis doc)
 *   gives clean vocabulary lines (word/reading/meaning) and, for kanji that
 *   are natural standalone words, an explicit bare-character reading line
 *   too.
 *
 * Algorithm: walk the synthesis doc's flat entry-line list while advancing
 * a pointer through the active-kanji list. A line becomes the KanjiEntry
 * for the next expected kanji if it exactly equals that character (bare
 * line — the common case for nouns) or merely contains it (the kanji is
 * being introduced via an inflected/compound form, e.g. 大きい for 大); in
 * the latter case the kanji's meaning/reading cannot be taken from this
 * line (it's the compound's meaning, not the kanji's), so the meaning
 * comes from the slide deck and the reading is left unset with an
 * uncertainty note. Any active-kanji entries never matched at all (absent
 * from the synthesis doc's vocabulary entirely) are still emitted at the
 * end, slide-deck-only, so the week's full kanji count is never silently
 * dropped.
 *
 * Both output files (kanji and vocabulary) are shared with other scripts
 * for the same lessonId — see lib/lessonFile.ts for why they're loaded and
 * saved as one live array rather than a separate "new items" list.
 *
 * Usage:
 *   tsx scripts/extract/parseKanjiSet.ts \
 *     "ACTIVE KANJI  — Set n°01.pdf" \
 *     "KANJI - SET N°01 - synthesis & assignments.pdf" \
 *     class-01
 */

const NOISE_LINES = new Set(["SYNTHESIS", "KANJI", "VOCABULARY", "ASSIGNMENTS", "BONUS"]);
const NOISE_PATTERNS = [
  /^The Japanese Summer Challenge$/,
  /^KANJI - SET N°\d+$/,
  /^Synthesis & Assignments$/,
  /^\d{1,2}(st|nd|rd|th) .+ by Black Moon$/,
  /^\d{1,2}$/,
];

const ENTRY_PATTERN = /^(\S.*?)\s*\(([^()]+)\)\s*=\s*(.+)$/u;

interface RawLine {
  text: string;
  page: number;
}

function collectLines(pages: string[]): RawLine[] {
  const lines: RawLine[] = [];
  pages.forEach((pageText, idx) => {
    for (const raw of pageText.split("\n")) {
      const text = raw.trim();
      if (text) lines.push({ text, page: idx + 1 });
    }
  });
  return lines;
}

function isNoise(text: string): boolean {
  if (NOISE_LINES.has(text)) return true;
  return NOISE_PATTERNS.some((re) => re.test(text));
}

function main() {
  const [activeKanjiPath, synthesisPath, lessonId] = process.argv.slice(2);
  if (!activeKanjiPath || !synthesisPath || !lessonId) {
    console.error(
      "Usage: tsx scripts/extract/parseKanjiSet.ts <active-kanji-deck.pdf> <synthesis.pdf> <lessonId>",
    );
    process.exit(1);
  }

  const activeKanjiFile = activeKanjiPath.split("/").pop()!;
  const synthesisFile = synthesisPath.split("/").pop()!;
  const activeList: ActiveKanjiEntry[] = parseActiveKanjiDeck(activeKanjiPath);
  if (activeList.length === 0) {
    console.error(`No kanji found in ${activeKanjiFile} — check the slide format assumptions.`);
    process.exit(1);
  }

  const pages = extractPages(synthesisPath);
  const lines = collectLines(pages);
  const boundaryIdx = lines.findIndex((l) => l.text === "ASSIGNMENTS");
  const contentLines = boundaryIdx === -1 ? lines : lines.slice(0, boundaryIdx);
  const tailLines = boundaryIdx === -1 ? [] : lines.slice(boundaryIdx);

  const kanjiDir = "src/data/kanji";
  const vocabDir = "src/data/vocabulary";
  const ownKanjiPath = `${kanjiDir}/${lessonId}.json`;
  const ownVocabPath = `${vocabDir}/${lessonId}.json`;

  const ownKanji = loadOwnArray<KanjiEntry>(ownKanjiPath);
  const ownVocab = loadOwnArray<VocabularyEntry>(ownVocabPath);
  const nextKanjiId = makeIdSequencer(ownKanji, `${lessonId}-kanji-`);
  const nextVocabId = makeIdSequencer(ownVocab, `${lessonId}-vocab-`);

  const kanjiByChar = loadCrossLessonIndex<KanjiEntry>(kanjiDir, ownKanjiPath, ownKanji, (k) => k.character);
  const vocabByKey = loadCrossLessonIndex<VocabularyEntry>(
    vocabDir,
    ownVocabPath,
    ownVocab,
    (v) => `${v.kanji ?? ""}|${v.kana}`,
  );
  const dirtyKanjiFiles = new Set<string>();
  const dirtyVocabFiles = new Set<string>();

  let newKanjiCount = 0;
  let newVocabCount = 0;
  let activeIdx = 0;
  let currentKanji: KanjiEntry | null = null;
  const unparsedLines: RawLine[] = [];
  // Points at the meanings array of whichever entry was most recently
  // created/touched, so a wrapped continuation line (no "word (reading) ="
  // prefix of its own — confirmed in Set 05: long meanings like "to empty,
  // to remove, to make space," wrap onto a bare second physical line) gets
  // appended there instead of being reported as unparsed.
  let lastMeaningsRef: LocalizedText[] | null = null;

  function mergeLessonAndSource(target: { lessonIds: string[]; source: SourceReference[] }, src: SourceReference) {
    if (!target.lessonIds.includes(lessonId)) target.lessonIds.push(lessonId);
    if (!target.source.some((s) => s.file === src.file && s.page === src.page && s.note === src.note)) {
      target.source.push(src);
    }
  }

  /** Emits (or merges into an existing) KanjiEntry for one active-kanji-list item, slide-deck-only. */
  function emitSlideOnlyKanji(active: ActiveKanjiEntry, contextWord?: string): KanjiEntry {
    const existing = kanjiByChar.byKey.get(active.character);
    if (existing) {
      mergeLessonAndSource(existing.entry, { file: activeKanjiFile, page: active.page });
      mergeMeaning(existing.entry, active.meaning);
      dirtyKanjiFiles.add(existing.file);
      return existing.entry;
    }
    const entry: KanjiEntry = {
      id: nextKanjiId(),
      character: active.character,
      meanings: [{ en: active.meaning }],
      lessonIds: [lessonId],
      origin: "course",
      source: [{ file: activeKanjiFile, page: active.page }],
      uncertainty: {
        level: "medium",
        reason: contextWord
          ? `No standalone reading is given in either source for this kanji; it is only ever taught inflected/in compounds (e.g. "${contextWord}"). Meaning is from the slide deck's "— Meaning —" page.`
          : `This kanji is listed in the slide deck's kanji-of-the-week pages but never appears (standalone or in a compound) in the synthesis doc's vocabulary list, so no reading or example word is available from course material for it yet.`,
      },
    };
    kanjiByChar.byKey.set(active.character, { entry, file: ownKanjiPath });
    ownKanji.push(entry);
    newKanjiCount += 1;
    return entry;
  }

  for (const line of contentLines) {
    if (isNoise(line.text)) continue;
    const match = ENTRY_PATTERN.exec(line.text);
    if (!match) {
      // A genuine wrapped continuation is bare prose with no "=" of its own;
      // a line that failed to match but still contains "=" is a distinct
      // entry with a shape the regex can't handle (e.g. nested parentheses
      // like "生(の) (なま(の)) = raw") and must NOT be silently glued onto
      // the previous entry's meaning — flag it instead.
      if (lastMeaningsRef && lastMeaningsRef[0]?.en && !line.text.includes("=")) {
        lastMeaningsRef[0].en = `${lastMeaningsRef[0].en} ${line.text}`;
      } else {
        unparsedLines.push(line);
      }
      continue;
    }
    const [, word, readingRaw, meaning] = match;
    const source: SourceReference = { file: synthesisFile, page: line.page };
    const readings = readingRaw.split(/[・、]/).map((r) => r.trim()).filter(Boolean);

    // Does this line introduce the next not-yet-reached active kanji (or one further ahead)?
    let matchedActiveIdx = -1;
    for (let j = activeIdx; j < activeList.length; j++) {
      if (word.includes(activeList[j].character)) {
        matchedActiveIdx = j;
        break;
      }
    }

    if (matchedActiveIdx !== -1) {
      // Emit slide-only placeholders for any active-kanji entries skipped entirely.
      for (let j = activeIdx; j < matchedActiveIdx; j++) {
        emitSlideOnlyKanji(activeList[j]);
      }
      const active = activeList[matchedActiveIdx];
      activeIdx = matchedActiveIdx + 1;

      if (word === active.character) {
        // Bare line: this IS the kanji entry, with a real reading from the synthesis doc.
        const existing = kanjiByChar.byKey.get(word);
        if (existing) {
          mergeLessonAndSource(existing.entry, source);
          mergeMeaning(existing.entry, meaning);
          dirtyKanjiFiles.add(existing.file);
          currentKanji = existing.entry;
          lastMeaningsRef = existing.entry.meanings;
        } else {
          const entry: KanjiEntry = {
            id: nextKanjiId(),
            character: word,
            meanings: [{ en: meaning }],
            readings,
            lessonIds: [lessonId],
            origin: "course",
            source: [source, { file: activeKanjiFile, page: active.page }],
          };
          ownKanji.push(entry);
          newKanjiCount += 1;
          kanjiByChar.byKey.set(word, { entry, file: ownKanjiPath });
          currentKanji = entry;
          lastMeaningsRef = entry.meanings;
        }
        continue;
      }

      // Compound-introduced kanji: create the kanji from slide data, then
      // fall through so this same line is ALSO recorded as a vocab entry.
      currentKanji = emitSlideOnlyKanji(active, word);
    }

    // Vocabulary line (either attached to the just-advanced kanji above, or to the current one).
    const kanaOnly = word === readingRaw.trim();
    if (!kanaOnly && currentKanji && !word.includes(currentKanji.character)) {
      console.warn(
        `  WARNING (${lessonId}): vocab "${word}" (p.${line.page}) does not contain current kanji ` +
          `"${currentKanji.character}" — check manually.`,
      );
    }
    const key = `${kanaOnly ? "" : word}|${readingRaw.trim()}`;
    const existingV = vocabByKey.byKey.get(key);
    if (existingV) {
      mergeLessonAndSource(existingV.entry, source);
      mergeMeaning(existingV.entry, meaning);
      dirtyVocabFiles.add(existingV.file);
      lastMeaningsRef = existingV.entry.meanings;
      continue;
    }

    const entry: VocabularyEntry = {
      id: nextVocabId(),
      kanji: kanaOnly ? undefined : word,
      kana: readingRaw.trim(),
      meanings: [{ en: meaning }],
      lessonIds: [lessonId],
      origin: "course",
      source: [source],
      ...(currentKanji ? { notes: `Example vocabulary for kanji ${currentKanji.character}.` } : {}),
    };
    if (currentKanji) {
      currentKanji.vocabularyIds = [...(currentKanji.vocabularyIds ?? []), entry.id];
    }
    ownVocab.push(entry);
    newVocabCount += 1;
    vocabByKey.byKey.set(key, { entry, file: ownVocabPath });
    lastMeaningsRef = entry.meanings;
  }

  // Any active-kanji entries never reached at all (not even via a compound).
  for (let j = activeIdx; j < activeList.length; j++) {
    emitSlideOnlyKanji(activeList[j]);
  }

  // Notes from the tail (assignments + bonus).
  const notes: NoteEntry[] = [];
  const bonusIdx = tailLines.findIndex((l) => l.text === "BONUS");
  const assignmentLines = (bonusIdx === -1 ? tailLines : tailLines.slice(0, bonusIdx)).filter(
    (l) => !isNoise(l.text) && l.text !== "Assignments are never mandatory but highly recommended. Do",
  );
  const meaningfulAssignments = assignmentLines.map((l) => l.text).filter((t) => t.length > 3 && !/^\d+$/.test(t));
  if (meaningfulAssignments.length > 0) {
    notes.push({
      id: `${lessonId}-note-assignments-kanji-set`,
      kind: "teacher-note",
      text: [{ en: meaningfulAssignments.join(" / ") }],
      lessonIds: [lessonId],
      origin: "course",
      source: [{ file: synthesisFile, note: "Assignments section" }],
    });
  }
  if (bonusIdx !== -1) {
    const bonusText = tailLines
      .slice(bonusIdx + 1)
      .map((l) => l.text)
      .filter((t) => t !== "BONUS")
      .join("\n");
    if (bonusText.trim()) {
      notes.push({
        id: `${lessonId}-note-bonus-kanji-set`,
        kind: "useful-link",
        text: [{ en: bonusText }],
        lessonIds: [lessonId],
        origin: "course",
        source: [{ file: synthesisFile, note: "Bonus section" }],
      });
    }
  }

  writeDirtyExternalFiles(kanjiByChar, dirtyKanjiFiles);
  writeDirtyExternalFiles(vocabByKey, dirtyVocabFiles);
  saveOwnArray(ownKanjiPath, ownKanji);
  saveOwnArray(ownVocabPath, ownVocab);
  if (notes.length > 0) writeJson(`src/data/notes/${lessonId}-kanji-set.json`, notes);

  console.log(
    `${lessonId}: ${activeList.length} kanji in slide deck -> ${newKanjiCount} new kanji entries, ` +
      `${newVocabCount} new vocab, ${notes.length} notes.`,
  );
  if (unparsedLines.length > 0) {
    console.warn(`  ${unparsedLines.length} unparsed line(s):`);
    for (const l of unparsedLines) console.warn(`    p.${l.page}: ${l.text}`);
  }
}

main();
