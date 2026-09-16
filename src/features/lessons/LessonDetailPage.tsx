import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset, findLesson } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { checkAnswer } from "../../lib/grading";
import { meaningsToAcceptedAnswers } from "../../lib/testing/acceptedAnswers";
import type { AnswerOutcome } from "../../lib/storage/types";
import "../kanji/kanji.css";

interface TestItem {
  id: string;
  category: string;
  prompt: string;
  promptReading?: string;
  accepted: string[];
  answerDisplay: string;
  kind: "english" | "japanese";
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t, language } = useTranslation();
  const { recordAttempt } = useProgress();
  const lesson = lessonId ? findLesson(lessonId) : undefined;

  const kanjiById = useMemo(() => new Map(dataset.kanji.map((k) => [k.id, k])), []);
  const vocabById = useMemo(() => new Map(dataset.vocabulary.map((v) => [v.id, v])), []);
  const grammarById = useMemo(() => new Map(dataset.grammar.map((g) => [g.id, g])), []);
  const numbersById = useMemo(() => new Map(dataset.numbers.map((n) => [n.id, n])), []);
  const kanaById = useMemo(() => new Map(dataset.kana.map((k) => [k.id, k])), []);
  const examplesById = useMemo(() => new Map(dataset.examples.map((e) => [e.id, e])), []);
  const notesById = useMemo(() => new Map(dataset.notes.map((n) => [n.id, n])), []);
  const dialoguesById = useMemo(() => new Map(dataset.dialogues.map((d) => [d.id, d])), []);
  const exercisesById = useMemo(() => new Map(dataset.exercises.map((e) => [e.id, e])), []);

  const testItems = useMemo<TestItem[]>(() => {
    if (!lesson) return [];
    const out: TestItem[] = [];
    for (const section of lesson.sections) {
      if (section.kind === "kanji") {
        for (const id of section.itemIds) {
          const k = kanjiById.get(id);
          if (!k) continue;
          const meanings = meaningsToAcceptedAnswers(k.meanings, language);
          out.push({ id: k.id, category: "kanji", prompt: k.character, accepted: meanings, answerDisplay: meanings.join(" / "), kind: "english" });
        }
      } else if (section.kind === "vocabulary") {
        for (const id of section.itemIds) {
          const v = vocabById.get(id);
          if (!v) continue;
          const meanings = meaningsToAcceptedAnswers(v.meanings, language);
          out.push({
            id: v.id,
            category: "vocabulary",
            prompt: v.kanji ?? v.kana,
            promptReading: v.kanji ? v.kana : undefined,
            accepted: meanings,
            answerDisplay: meanings.join(" / "),
            kind: "english",
          });
        }
      } else if (section.kind === "numbers") {
        for (const id of section.itemIds) {
          const n = numbersById.get(id);
          if (!n) continue;
          out.push({
            id: n.id,
            category: "numbers",
            prompt: n.japanese,
            promptReading: n.reading,
            accepted: [String(n.value ?? "")],
            answerDisplay: String(n.value ?? ""),
            kind: "english",
          });
        }
      } else if (section.kind === "kana") {
        for (const id of section.itemIds) {
          const k = kanaById.get(id);
          if (!k) continue;
          out.push({ id: k.id, category: "kana", prompt: k.character, accepted: [k.romaji], answerDisplay: k.romaji, kind: "english" });
        }
      }
    }
    return out;
  }, [lesson, kanjiById, vocabById, numbersById, kanaById, language]);

  const [testLength, setTestLength] = useState<"short" | "normal" | "long">("normal");
  const [phase, setPhase] = useState<"browse" | "question" | "result" | "summary">("browse");
  const [queue, setQueue] = useState<TestItem[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<AnswerOutcome | null>(null);
  const [results, setResults] = useState<AnswerOutcome[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function startTest() {
    const count = testLength === "short" ? 8 : testLength === "normal" ? 16 : testItems.length;
    setQueue(shuffle(testItems).slice(0, count));
    setQIndex(0);
    setResults([]);
    setAnswer("");
    setOutcome(null);
    setPhase("question");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const current = queue[qIndex];

  function submit() {
    if (!current) return;
    const isCorrect = checkAnswer(answer, current.accepted, current.kind);
    const result: AnswerOutcome = isCorrect ? "auto-correct" : "wrong";
    recordAttempt({ itemId: current.id, category: current.category, outcome: result });
    setOutcome(result);
    setResults((r) => [...r, result]);
    setPhase("result");
  }

  function next() {
    if (qIndex + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setQIndex((i) => i + 1);
    setAnswer("");
    setOutcome(null);
    setPhase("question");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function acceptCloseEnough() {
    if (!current || outcome !== "wrong") return;
    recordAttempt({ itemId: current.id, category: current.category, outcome: "self-accepted" });
    setResults((r) => [...r.slice(0, -1), "self-accepted"]);
    setOutcome("self-accepted");
  }

  const latest = useRef({ phase, outcome, submit, next, acceptCloseEnough });
  latest.current = { phase, outcome, submit, next, acceptCloseEnough };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const { phase, outcome, submit, next, acceptCloseEnough } = latest.current;
      if (phase === "question" && e.key === "Enter") submit();
      if (phase === "result" && e.key === "Enter") next();
      if (phase === "result" && outcome === "wrong" && (e.key === "c" || e.key === "C")) acceptCloseEnough();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!lesson) {
    return <EmptyState message={`Unknown lesson: ${lessonId}`} />;
  }

  if (phase === "question" || phase === "result") {
    if (!current) return null;
    return (
      <div>
        <PageHeader title={localizedText(lesson.title, language)} description={`${qIndex + 1} / ${queue.length}`} />
        <div className="card test-question">
          <div className="jp-text test-question__prompt">{current.prompt}</div>
          {current.promptReading && <div className="jp-text test-question__reading">{current.promptReading}</div>}

          {phase === "question" && (
            <>
              <input
                ref={inputRef}
                className="test-question__input jp-text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type the meaning..."
                autoFocus
              />
              <div className="test-question__actions">
                <button type="button" className="btn btn--primary" onClick={submit}>
                  {t("common.submit")}
                </button>
              </div>
            </>
          )}

          {phase === "result" && outcome && (
            <>
              <p className={`test-question__result test-question__result--${outcome === "wrong" ? "wrong" : "correct"}`}>
                {outcome === "auto-correct" && `✓ ${t("common.correct")}`}
                {outcome === "self-accepted" && `~ ${t("common.closeEnough")}`}
                {outcome === "wrong" && `✗ ${t("common.wrong")}`}
              </p>
              <p>
                Answer: <strong className="jp-text">{current.answerDisplay}</strong>
              </p>
              <div className="test-question__actions">
                {outcome === "wrong" && (
                  <button type="button" className="btn" onClick={acceptCloseEnough}>
                    {t("common.closeEnough")}
                  </button>
                )}
                <button type="button" className="btn btn--primary" onClick={next}>
                  {t("common.next")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === "summary") {
    const auto = results.filter((r) => r === "auto-correct").length;
    const self = results.filter((r) => r === "self-accepted").length;
    const wrong = results.filter((r) => r === "wrong").length;
    return (
      <div>
        <PageHeader title={localizedText(lesson.title, language)} />
        <div className="card test-summary">
          <p>Auto-correct: {auto}</p>
          <p>Accepted by you: {self}</p>
          <p>Wrong: {wrong}</p>
          <button type="button" className="btn btn--primary" onClick={() => setPhase("browse")}>
            {t("common.next")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={localizedText(lesson.title, language)}
        description={lesson.description ? localizedText(lesson.description, language) : undefined}
      />

      {testItems.length > 0 && (
        <div className="test-config" style={{ marginBottom: "var(--space-4)" }}>
          <label>
            Test length:{" "}
            <select value={testLength} onChange={(e) => setTestLength(e.target.value as typeof testLength)}>
              <option value="short">Short (8)</option>
              <option value="normal">Normal (16)</option>
              <option value="long">Long (all {testItems.length})</option>
            </select>
          </label>
          <button type="button" className="btn btn--primary" onClick={startTest}>
            {t("common.startTest")}
          </button>
        </div>
      )}

      {lesson.sections.length === 0 ? (
        <EmptyState />
      ) : (
        lesson.sections.map((section) => (
          <section key={section.id} className="card" style={{ marginBottom: "var(--space-4)" }}>
            <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>
              {localizedText(section.title, language)}{" "}
              <span style={{ color: "var(--color-text-muted)", fontWeight: "normal" }}>
                ({section.kind}, {section.itemIds.length} items)
              </span>
            </h2>

            {section.kind === "kanji" && (
              <div className="kanji-grid">
                {section.itemIds.map((id) => {
                  const k = kanjiById.get(id);
                  if (!k) return null;
                  return (
                    <div key={id} className="card jp-text" style={{ textAlign: "center", padding: "var(--space-2)" }}>
                      <div style={{ fontSize: "1.5rem" }}>{k.character}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-ui)" }}>
                        {localizedText(k.meanings, language)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {section.kind === "vocabulary" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {section.itemIds.map((id) => {
                    const v = vocabById.get(id);
                    if (!v) return null;
                    return (
                      <tr key={id} style={{ borderTop: "1px solid var(--color-border)" }}>
                        <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)" }}>
                          {v.kanji ?? v.kana}
                        </td>
                        {v.kanji && (
                          <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                            {v.kana}
                          </td>
                        )}
                        <td style={{ padding: "var(--space-1) var(--space-2)" }}>{localizedText(v.meanings, language)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {section.kind === "numbers" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {section.itemIds.map((id) => {
                    const n = numbersById.get(id);
                    if (!n) return null;
                    return (
                      <tr key={id} style={{ borderTop: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>{n.value ?? ""}</td>
                        <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)" }}>
                          {n.japanese}
                        </td>
                        <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                          {n.reading}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {section.kind === "kana" && (
              <div className="kanji-grid">
                {section.itemIds.map((id) => {
                  const k = kanaById.get(id);
                  if (!k) return null;
                  return (
                    <div key={id} className="card jp-text" style={{ textAlign: "center", padding: "var(--space-2)" }}>
                      <div style={{ fontSize: "1.5rem" }}>{k.character}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-ui)" }}>{k.romaji}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {section.kind === "grammar" && (
              <ul>
                {section.itemIds.map((id) => {
                  const g = grammarById.get(id);
                  if (!g) return null;
                  return (
                    <li key={id} className="jp-text">
                      {g.pattern} <span style={{ fontFamily: "var(--font-ui)", color: "var(--color-text-muted)" }}>— {localizedText(g.explanation, language)}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {section.kind === "examples" && (
              <ul>
                {section.itemIds.map((id) => {
                  const ex = examplesById.get(id);
                  if (!ex) return null;
                  return (
                    <li key={id} className="jp-text" style={{ marginBottom: "var(--space-2)" }}>
                      {ex.japanese}
                      {ex.reading && <span style={{ color: "var(--color-text-muted)" }}> ({ex.reading})</span>}
                      <br />
                      <span style={{ fontFamily: "var(--font-ui)" }}>{localizedText(ex.meanings, language)}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {section.kind === "dialogue" && (
              <div>
                {section.itemIds.map((id) => {
                  const d = dialoguesById.get(id);
                  if (!d) return null;
                  return (
                    <div key={id} style={{ marginBottom: "var(--space-3)" }}>
                      {d.title && <p style={{ fontWeight: 600 }}>{d.title}</p>}
                      {d.lines.map((line, i) => (
                        <p key={i} className="jp-text" style={{ margin: "var(--space-1) 0" }}>
                          {line.speaker && <strong>{line.speaker}: </strong>}
                          {line.japanese}
                          {line.reading && <span style={{ color: "var(--color-text-muted)" }}> ({line.reading})</span>}
                          {line.meanings && (
                            <span style={{ fontFamily: "var(--font-ui)", display: "block", color: "var(--color-text-muted)" }}>
                              {localizedText(line.meanings, language)}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {section.kind === "notes" && (
              <ul>
                {section.itemIds.map((id) => {
                  const n = notesById.get(id);
                  if (!n) return null;
                  return (
                    <li key={id} style={{ marginBottom: "var(--space-1)" }}>
                      {localizedText(n.text, language)}
                    </li>
                  );
                })}
              </ul>
            )}

            {section.kind === "exercises" && (
              <ul>
                {section.itemIds.map((id) => {
                  const ex = exercisesById.get(id);
                  if (!ex) return null;
                  return (
                    <li key={id} style={{ marginBottom: "var(--space-1)" }}>
                      {localizedText(ex.prompt, language)}
                    </li>
                  );
                })}
              </ul>
            )}

            {section.kind === "mini-review" && (
              <p style={{ color: "var(--color-text-muted)" }}>{section.itemIds.length} review items — practice via the test button above.</p>
            )}
          </section>
        ))
      )}
    </div>
  );
}
