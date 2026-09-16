import type { ConjugationForm, GrammarEntry, SourceReference } from "../../data/types";
import { conjugate, SUPPORTED_FORMS_BY_CLASS, type ConjugatedForm } from "../../lib/conjugation";
import type { ConjugationPracticeItem } from "../../lib/conjugation/practicePool";

/**
 * Interactive grammar exercises (spec section 15), generated live from real
 * course data rather than stored as static content. Both exercise types are
 * built exclusively from verified source material: particle-choice reuses
 * an actual example sentence and the particles taught alongside it in the
 * same lesson; conjugation-choice reuses real vocabulary plus the tested
 * conjugation engine. No Japanese text is invented — see spec section 43/45.
 */

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface ParticleChoiceExercise {
  kind: "particle-choice";
  id: string;
  sentenceWithBlank: string;
  reading?: string;
  meaningHint: string;
  options: string[];
  correctIndex: number;
  source: SourceReference[];
}

export function buildParticleChoiceExercises(grammar: GrammarEntry[]): ParticleChoiceExercise[] {
  const exercises: ParticleChoiceExercise[] = [];

  for (const entry of grammar) {
    const particles = entry.particles ?? [];
    if (particles.length < 2) continue;

    for (let i = 0; i < particles.length; i++) {
      const usage = particles[i];
      if (!usage.exampleSentenceId) continue;
      const example = entry.examples.find((e) => e.id === usage.exampleSentenceId);
      if (!example) continue;
      const blankAt = example.japanese.indexOf(usage.particle);
      if (blankAt === -1) continue;

      const distractors = particles
        .filter((p, idx) => idx !== i && p.particle !== usage.particle)
        .map((p) => p.particle)
        .filter((p, idx, arr) => arr.indexOf(p) === idx)
        .slice(0, 3);
      if (distractors.length === 0) continue;

      const options = shuffle([usage.particle, ...distractors]);
      exercises.push({
        kind: "particle-choice",
        id: `${entry.id}-particle-${i}`,
        sentenceWithBlank: example.japanese.slice(0, blankAt) + "___" + example.japanese.slice(blankAt + usage.particle.length),
        reading: example.reading,
        meaningHint: usage.meaning.map((m) => m.en ?? m.pl ?? "").join(" / "),
        options,
        correctIndex: options.indexOf(usage.particle),
        source: example.source,
      });
    }
  }

  return exercises;
}

export interface ConjugationChoiceExercise {
  kind: "conjugation-choice";
  id: string;
  promptSurface: string;
  promptReading?: string;
  promptMeaning: string;
  targetForm: ConjugationForm;
  options: ConjugatedForm[];
  correctIndex: number;
  source: SourceReference[];
}

const DISTRACTOR_POOL_SIZE = 6;

export function buildConjugationChoiceExercise(pool: ConjugationPracticeItem[]): ConjugationChoiceExercise | null {
  const shuffledPool = shuffle(pool);

  for (const item of shuffledPool) {
    const candidateForms = SUPPORTED_FORMS_BY_CLASS[item.wordClass].filter(
      (f): f is ConjugationForm => f !== "dictionary" && conjugate(item, f) !== null,
    );
    if (candidateForms.length === 0) continue;

    const targetForm = candidateForms[Math.floor(Math.random() * candidateForms.length)];
    const correct = conjugate(item, targetForm);
    if (!correct) continue;

    const otherForms = shuffle(candidateForms.filter((f) => f !== targetForm)).slice(0, DISTRACTOR_POOL_SIZE);
    const distractors: ConjugatedForm[] = [];
    for (const f of otherForms) {
      const output = conjugate(item, f);
      if (output && output.surface !== correct.surface && !distractors.some((d) => d.surface === output.surface)) {
        distractors.push(output);
      }
      if (distractors.length === 3) break;
    }
    if (distractors.length === 0) continue;

    const options = shuffle([correct, ...distractors]);
    return {
      kind: "conjugation-choice",
      id: `${item.id}-${targetForm}`,
      promptSurface: item.kanji ?? item.kana,
      promptReading: item.kanji ? item.kana : undefined,
      promptMeaning: item.meanings.map((m) => m.en ?? m.pl ?? "").join(" / "),
      targetForm,
      options,
      correctIndex: options.findIndex((o) => o.surface === correct.surface),
      source: item.source,
    };
  }

  return null;
}

export type GrammarExercise = ParticleChoiceExercise | ConjugationChoiceExercise;
