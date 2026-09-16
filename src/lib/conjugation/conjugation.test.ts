import { describe, expect, it } from "vitest";
import { conjugate } from "./index";

/**
 * Every expected value here is copied verbatim from the transcribed course
 * rule it exercises (src/data/conjugation/class-0{1,2,3,4,6}.json), so a
 * regression here means the engine has drifted from what was actually
 * taught, not merely from "textbook Japanese."
 */
describe("conjugate: godan verbs", () => {
  const nomu = { kanji: "飲む", kana: "のむ", wordClass: "verb-godan" as const };

  it("dictionary/masu/masu-negative (class-01-conjugation-001/006/007)", () => {
    expect(conjugate(nomu, "dictionary")).toEqual({ surface: "飲む", reading: "のむ" });
    expect(conjugate(nomu, "masu")).toEqual({ surface: "飲みます", reading: "のみます" });
    expect(conjugate(nomu, "masu-negative")).toEqual({ surface: "飲みません", reading: "のみません" });
  });

  it("nai/nakatta (class-01-conjugation-005)", () => {
    expect(conjugate(nomu, "nai")).toEqual({ surface: "飲まない", reading: "のまない" });
    expect(conjugate(nomu, "nakatta")).toEqual({ surface: "飲まなかった", reading: "のまなかった" });
  });

  it("te/ta with む -> んで/んだ sound change (class-02-conjugation-002, class-04-conjugation-002)", () => {
    expect(conjugate(nomu, "te")).toEqual({ surface: "飲んで", reading: "のんで" });
    expect(conjugate(nomu, "ta")).toEqual({ surface: "飲んだ", reading: "のんだ" });
  });

  it("tai/imperative/volitional (class-03-conjugation-002, class-06)", () => {
    expect(conjugate(nomu, "tai")).toEqual({ surface: "飲みたい", reading: "のみたい" });
    expect(conjugate(nomu, "imperative")).toEqual({ surface: "飲め", reading: "のめ" });
    expect(conjugate(nomu, "imperative-negative")).toEqual({ surface: "飲むな", reading: "のむな" });
    expect(conjugate(nomu, "imperative-te")).toEqual({ surface: "飲んでください", reading: "のんでください" });
    expect(conjugate(nomu, "imperative-negative-polite")).toEqual({ surface: "飲まないでください", reading: "のまないでください" });
    expect(conjugate(nomu, "volitional-casual")).toEqual({ surface: "飲もう", reading: "のもう" });
    expect(conjugate(nomu, "volitional-polite")).toEqual({ surface: "飲みましょう", reading: "のみましょう" });
  });

  it("す ending te/ta -> して/した (話す, class-02-conjugation-002)", () => {
    const hanasu = { kanji: "話す", kana: "はなす", wordClass: "verb-godan" as const };
    expect(conjugate(hanasu, "te")).toEqual({ surface: "話して", reading: "はなして" });
    expect(conjugate(hanasu, "ta")).toEqual({ surface: "話した", reading: "はなした" });
  });

  it("く ending te/ta -> いて/いた (聞く, class-02-conjugation-002)", () => {
    const kiku = { kanji: "聞く", kana: "きく", wordClass: "verb-godan" as const };
    expect(conjugate(kiku, "te")).toEqual({ surface: "聞いて", reading: "きいて" });
    expect(conjugate(kiku, "ta")).toEqual({ surface: "聞いた", reading: "きいた" });
  });

  it("ぐ ending te/ta -> いで/いだ (泳ぐ, class-02-conjugation-002)", () => {
    const oyogu = { kanji: "泳ぐ", kana: "およぐ", wordClass: "verb-godan" as const };
    expect(conjugate(oyogu, "te")).toEqual({ surface: "泳いで", reading: "およいで" });
    expect(conjugate(oyogu, "ta")).toEqual({ surface: "泳いだ", reading: "およいだ" });
  });

  it("ぬ/ぶ ending te/ta -> んで/んだ (死ぬ, 遊ぶ, class-02-conjugation-002)", () => {
    const shinu = { kanji: "死ぬ", kana: "しぬ", wordClass: "verb-godan" as const };
    const asobu = { kanji: "遊ぶ", kana: "あそぶ", wordClass: "verb-godan" as const };
    expect(conjugate(shinu, "te")).toEqual({ surface: "死んで", reading: "しんで" });
    expect(conjugate(asobu, "ta")).toEqual({ surface: "遊んだ", reading: "あそんだ" });
  });

  it("う/つ/る ending te/ta -> って/った (言う, 待つ, 知る, class-02-conjugation-002)", () => {
    expect(conjugate({ kanji: "言う", kana: "いう", wordClass: "verb-godan" }, "te")).toEqual({ surface: "言って", reading: "いって" });
    expect(conjugate({ kanji: "待つ", kana: "まつ", wordClass: "verb-godan" }, "te")).toEqual({ surface: "待って", reading: "まって" });
    expect(conjugate({ kanji: "知る", kana: "しる", wordClass: "verb-godan" }, "te")).toEqual({ surface: "知って", reading: "しって" });
  });

  it("行く is an exception to the く->いて/いた te/ta pattern (class-02-conjugation-003, class-04)", () => {
    const iku = { kanji: "行く", kana: "いく", wordClass: "verb-godan" as const };
    expect(conjugate(iku, "te")).toEqual({ surface: "行って", reading: "いって" });
    expect(conjugate(iku, "ta")).toEqual({ surface: "行った", reading: "いった" });
    // Its stems are otherwise perfectly regular.
    expect(conjugate(iku, "masu")).toEqual({ surface: "行きます", reading: "いきます" });
    expect(conjugate(iku, "nai")).toEqual({ surface: "行かない", reading: "いかない" });
  });
});

describe("conjugate: ichidan verbs", () => {
  const taberu = { kanji: "食べる", kana: "たべる", wordClass: "verb-ichidan" as const };

  it("masu/nai/te/ta (class-01/02/04)", () => {
    expect(conjugate(taberu, "masu")).toEqual({ surface: "食べます", reading: "たべます" });
    expect(conjugate(taberu, "nai")).toEqual({ surface: "食べない", reading: "たべない" });
    expect(conjugate(taberu, "te")).toEqual({ surface: "食べて", reading: "たべて" });
    expect(conjugate(taberu, "ta")).toEqual({ surface: "食べた", reading: "たべた" });
    expect(conjugate(taberu, "nakatta")).toEqual({ surface: "食べなかった", reading: "たべなかった" });
    expect(conjugate(taberu, "masu-past-negative")).toEqual({ surface: "食べませんでした", reading: "たべませんでした" });
  });

  it("imperative/volitional (class-06)", () => {
    expect(conjugate(taberu, "imperative")).toEqual({ surface: "食べろ", reading: "たべろ" });
    expect(conjugate(taberu, "volitional-casual")).toEqual({ surface: "食べよう", reading: "たべよう" });
  });

  it("見る and 寝る (class-01/02/04)", () => {
    expect(conjugate({ kanji: "見る", kana: "みる", wordClass: "verb-ichidan" }, "nai")).toEqual({ surface: "見ない", reading: "みない" });
    expect(conjugate({ kanji: "寝る", kana: "ねる", wordClass: "verb-ichidan" }, "te")).toEqual({ surface: "寝て", reading: "ねて" });
  });
});

describe("conjugate: irregular verbs", () => {
  it("だ (class-01-conjugation-003/005/006/007, class-02-conjugation-003)", () => {
    const da = { kana: "だ", wordClass: "verb-irregular" as const };
    expect(conjugate(da, "nai")).toEqual({ surface: "じゃない" });
    expect(conjugate(da, "masu")).toEqual({ surface: "です" });
    expect(conjugate(da, "masu-negative")).toEqual({ surface: "ではありません" });
    expect(conjugate(da, "te")).toEqual({ surface: "だって" });
    expect(conjugate(da, "ta")).toEqual({ surface: "だった" });
    expect(conjugate(da, "nakatta")).toEqual({ surface: "じゃなかった" });
  });

  it("ある (class-01-conjugation-005)", () => {
    expect(conjugate({ kana: "ある", wordClass: "verb-irregular" }, "nai")).toEqual({ surface: "ない" });
  });

  it("来る (class-01/02/04/06/08)", () => {
    const kuru = { kana: "くる", wordClass: "verb-irregular" as const };
    expect(conjugate(kuru, "nai")).toEqual({ surface: "来ない", reading: "こない" });
    expect(conjugate(kuru, "masu")).toEqual({ surface: "来ます", reading: "きます" });
    expect(conjugate(kuru, "te")).toEqual({ surface: "来て", reading: "きて" });
    expect(conjugate(kuru, "ta")).toEqual({ surface: "来た", reading: "きた" });
    expect(conjugate(kuru, "imperative")).toEqual({ surface: "来い", reading: "こい" });
    expect(conjugate(kuru, "volitional-casual")).toEqual({ surface: "来よう", reading: "こよう" });
  });

  it("する (class-01/02/04/06)", () => {
    const suru = { kana: "する", wordClass: "verb-irregular" as const };
    expect(conjugate(suru, "nai")).toEqual({ surface: "しない" });
    expect(conjugate(suru, "masu")).toEqual({ surface: "します" });
    expect(conjugate(suru, "imperative")).toEqual({ surface: "しろ" });
    expect(conjugate(suru, "volitional-casual")).toEqual({ surface: "しよう" });
  });

  it("[noun]+する compounds conjugate like する with the noun carried through (散歩する, class-01-conjugation-003 explanation)", () => {
    const sanposuru = { kanji: "散歩する", kana: "さんぽする", wordClass: "verb-irregular" as const };
    expect(conjugate(sanposuru, "masu")).toEqual({ surface: "散歩します", reading: "さんぽします" });
    expect(conjugate(sanposuru, "nai")).toEqual({ surface: "散歩しない", reading: "さんぽしない" });
    expect(conjugate(sanposuru, "ta")).toEqual({ surface: "散歩した", reading: "さんぽした" });

    const benkyousuru = { kana: "べんきょうする", wordClass: "verb-irregular" as const };
    expect(conjugate(benkyousuru, "masu")).toEqual({ surface: "べんきょうします" });
  });
});

describe("conjugate: adjectives", () => {
  it("i-adjective 大きい (class-03-conjugation-001)", () => {
    const ookii = { kanji: "大きい", kana: "おおきい", wordClass: "i-adjective" as const };
    expect(conjugate(ookii, "i-adjective-negative")).toEqual({ surface: "大きくない", reading: "おおきくない" });
    expect(conjugate(ookii, "i-adjective-past")).toEqual({ surface: "大きかった", reading: "おおきかった" });
    expect(conjugate(ookii, "i-adjective-past-negative")).toEqual({ surface: "大きくなかった", reading: "おおきくなかった" });
  });

  it("na-adjective 緑, given as the bare stem (class-04-conjugation-007)", () => {
    const midori = { kanji: "緑", kana: "みどり", wordClass: "na-adjective" as const };
    expect(conjugate(midori, "dictionary")).toEqual({ surface: "緑だ", reading: "みどりだ" });
    expect(conjugate(midori, "na-adjective-negative")).toEqual({ surface: "緑じゃない", reading: "みどりじゃない" });
    expect(conjugate(midori, "na-adjective-past")).toEqual({ surface: "緑だった", reading: "みどりだった" });
    expect(conjugate(midori, "na-adjective-past-negative")).toEqual({ surface: "緑じゃなかった", reading: "みどりじゃなかった" });
  });
});

describe("conjugate: unsupported combinations", () => {
  it("returns null rather than guessing", () => {
    expect(conjugate({ kanji: "飲む", kana: "のむ", wordClass: "verb-godan" }, "i-adjective-negative")).toBeNull();
    expect(conjugate({ kanji: "大きい", kana: "おおきい", wordClass: "i-adjective" }, "te")).toBeNull();
  });
});
