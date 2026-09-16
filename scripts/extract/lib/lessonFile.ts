import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { writeJson } from "./dataFiles";

/**
 * Safe read/write helpers for the per-lesson JSON array files that MULTIPLE
 * extraction scripts write into for the same lessonId (e.g. both
 * parseKanjiSet.ts and parseClassSynthesis.ts append to
 * src/data/vocabulary/<lessonId>.json), and for updating an entry that
 * lives in ANOTHER lesson's file (cross-lesson vocabulary/kanji reuse).
 *
 * Three bugs this exists to prevent, all hit in practice while building the
 * pipeline (see docs/extraction-log.md and this file's git history):
 *
 * 1. Writing `newItemsThisRun` unconditionally to the lesson's own path
 *    silently wipes out anything already there whenever this run's items
 *    don't happen to collide with existing ones (there is nothing to merge
 *    onto, so a plain overwrite loses the old content entirely).
 * 2. Two scripts each keeping their own "next sequence number" counter
 *    starting at 1 produces colliding ids (both scripts independently
 *    minting "<lessonId>-vocab-001") when they write to the same file.
 * 3. Reading an external (other-lesson) file TWICE independently — once to
 *    build the cross-lesson lookup map, once to decide "this file needs
 *    saving" — produces two unrelated copies of the same array. Mutating
 *    the entry found via the lookup map (e.g. to merge in a new meaning)
 *    then has no effect on the separate copy that actually gets saved, so
 *    the merge silently vanishes. The fix is to read each external file
 *    exactly once and share that same array between the lookup map and
 *    whatever eventually gets saved.
 */

export function loadOwnArray<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8"));
}

export function saveOwnArray<T>(path: string, items: T[]): void {
  writeJson(path, items);
}

/** Returns a fresh `<idPrefix>NNN` id, numbered above any existing id with that exact prefix in `items`. */
export function makeIdSequencer<T extends { id: string }>(items: T[], idPrefix: string) {
  let max = 0;
  const re = new RegExp(`^${idPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\d+)$`);
  for (const item of items) {
    const m = re.exec(item.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  let next = max;
  return () => {
    next += 1;
    return `${idPrefix}${String(next).padStart(3, "0")}`;
  };
}

export interface CrossLessonIndex<T> {
  /** Lookup by content key -> the live entry object plus which file it came from. */
  byKey: Map<string, { entry: T; file: string }>;
  /** Each external file's array, read exactly once — mutate entries in place, then pass the touched file paths to writeDirtyExternalFiles. */
  fileArrays: Map<string, T[]>;
}

/**
 * Loads every entry across all files in `dir` (for cross-lesson dedup
 * lookups), keyed by `keyOf`. Entries from `ownPath` are backed by the
 * `ownItems` array passed in (not a fresh read) so mutations to them are
 * automatically reflected when the caller later saves `ownItems` directly.
 * Entries from every OTHER file are backed by that file's one-and-only
 * in-memory array, held in `fileArrays` — mutate them in place and save via
 * writeDirtyExternalFiles, never by re-reading the file again.
 */
export function loadCrossLessonIndex<T>(
  dir: string,
  ownPath: string,
  ownItems: T[],
  keyOf: (t: T) => string,
): CrossLessonIndex<T> {
  const byKey = new Map<string, { entry: T; file: string }>();
  const fileArrays = new Map<string, T[]>();
  for (const entry of ownItems) byKey.set(keyOf(entry), { entry, file: ownPath });
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const file = join(dir, name);
      if (file === ownPath) continue;
      const entries: T[] = JSON.parse(readFileSync(file, "utf8"));
      fileArrays.set(file, entries);
      for (const entry of entries) byKey.set(keyOf(entry), { entry, file });
    }
  }
  return { byKey, fileArrays };
}

/** Saves every file in `dirtyFiles` using the exact array object loaded for it in `index.fileArrays`. */
export function writeDirtyExternalFiles<T>(index: CrossLessonIndex<T>, dirtyFiles: Set<string>): void {
  for (const file of dirtyFiles) {
    const arr = index.fileArrays.get(file);
    if (arr) writeJson(file, arr);
  }
}

/**
 * Merging a re-encountered word/kanji from a different lesson into its
 * existing canonical entry must not silently drop a genuinely different
 * meaning nuance taught this time (e.g. 上げる is taught in one kanji set as
 * "to raise" and, separately, in a later class as an ichidan verb meaning
 * "to give" — both are correct, real meanings of the same word). Appends
 * only if no existing meaning already has the same text.
 */
export function mergeMeaning(target: { meanings: { en?: string; pl?: string }[] }, meaning: string): void {
  if (!target.meanings.some((m) => m.en === meaning)) {
    target.meanings.push({ en: meaning });
  }
}

interface MergeableVocab {
  id: string;
  kanji?: string;
  kana: string;
  meanings: { en?: string; pl?: string }[];
  lessonIds: string[];
  source: { file: string; page?: number; note?: string }[];
}

/**
 * Adds a vocabulary word, but first checks the cross-lesson index for an
 * existing entry with the same (kanji, kana) — if found, merges lessonId/
 * source/meaning onto it (marking its file dirty) instead of minting a
 * duplicate. Manual grammar-authoring scripts must use this (not push a
 * fresh object directly) for exactly the same reason parseKanjiSet.ts and
 * parseClassSynthesis.ts do: the same word taught standalone in one lesson
 * often reappears as an example word in a completely different, later
 * lesson's grammar section, and creating a second entry for it would
 * violate "canonical item + lesson associations" (see docs, spec section 41)
 * and desync from whichever entry the app actually displays.
 */
export function addOrMergeVocab<T extends MergeableVocab>(
  index: CrossLessonIndex<T>,
  dirtyFiles: Set<string>,
  own: T[],
  ownPath: string,
  makeEntry: () => T,
): T {
  const draft = makeEntry();
  const key = `${draft.kanji ?? ""}|${draft.kana}`;
  const existing = index.byKey.get(key);
  if (existing) {
    const lessonId = draft.lessonIds[0];
    if (!existing.entry.lessonIds.includes(lessonId)) existing.entry.lessonIds.push(lessonId);
    const src = draft.source[0];
    if (!existing.entry.source.some((s) => s.file === src.file && s.page === src.page)) {
      existing.entry.source.push(src);
    }
    for (const m of draft.meanings) if (m.en) mergeMeaning(existing.entry, m.en);
    dirtyFiles.add(existing.file);
    return existing.entry;
  }
  own.push(draft);
  index.byKey.set(key, { entry: draft, file: ownPath });
  return draft;
}
