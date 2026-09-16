import { describe, expect, it } from "vitest";
import { dataset } from "../../data";
import { searchDataset } from "./index";

describe("searchDataset", () => {
  it("finds a vocabulary entry by its English meaning", () => {
    const results = searchDataset(dataset, "to eat");
    expect(results.some((r) => r.category === "vocabulary" && r.primary.includes("食べる"))).toBe(true);
  });

  it("finds a kanji by its literal character", () => {
    const results = searchDataset(dataset, "食");
    expect(results.some((r) => r.category === "kanji" && r.primary === "食")).toBe(true);
  });

  it("finds a kana by romaji", () => {
    const results = searchDataset(dataset, "ka");
    expect(results.some((r) => r.category === "kana")).toBe(true);
  });

  it("finds a lesson by title", () => {
    const results = searchDataset(dataset, "class n°01");
    expect(results.some((r) => r.category === "lesson" && r.id === "class-01")).toBe(true);
  });

  it("is case-insensitive for latin text", () => {
    const lower = searchDataset(dataset, "school");
    const upper = searchDataset(dataset, "SCHOOL");
    expect(upper.length).toBe(lower.length);
    expect(lower.length).toBeGreaterThan(0);
  });

  it("returns nothing for an empty query", () => {
    expect(searchDataset(dataset, "")).toEqual([]);
    expect(searchDataset(dataset, "   ")).toEqual([]);
  });

  it("returns nothing for a query with no matches", () => {
    expect(searchDataset(dataset, "zzzznonexistentquery")).toEqual([]);
  });
});
