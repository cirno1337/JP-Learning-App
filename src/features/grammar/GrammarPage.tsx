import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { buildConjugationChoiceExercise, buildParticleChoiceExercises, type GrammarExercise } from "./exercises";
import { buildConjugationPracticePool } from "../../lib/conjugation/practicePool";
import { FORM_LABELS } from "../../lib/conjugation";
import "../kanji/kanji.css";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function GrammarPage() {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState<"browse" | "practice">("browse");
  const [lessonFilter, setLessonFilter] = useState("all");

  const filtered = useMemo(
    () => dataset.grammar.filter((g) => lessonFilter === "all" || g.lessonIds.includes(lessonFilter)),
    [lessonFilter],
  );

  const lessonsWithGrammar = useMemo(
    () => dataset.lessons.filter((l) => dataset.grammar.some((g) => g.lessonIds.includes(l.id))),
    [],
  );

  const exerciseCount = useMemo(() => {
    const particleCount = buildParticleChoiceExercises(dataset.grammar).length;
    const conjugationPool = buildConjugationPracticePool(dataset.vocabulary);
    return particleCount + conjugationPool.length;
  }, []);

  if (dataset.grammar.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.grammar")} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.grammar")} description={`${filtered.length} / ${dataset.grammar.length} patterns`} />

      <div className="kanji-filters">
        <label>
          Mode:{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value as "browse" | "practice")}>
            <option value="browse">Browse</option>
            <option value="practice">Practice ({exerciseCount} possible)</option>
          </select>
        </label>
        {mode === "browse" && (
          <label>
            {t("common.lesson")}:{" "}
            <select value={lessonFilter} onChange={(e) => setLessonFilter(e.target.value)}>
              <option value="all">{t("common.all")}</option>
              {lessonsWithGrammar.map((l) => (
                <option key={l.id} value={l.id}>
                  {localizedText(l.title, language)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {mode === "practice" && <GrammarExercises />}

      {mode === "browse" &&
        filtered.map((g) => (
        <section key={g.id} className="card" style={{ marginBottom: "var(--space-4)" }}>
          <h2 className="jp-text" style={{ fontSize: "1.2rem", marginTop: 0 }}>
            {g.pattern}
          </h2>
          <p>{localizedText(g.explanation, language)}</p>

          {g.particles && g.particles.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "var(--space-3)" }}>
              <tbody>
                {g.particles.map((p, i) => {
                  const ex = g.examples.find((e) => e.id === p.exampleSentenceId);
                  return (
                    <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                      <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", fontWeight: 600 }}>
                        {p.particle}
                      </td>
                      <td style={{ padding: "var(--space-1) var(--space-2)" }}>{localizedText(p.meaning, language)}</td>
                      {ex && (
                        <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                          {ex.japanese}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {g.examples.length > 0 && (
            <details>
              <summary style={{ cursor: "pointer", color: "var(--color-text-muted)" }}>
                {g.examples.length} example{g.examples.length === 1 ? "" : "s"}
              </summary>
              <ul>
                {g.examples.map((ex) => (
                  <li key={ex.id} className="jp-text" style={{ marginBottom: "var(--space-2)" }}>
                    {ex.japanese}
                    {ex.reading && <span style={{ color: "var(--color-text-muted)" }}> ({ex.reading})</span>}
                    <br />
                    <span style={{ fontFamily: "var(--font-ui)" }}>{localizedText(ex.meanings, language)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="kanji-card__source" style={{ marginTop: "var(--space-3)" }}>
            {t("common.source")}: {g.source.map((s) => s.file + (s.page ? ` p.${s.page}` : "")).join("; ")}
          </p>
        </section>
      ))}
    </div>
  );
}

function buildExerciseQueue(count: number): GrammarExercise[] {
  const particleExercises = shuffle(buildParticleChoiceExercises(dataset.grammar));
  const pool = buildConjugationPracticePool(dataset.vocabulary);

  const queue: GrammarExercise[] = [];
  const seenIds = new Set<string>();
  let particleIdx = 0;
  let guard = 0;

  while (queue.length < count && guard < count * 20) {
    guard++;
    const wantConjugation = queue.length % 2 === 0;
    if (wantConjugation && pool.length > 0) {
      const ex = buildConjugationChoiceExercise(pool);
      if (ex && !seenIds.has(ex.id)) {
        seenIds.add(ex.id);
        queue.push(ex);
        continue;
      }
    }
    if (particleIdx < particleExercises.length) {
      const ex = particleExercises[particleIdx++];
      if (!seenIds.has(ex.id)) {
        seenIds.add(ex.id);
        queue.push(ex);
      }
      continue;
    }
    if (pool.length === 0) break;
  }

  return queue;
}

function GrammarExercises() {
  const { t } = useTranslation();
  const { recordAttempt } = useProgress();
  const [phase, setPhase] = useState<"config" | "question" | "result" | "summary">("config");
  const [queue, setQueue] = useState<GrammarExercise[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  function start() {
    const generated = buildExerciseQueue(15);
    setQueue(generated);
    setQIndex(0);
    setSelected(null);
    setResults([]);
    setPhase(generated.length > 0 ? "question" : "summary");
  }

  const current = queue[qIndex];

  function choose(index: number) {
    if (!current) return;
    const isCorrect = index === current.correctIndex;
    recordAttempt({ itemId: current.id, category: "grammar", outcome: isCorrect ? "auto-correct" : "wrong" });
    setSelected(index);
    setResults((r) => [...r, isCorrect]);
    setPhase("result");
  }

  function next() {
    if (qIndex + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setPhase("question");
  }

  const latest = useRef({ phase, next });
  latest.current = { phase, next };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (latest.current.phase === "result" && e.key === "Enter") latest.current.next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (phase === "config") {
    return (
      <div className="card">
        <p style={{ marginTop: 0 }}>
          Multiple-choice practice generated from real particles and vocabulary taught in the course: particle
          selection (fill the blank in a real example sentence) and conjugation choice (pick the correct form of a
          real word, using the conjugation rules from the Conjugation/Forms section).
        </p>
        <button type="button" className="btn btn--primary" onClick={start}>
          {t("common.startTest")}
        </button>
      </div>
    );
  }

  if (phase === "summary") {
    const correct = results.filter(Boolean).length;
    return (
      <div className="card test-summary">
        {queue.length === 0 ? (
          <p>Not enough source material to generate exercises yet.</p>
        ) : (
          <p>
            {correct} / {results.length} correct
          </p>
        )}
        <button type="button" className="btn btn--primary" onClick={() => setPhase("config")}>
          {t("common.startTest")}
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="card test-question">
      <p style={{ color: "var(--color-text-muted)" }}>
        {qIndex + 1} / {queue.length}
      </p>

      {current.kind === "particle-choice" ? (
        <>
          <div className="jp-text" style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>
            {current.sentenceWithBlank}
          </div>
          {current.reading && <div className="jp-text test-question__reading">{current.reading}</div>}
          <p style={{ color: "var(--color-text-muted)" }}>Which particle means: {current.meaningHint}?</p>
        </>
      ) : (
        <>
          <div className="jp-text test-question__prompt">{current.promptSurface}</div>
          {current.promptReading && <div className="jp-text test-question__reading">{current.promptReading}</div>}
          <p style={{ color: "var(--color-text-muted)" }}>
            {current.promptMeaning} — what is the {FORM_LABELS[current.targetForm] ?? current.targetForm}?
          </p>
        </>
      )}

      <div style={{ display: "grid", gap: "var(--space-2)", maxWidth: 320, margin: "0 auto" }}>
        {current.options.map((option, i) => {
          const label = typeof option === "string" ? option : option.surface;
          const reading = typeof option === "string" ? undefined : option.reading;
          const isChosen = selected === i;
          const isCorrectOption = phase === "result" && i === current.correctIndex;
          const isWrongChoice = phase === "result" && isChosen && i !== current.correctIndex;
          return (
            <button
              key={i}
              type="button"
              className="btn jp-text"
              disabled={phase === "result"}
              onClick={() => choose(i)}
              style={{
                borderColor: isCorrectOption ? "var(--color-success)" : isWrongChoice ? "var(--color-danger)" : undefined,
              }}
            >
              {label}
              {reading && <span style={{ color: "var(--color-text-muted)" }}> ({reading})</span>}
            </button>
          );
        })}
      </div>

      {phase === "result" && (
        <div className="test-question__actions">
          <button type="button" className="btn btn--primary" onClick={next}>
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
