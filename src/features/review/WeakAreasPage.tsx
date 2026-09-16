import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { checkAnswer } from "../../lib/grading";
import { meaningsToAcceptedAnswers } from "../../lib/testing/acceptedAnswers";
import type { AnswerOutcome } from "../../lib/storage/types";
import "../kanji/kanji.css";

interface ResolvedItem {
  id: string;
  category: string;
  display: string;
  reading?: string;
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

export function WeakAreasPage() {
  const { t, language } = useTranslation();
  const { state, recordAttempt } = useProgress();

  const resolvedById = useMemo(() => {
    const map = new Map<string, ResolvedItem>();
    for (const k of dataset.kanji) {
      const meanings = meaningsToAcceptedAnswers(k.meanings, language);
      map.set(k.id, {
        id: k.id,
        category: "kanji",
        display: k.character,
        accepted: meanings,
        answerDisplay: meanings.join(" / "),
        kind: "english",
      });
    }
    for (const v of dataset.vocabulary) {
      const meanings = meaningsToAcceptedAnswers(v.meanings, language);
      map.set(v.id, {
        id: v.id,
        category: "vocabulary",
        display: v.kanji ?? v.kana,
        reading: v.kanji ? v.kana : undefined,
        accepted: meanings,
        answerDisplay: meanings.join(" / "),
        kind: "english",
      });
    }
    for (const g of dataset.grammar) {
      map.set(g.id, {
        id: g.id,
        category: "grammar",
        display: g.pattern,
        accepted: [],
        answerDisplay: "",
        kind: "english",
      });
    }
    for (const n of dataset.numbers) {
      map.set(n.id, {
        id: n.id,
        category: "numbers",
        display: n.japanese,
        reading: n.reading,
        accepted: [String(n.value ?? "")],
        answerDisplay: String(n.value ?? ""),
        kind: "english",
      });
    }
    for (const k of dataset.kana) {
      map.set(k.id, {
        id: k.id,
        category: "kana",
        display: k.character,
        accepted: [k.romaji],
        answerDisplay: k.romaji,
        kind: "english",
      });
    }
    return map;
  }, [language]);

  const weakStats = useMemo(
    () =>
      Object.values(state.itemStats)
        .filter((s) => s.wrong > 0)
        .sort((a, b) => b.difficultyScore - a.difficultyScore),
    [state.itemStats],
  );

  const weakItems = useMemo(
    () =>
      weakStats
        .map((s) => ({ stats: s, resolved: resolvedById.get(s.itemId) }))
        .filter((w): w is { stats: (typeof weakStats)[number]; resolved: ResolvedItem } => Boolean(w.resolved)),
    [weakStats, resolvedById],
  );

  const [phase, setPhase] = useState<"list" | "question" | "result" | "summary">("list");
  const [queue, setQueue] = useState<ResolvedItem[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<AnswerOutcome | null>(null);
  const [results, setResults] = useState<AnswerOutcome[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const practiceable = useMemo(() => weakItems.filter((w) => w.resolved.accepted.length > 0), [weakItems]);

  function start() {
    setQueue(shuffle(practiceable.map((w) => w.resolved)).slice(0, 20));
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

  if (weakItems.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.weakAreas")} />
        <EmptyState message="No weak items yet — they will show up here once you've answered some questions incorrectly." />
      </div>
    );
  }

  if (phase === "question" || phase === "result") {
    if (!current) return null;
    return (
      <div>
        <PageHeader title={t("nav.weakAreas")} description={`${qIndex + 1} / ${queue.length} — ${current.category}`} />
        <div className="card test-question">
          <div className="jp-text test-question__prompt">{current.display}</div>
          {current.reading && <div className="jp-text test-question__reading">{current.reading}</div>}

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
        <PageHeader title={t("nav.weakAreas")} />
        <div className="card test-summary">
          <p>Auto-correct: {auto}</p>
          <p>Accepted by you: {self}</p>
          <p>Wrong: {wrong}</p>
          <button type="button" className="btn btn--primary" onClick={() => setPhase("list")}>
            {t("common.next")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.weakAreas")} description={`${weakItems.length} items you've gotten wrong at least once`} />
      {practiceable.length > 0 && (
        <button type="button" className="btn btn--primary" style={{ marginBottom: "var(--space-4)" }} onClick={start}>
          {t("common.startTest")} ({Math.min(20, practiceable.length)})
        </button>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {weakItems.map(({ stats, resolved }) => (
            <tr key={stats.itemId} style={{ borderTop: "1px solid var(--color-border)" }}>
              <td style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>{resolved.category}</td>
              <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)" }}>
                {resolved.display}
                {resolved.reading && <span style={{ color: "var(--color-text-muted)" }}> ({resolved.reading})</span>}
              </td>
              <td style={{ padding: "var(--space-1) var(--space-2)" }}>{resolved.answerDisplay}</td>
              <td style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                {stats.wrong} wrong / {stats.attempts} attempts
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
