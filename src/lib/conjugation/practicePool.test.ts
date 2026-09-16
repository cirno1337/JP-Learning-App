import { describe, expect, it } from "vitest";
import { buildConjugationPracticePool } from "./practicePool";
import { conjugate } from "./index";
import type { VocabularyEntry } from "../../data/types";

function vocab(partial: Partial<VocabularyEntry> & { id: string; kana: string }): VocabularyEntry {
  return {
    meanings: [{ en: "test" }],
    lessonIds: [],
    origin: "course",
    source: [{ file: "test.pdf" }],
    ...partial,
  };
}

describe("buildConjugationPracticePool", () => {
  it("includes only cleanly-tagged, single-word entries", () => {
    const pool = buildConjugationPracticePool([
      vocab({ id: "v1", kanji: "話す", kana: "はなす", partOfSpeech: ["verb-godan"] }),
      vocab({ id: "v2", kana: "つくえ", partOfSpeech: ["noun"] }),
      vocab({ id: "v3", kanji: "良い・いい", kana: "よい / いい", partOfSpeech: ["i-adjective"] }),
    ]);
    expect(pool.map((p) => p.id)).toEqual(["v1"]);
  });

  it("strips a pre-noun な from na-adjective entries so the engine gets the bare stem", () => {
    const pool = buildConjugationPracticePool([vocab({ id: "v4", kanji: "きれいな", kana: "きれいな", partOfSpeech: ["na-adjective"] })]);
    expect(pool[0]).toMatchObject({ kanji: "きれい", kana: "きれい" });
    expect(conjugate(pool[0], "dictionary")).toEqual({ surface: "きれいだ" });
  });

  it("leaves bare na-adjective stems (no trailing な) untouched", () => {
    const pool = buildConjugationPracticePool([vocab({ id: "v5", kanji: "静か", kana: "しずか", partOfSpeech: ["na-adjective"] })]);
    expect(pool[0]).toMatchObject({ kanji: "静か", kana: "しずか" });
  });

  it("still conjugates correctly even when the source data mis-tags an irregular verb as godan", () => {
    // ある is genuinely irregular but one extracted entry tags it verb-godan;
    // the engine's irregular-lemma lookup must win regardless of the tag.
    const pool = buildConjugationPracticePool([vocab({ id: "v6", kanji: "有る", kana: "ある", partOfSpeech: ["verb-godan"] })]);
    expect(conjugate(pool[0], "nai")).toEqual({ surface: "ない" });
  });
});
