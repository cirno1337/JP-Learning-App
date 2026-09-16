import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { checkAnswer } from "../../lib/grading";
import { meaningsToAcceptedAnswers } from "../../lib/testing/acceptedAnswers";
import { isDue } from "../../lib/srs";
import type { AnswerOutcome } from "../../lib/storage/types";
import "../kanji/kanji.css";

type Category = "kanji" | "vocabulary" | "numbers";

interface Question {
  id: string;
  category: Category;
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

export function MixedReviewPage() {
  const { t, language } = useTranslation();
  const { recordAttempt, state } = useProgress();

  const [categories, setCategories] = useState<Record<Category, boolean>>({
    kanji: true,
    vocabulary: true,
    numbers: true,
  });
  const [weakOnly, setWeakOnly] = useState(false);
  const [phase, setPhase] = useState<"config" | "question" | "result" | "summary">("config");
  const [queue, setQueue] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<AnswerOutcome | null>(null);
  const [results, setResults] = useState<AnswerOutcome[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalAvailable = dataset.kanji.length + dataset.vocabulary.length + dataset.numbers.length;

  function buildQuestions(): Question[] {
    const qs: Question[] = [];
    if (categories.kanji) {
      for (const k of dataset.kanji) {
        const jpToEn = Math.random() < 0.5;
        qs.push({
          id: k.id,
          category: "kanji",
          prompt: jpToEn ? k.character : meaningsToAcceptedAnswers(k.meanings, language).join(" / "),
          accepted: jpToEn ? meaningsToAcceptedAnswers(k.meanings, language) : [k.character],
          answerDisplay: jpToEn ? meaningsToAcceptedAnswers(k.meanings, language).join(" / ") : k.character,
          kind: jpToEn ? "english" : "japanese",
        });
      }
    }
    if (categories.vocabulary) {
      for (const v of dataset.vocabulary) {
        const jpToEn = Math.random() < 0.5;
        qs.push({
          id: v.id,
          category: "vocabulary",
          prompt: jpToEn ? (v.kanji ?? v.kana) : meaningsToAcceptedAnswers(v.meanings, language).join(" / "),
          promptReading: jpToEn && v.kanji ? v.kana : undefined,
          accepted: jpToEn ? meaningsToAcceptedAnswers(v.meanings, language) : v.kanji ? [v.kanji, v.kana] : [v.kana],
          answerDisplay: jpToEn ? meaningsToAcceptedAnswers(v.meanings, language).join(" / ") : (v.kanji ?? v.kana),
          kind: jpToEn ? "english" : "japanese",
        });
      }
    }
    if (categories.numbers) {
      for (const n of dataset.numbers) {
        const jpToVal = Math.random() < 0.5;
        qs.push({
          id: n.id,
          category: "numbers",
          prompt: jpToVal ? n.japanese : String(n.value ?? n.japanese),
          promptReading: jpToVal ? n.reading : undefined,
          accepted: jpToVal ? [String(n.value ?? "")] : [n.japanese],
          answerDisplay: jpToVal ? String(n.value ?? "") : n.japanese,
          kind: jpToVal ? "english" : "japanese",
        });
      }
    }
    let pool = qs;
    if (weakOnly) {
      pool = pool.filter((q) => {
        const stats = state.itemStats[q.id];
        return stats && (stats.wrong > 0 || isDue(stats));
      });
    }
    return shuffle(pool).slice(0, 20);
  }

  function start() {
    setQueue(buildQuestions());
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

  if (totalAvailable === 0) {
    return (
      <div>
        <PageHeader title={t("nav.mixedReview")} />
        <EmptyState />
      </div>
    );
  }

  if (phase === "config") {
    return (
      <div>
        <PageHeader title={t("nav.mixedReview")} description={`${totalAvailable} items available across all categories`} />
        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ marginTop: 0, fontWeight: 600 }}>{t("common.filter")}</p>
          {(["kanji", "vocabulary", "numbers"] as Category[]).map((c) => (
            <label key={c} style={{ display: "block", marginBottom: "var(--space-1)" }}>
              <input
                type="checkbox"
                checked={categories[c]}
                onChange={(e) => setCategories((prev) => ({ ...prev, [c]: e.target.checked }))}
              />{" "}
              {c}
            </label>
          ))}
          <label style={{ display: "block", marginTop: "var(--space-2)" }}>
            <input type="checkbox" checked={weakOnly} onChange={(e) => setWeakOnly(e.target.checked)} /> Weak / due only
          </label>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={start}
          disabled={!categories.kanji && !categories.vocabulary && !categories.numbers}
        >
          {t("common.startTest")}
        </button>
      </div>
    );
  }

  if (phase === "summary") {
    const auto = results.filter((r) => r === "auto-correct").length;
    const self = results.filter((r) => r === "self-accepted").length;
    const wrong = results.filter((r) => r === "wrong").length;
    return (
      <div>
        <PageHeader title={t("nav.mixedReview")} />
        <div className="card test-summary">
          <p>Auto-correct: {auto}</p>
          <p>Accepted by you: {self}</p>
          <p>Wrong: {wrong}</p>
          <button type="button" className="btn btn--primary" onClick={() => setPhase("config")}>
            {t("common.startTest")}
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div>
        <PageHeader title={t("nav.mixedReview")} />
        <EmptyState message="No items match the current filters (try turning off 'weak/due only')." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.mixedReview")} description={`${qIndex + 1} / ${queue.length} — ${current.category}`} />
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
              placeholder={current.kind === "english" ? "Type the meaning..." : "日本語で入力..."}
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
