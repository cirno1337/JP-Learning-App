import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { checkAnswer } from "../../lib/grading";
import type { NumberCategory, NumberEntry } from "../../data/types";
import type { AnswerOutcome } from "../../lib/storage/types";
import "../kanji/kanji.css";

const CATEGORY_LABELS: Record<NumberCategory, string> = {
  cardinal: "Cardinal numbers",
  "date-month": "Months",
  "date-day-of-month": "Days of the month",
  "day-of-week": "Days of the week",
  time: "Time",
  price: "Price",
  age: "Age",
  "counter-people": "People",
  "counter-objects": "Objects",
  "counter-animals": "Animals",
  "counter-flat-objects": "Flat objects",
  "counter-vehicles-devices": "Vehicles & devices",
  "counter-long-objects": "Long, cylindrical objects",
  "counter-liquid-containers": "Cups / glasses",
  "counter-books": "Bound volumes (books)",
  "counter-occurrences": "Times / occurrences",
  "counter-ordinal": "Ordinal numbers",
  "counter-other": "Other counters",
};

export function NumbersPage() {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState<"browse" | "test">("browse");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(dataset.numbers.map((n) => n.category));
    return Array.from(set);
  }, []);

  const filtered = useMemo(
    () => dataset.numbers.filter((n) => categoryFilter === "all" || n.category === categoryFilter),
    [categoryFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const n of filtered) {
      const key = `${n.category}:${n.counter ?? ""}`;
      map.set(key, [...(map.get(key) ?? []), n]);
    }
    return map;
  }, [filtered]);

  if (dataset.numbers.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.numbers")} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.numbers")} description={`${dataset.numbers.length} entries across ${categories.length} categories`} />

      <div className="kanji-filters">
        <label>
          Mode:{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value as "browse" | "test")}>
            <option value="browse">Lesson</option>
            <option value="test">Test</option>
          </select>
        </label>
        <label>
          {t("common.filter")}:{" "}
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">{t("common.all")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === "test" && <NumbersTest items={filtered} />}
      {mode === "browse" && (
        <>

      {Array.from(grouped.entries()).map(([key, entries]) => {
        const [category, counter] = key.split(":");
        const sorted = [...entries].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
        return (
          <section key={key} className="card" style={{ marginBottom: "var(--space-4)" }}>
            <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>
              {CATEGORY_LABELS[category as NumberCategory] ?? category}
              {counter ? ` (${counter})` : ""}
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {sorted.map((n) => (
                  <tr key={n.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                      {n.value ?? ""}
                    </td>
                    <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)" }}>
                      {n.japanese}
                      {n.irregular && <span title="Irregular reading" style={{ marginLeft: 4 }}>⚠</span>}
                    </td>
                    <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                      {n.reading}
                    </td>
                    {n.notes && n.notes.length > 0 && (
                      <td style={{ padding: "var(--space-1) var(--space-2)" }}>{localizedText(n.notes, language)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
        </>
      )}
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type NumDirection = "jp-to-value" | "value-to-jp";
interface NumResult {
  outcome: AnswerOutcome;
}

function NumbersTest({ items }: { items: NumberEntry[] }) {
  const { t } = useTranslation();
  const { recordAttempt } = useProgress();
  const [phase, setPhase] = useState<"config" | "question" | "result" | "summary">("config");
  const [count, setCount] = useState(15);
  const [queue, setQueue] = useState<{ n: NumberEntry; direction: NumDirection }[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<NumResult | null>(null);
  const [results, setResults] = useState<NumResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function start() {
    const picked = shuffle(items).slice(0, Math.min(count, items.length));
    setQueue(
      picked.map((n) => ({ n, direction: Math.random() < 0.5 ? "jp-to-value" : "value-to-jp" })),
    );
    setQIndex(0);
    setResults([]);
    setAnswer("");
    setResult(null);
    setPhase("question");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const current = queue[qIndex];

  function submit() {
    if (!current) return;
    const isCorrect =
      current.direction === "jp-to-value"
        ? checkAnswer(answer, [String(current.n.value ?? "")], "english")
        : checkAnswer(answer, [current.n.japanese], "japanese");
    const outcome: AnswerOutcome = isCorrect ? "auto-correct" : "wrong";
    recordAttempt({ itemId: current.n.id, category: "numbers", outcome });
    setResult({ outcome });
    setResults((r) => [...r, { outcome }]);
    setPhase("result");
  }

  function next() {
    if (qIndex + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setQIndex((i) => i + 1);
    setAnswer("");
    setResult(null);
    setPhase("question");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function acceptCloseEnough() {
    if (!current || result?.outcome !== "wrong") return;
    recordAttempt({ itemId: current.n.id, category: "numbers", outcome: "self-accepted" });
    setResults((r) => [...r.slice(0, -1), { outcome: "self-accepted" }]);
    setResult({ outcome: "self-accepted" });
  }

  // Window-level listener (not onKeyDown on an element) so shortcuts keep
  // working once focus drops back to <body> after the result screen swaps
  // out the answer input — see KanjiTestPage for the bug this avoids.
  const latest = useRef({ phase, result, submit, next, acceptCloseEnough });
  latest.current = { phase, result, submit, next, acceptCloseEnough };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const { phase, result, submit, next, acceptCloseEnough } = latest.current;
      if (phase === "question" && e.key === "Enter") submit();
      if (phase === "result" && e.key === "Enter") next();
      if (phase === "result" && result?.outcome === "wrong" && (e.key === "c" || e.key === "C")) acceptCloseEnough();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (phase === "config") {
    return (
      <div>
        <label>
          Questions:{" "}
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
        </label>
        <p style={{ color: "var(--color-text-muted)" }}>{items.length} numbers available with this filter.</p>
        <button type="button" className="btn btn--primary" onClick={start} disabled={items.length === 0}>
          {t("common.startTest")}
        </button>
      </div>
    );
  }

  if (phase === "summary") {
    const auto = results.filter((r) => r.outcome === "auto-correct").length;
    const self = results.filter((r) => r.outcome === "self-accepted").length;
    const wrong = results.filter((r) => r.outcome === "wrong").length;
    return (
      <div className="card test-summary">
        <p>Auto-correct: {auto}</p>
        <p>Accepted by you: {self}</p>
        <p>Wrong: {wrong}</p>
        <button type="button" className="btn btn--primary" onClick={() => setPhase("config")}>
          {t("common.startTest")}
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="card test-question">
      <p style={{ color: "var(--color-text-muted)" }}>{qIndex + 1} / {queue.length}</p>
      <div className="jp-text test-question__prompt">
        {current.direction === "jp-to-value" ? current.n.japanese : (current.n.value ?? current.n.japanese)}
      </div>
      {current.direction === "jp-to-value" && <div className="jp-text test-question__reading">{current.n.reading}</div>}

      {phase === "question" && (
        <>
          <input
            ref={inputRef}
            className="test-question__input jp-text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={current.direction === "jp-to-value" ? "Type the number..." : "日本語で入力..."}
            autoFocus
          />
          <div className="test-question__actions">
            <button type="button" className="btn btn--primary" onClick={submit}>
              {t("common.submit")}
            </button>
          </div>
        </>
      )}

      {phase === "result" && result && (
        <>
          <p className={`test-question__result test-question__result--${result.outcome === "wrong" ? "wrong" : "correct"}`}>
            {result.outcome === "auto-correct" && `✓ ${t("common.correct")}`}
            {result.outcome === "self-accepted" && `~ ${t("common.closeEnough")}`}
            {result.outcome === "wrong" && `✗ ${t("common.wrong")}`}
          </p>
          <p>
            Answer:{" "}
            <strong className="jp-text">
              {current.direction === "jp-to-value" ? current.n.value : `${current.n.japanese} (${current.n.reading})`}
            </strong>
          </p>
          <div className="test-question__actions">
            {result.outcome === "wrong" && (
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
  );
}
