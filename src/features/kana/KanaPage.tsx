import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import type { KanaEntry } from "../../data/types";
import type { AnswerOutcome } from "../../lib/storage/types";
import "../kanji/kanji.css";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Direction = "kana-to-romaji" | "romaji-to-kana";
type Phase = "config" | "question" | "result" | "summary";
interface Result {
  outcome: AnswerOutcome;
}

export function KanaPage() {
  const { t } = useTranslation();
  const { recordAttempt } = useProgress();
  const [chart, setChart] = useState<"all" | "hiragana" | "katakana">("all");
  const [direction, setDirection] = useState<Direction | "mixed">("mixed");
  const [phase, setPhase] = useState<Phase>("config");
  const [queue, setQueue] = useState<{ k: KanaEntry; direction: Direction }[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () => dataset.kana.filter((k) => chart === "all" || k.chart === chart),
    [chart],
  );

  function start() {
    const picked = shuffle(available).slice(0, Math.min(20, available.length));
    setQueue(
      picked.map((k) => ({
        k,
        direction: direction === "mixed" ? (Math.random() < 0.5 ? "kana-to-romaji" : "romaji-to-kana") : direction,
      })),
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
    const normalized = answer.trim().toLowerCase();
    const isCorrect =
      current.direction === "kana-to-romaji"
        ? normalized === current.k.romaji.toLowerCase()
        : answer.trim() === current.k.character;
    const outcome: AnswerOutcome = isCorrect ? "auto-correct" : "wrong";
    recordAttempt({ itemId: current.k.id, category: "kana", outcome });
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

  const latest = useRef({ phase, submit, next });
  latest.current = { phase, submit, next };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const { phase, submit, next } = latest.current;
      if (phase === "question" && e.key === "Enter") submit();
      if (phase === "result" && e.key === "Enter") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (dataset.kana.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.kana")} />
        <EmptyState message="No dedicated kana drills have been added yet — the course assumes kana is already known, per the source material." />
      </div>
    );
  }

  if (phase === "config") {
    return (
      <div>
        <PageHeader title={t("nav.kana")} description={`${dataset.kana.length} kana characters`} />
        <div className="test-config">
          <label>
            Chart:{" "}
            <select value={chart} onChange={(e) => setChart(e.target.value as typeof chart)}>
              <option value="all">All</option>
              <option value="hiragana">Hiragana</option>
              <option value="katakana">Katakana</option>
            </select>
          </label>
          <label>
            Direction:{" "}
            <select value={direction} onChange={(e) => setDirection(e.target.value as Direction | "mixed")}>
              <option value="mixed">Mixed</option>
              <option value="kana-to-romaji">Kana → Romaji</option>
              <option value="romaji-to-kana">Romaji → Kana</option>
            </select>
          </label>
        </div>
        <p style={{ color: "var(--color-text-muted)" }}>{available.length} kana available.</p>
        <button type="button" className="btn btn--primary" onClick={start} disabled={available.length === 0}>
          {t("common.startTest")}
        </button>

        <div style={{ marginTop: "var(--space-5)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))", gap: "var(--space-2)" }}>
          {available.map((k) => (
            <div key={k.id} className="card jp-text" style={{ textAlign: "center", padding: "var(--space-2)" }} title={k.romaji}>
              <div style={{ fontSize: "1.5rem" }}>{k.character}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{k.romaji}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "summary") {
    const auto = results.filter((r) => r.outcome === "auto-correct").length;
    const wrong = results.filter((r) => r.outcome === "wrong").length;
    return (
      <div>
        <PageHeader title={t("nav.kana")} />
        <div className="card test-summary">
          <p>Correct: {auto}</p>
          <p>Wrong: {wrong}</p>
          <button type="button" className="btn btn--primary" onClick={() => setPhase("config")}>
            {t("common.startTest")}
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div>
      <PageHeader title={t("nav.kana")} description={`${qIndex + 1} / ${queue.length}`} />
      <div className="card test-question">
        <div className="jp-text test-question__prompt">
          {current.direction === "kana-to-romaji" ? current.k.character : current.k.romaji}
        </div>

        {phase === "question" && (
          <>
            <input
              ref={inputRef}
              className="test-question__input jp-text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={current.direction === "kana-to-romaji" ? "romaji..." : "かな..."}
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
              {result.outcome === "auto-correct" ? `✓ ${t("common.correct")}` : `✗ ${t("common.wrong")}`}
            </p>
            <p>
              Answer:{" "}
              <strong className="jp-text">
                {current.direction === "kana-to-romaji" ? current.k.romaji : current.k.character}
              </strong>
            </p>
            <button type="button" className="btn btn--primary" onClick={next}>
              {t("common.next")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
