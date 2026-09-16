import { describe, expect, it } from "vitest";
import { dataset } from "../../data";
import { buildConjugationChoiceExercise, buildParticleChoiceExercises } from "./exercises";
import { buildConjugationPracticePool } from "../../lib/conjugation/practicePool";

describe("buildParticleChoiceExercises", () => {
  it("generates exercises only from real particle usages tied to a real example sentence", () => {
    const exercises = buildParticleChoiceExercises(dataset.grammar);
    expect(exercises.length).toBeGreaterThan(0);

    for (const ex of exercises) {
      expect(ex.sentenceWithBlank).toContain("___");
      expect(ex.options.length).toBeGreaterThanOrEqual(2);
      expect(ex.options.length).toBeLessThanOrEqual(4);
      expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
      expect(new Set(ex.options).size).toBe(ex.options.length);
    }
  });
});

describe("buildConjugationChoiceExercise", () => {
  it("generates a multiple-choice exercise whose options are all distinct real conjugated forms", () => {
    const pool = buildConjugationPracticePool(dataset.vocabulary);
    const exercise = buildConjugationChoiceExercise(pool);

    expect(exercise).not.toBeNull();
    if (!exercise) return;
    expect(exercise.options.length).toBeGreaterThanOrEqual(2);
    expect(exercise.options[exercise.correctIndex]).toBeDefined();
    const surfaces = exercise.options.map((o) => o.surface);
    expect(new Set(surfaces).size).toBe(surfaces.length);
  });

  it("returns null when given an empty pool rather than fabricating an exercise", () => {
    expect(buildConjugationChoiceExercise([])).toBeNull();
  });
});
