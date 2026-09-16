import { describe, expect, it } from "vitest";
import { meaningsToAcceptedAnswers } from "./acceptedAnswers";

describe("meaningsToAcceptedAnswers", () => {
  it("splits a comma-separated gloss into individual accepted answers", () => {
    expect(meaningsToAcceptedAnswers([{ en: "human being, person" }], "en")).toEqual([
      "human being",
      "person",
    ]);
  });

  it("merges multiple meaning entries", () => {
    expect(
      meaningsToAcceptedAnswers([{ en: "day, sun" }, { en: "Japan" }], "en"),
    ).toEqual(["day", "sun", "Japan"]);
  });

  it("falls back to English when Polish is missing", () => {
    expect(meaningsToAcceptedAnswers([{ en: "one" }], "pl")).toEqual(["one"]);
  });
});
