import { describe, expect, it } from "vitest";
import { applyAnswerOutcome, createItemStats, isDue } from "./index";

describe("applyAnswerOutcome", () => {
  it("advances the bucket and lowers difficulty on auto-correct", () => {
    const stats = createItemStats("k1");
    const updated = applyAnswerOutcome(stats, "auto-correct");
    expect(updated.bucket).toBe("learning");
    expect(updated.automaticCorrect).toBe(1);
    expect(updated.attempts).toBe(1);
  });

  it("drops the bucket and raises difficulty on wrong", () => {
    const stats = { ...createItemStats("k1"), bucket: "review" as const };
    const updated = applyAnswerOutcome(stats, "wrong");
    expect(updated.bucket).toBe("learning");
    expect(updated.wrong).toBe(1);
    expect(updated.difficultyScore).toBeGreaterThan(0);
  });

  it("schedules a sooner due date for wrong answers than for auto-correct", () => {
    const stats = { ...createItemStats("k1"), bucket: "review" as const };
    const now = new Date("2026-01-01T00:00:00Z");
    const wrong = applyAnswerOutcome(stats, "wrong", now);
    const correct = applyAnswerOutcome(stats, "auto-correct", now);
    expect(new Date(wrong.dueAt!).getTime()).toBeLessThan(new Date(correct.dueAt!).getTime());
  });
});

describe("isDue", () => {
  it("treats items with no dueAt as due", () => {
    expect(isDue(createItemStats("k1"))).toBe(true);
  });

  it("respects a future dueAt", () => {
    const future = new Date(Date.now() + 100000).toISOString();
    expect(isDue({ ...createItemStats("k1"), dueAt: future })).toBe(false);
  });
});
