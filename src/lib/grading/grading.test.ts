import { describe, expect, it } from "vitest";
import { checkAnswer, normalizeEnglish, normalizeJapanese } from "./index";

describe("normalizeEnglish", () => {
  it("trims, lowercases and collapses whitespace", () => {
    expect(normalizeEnglish("  To Eat  ")).toBe("to eat");
    expect(normalizeEnglish("to   eat")).toBe("to eat");
  });

  it("strips harmless punctuation", () => {
    expect(normalizeEnglish("to eat.")).toBe("to eat");
    expect(normalizeEnglish("hello!")).toBe("hello");
  });

  it("does not merge unrelated words", () => {
    expect(normalizeEnglish("eat")).not.toBe(normalizeEnglish("drink"));
  });
});

describe("normalizeJapanese", () => {
  it("trims whitespace and strips punctuation", () => {
    expect(normalizeJapanese(" 食べる。")).toBe("食べる");
  });

  it("does not convert kana to kanji or vice versa", () => {
    expect(normalizeJapanese("食べる")).not.toBe(normalizeJapanese("たべる"));
  });
});

describe("checkAnswer", () => {
  it("accepts any listed English meaning", () => {
    expect(checkAnswer("eat", ["to eat", "eat"], "english")).toBe(true);
    expect(checkAnswer("to eat", ["to eat", "eat"], "english")).toBe(true);
    expect(checkAnswer("drink", ["to eat", "eat"], "english")).toBe(false);
  });

  it("accepts any listed Japanese form explicitly", () => {
    expect(checkAnswer("食べる", ["食べる", "たべる"], "japanese")).toBe(true);
    expect(checkAnswer("たべる", ["食べる", "たべる"], "japanese")).toBe(true);
    expect(checkAnswer("のむ", ["食べる", "たべる"], "japanese")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(checkAnswer("", ["eat"], "english")).toBe(false);
    expect(checkAnswer("   ", ["eat"], "english")).toBe(false);
  });
});
