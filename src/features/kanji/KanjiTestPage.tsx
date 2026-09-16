import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { checkAnswer } from "../../lib/grading";
import { meaningsToAcceptedAnswers } from "../../lib/testing/acceptedAnswers";
import type { KanjiEntry } from "../../data/types";
import type { AnswerOutcome } from "../../lib/storage/types";
import "./kanji.css";

type Direction = "jp-to-en" | "en-to-jp";
type Phase = "config" | "question" | "result" | "summary";

interface QuestionResult {
  outcome: AnswerOutcome;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function KanjiTestPage() {
  const { t, language } = useTranslation();
  const { recordAttempt } = useProgress();

  const [phase, setPhase] = useState<Phase>("config");
  const [lessonFilter, setLessonFilter] = useState("all");
  const [directionSetting, setDirectionSetting] = useState<Direction | "mixed">("mixed");
  const [count, setCount] = useState(15);

  const [queue, setQueue] = useState<{ kanji: KanjiEntry; direction: Direction }[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () => dataset.kanji.filter((k) => lessonFilter === "all" || k.lessonIds.includes(lessonFilter)),
    [lessonFilter],
  );

  function startTest() {
    const picked = shuffle(available).slice(0, Math.min(count, available.length));
    const withDirection = picked.map((kanji) => ({
      kanji,
      direction:
        directionSetting === "mixed" ? (Math.random() < 0.5 ? "jp-to-en" : "en-to-jp") : directionSetting,
    })) as { kanji: KanjiEntry; direction: Direction }[];
    setQueue(withDirection);
    setQIndex(0);
    setResults([]);
    setAnswer("");
    setResult(null);
    setPhase("question");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const current = queue[qIndex];

  function acceptedAnswersFor(kanji: KanjiEntry, direction: Direction): string[] {
    return direction === "jp-to-en" ? meaningsToAcceptedAnswers(kanji.meanings, language) : [kanji.character];
  }

  function submit() {
    if (!current || phase !== "question") return;
    const accepted = acceptedAnswersFor(current.kanji, current.direction);
    const isCorrect = checkAnswer(answer, accepted, current.direction === "jp-to-en" ? "english" : "japanese");
    const outcome: AnswerOutcome = isCorrect ? "auto-correct" : "wrong";
    finish(outcome);
  }

  function finish(outcome: AnswerOutcome) {
    if (!current) return;
    recordAttempt({ itemId: current.kanji.id, category: "kanji", outcome, direction: current.direction });
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
    if (!current || phase !== "result" || result?.outcome !== "wrong") return;
    recordAttempt({ itemId: current.kanji.id, category: "kanji", outcome: "self-accepted", direction: current.direction });
    setResults((r) => [...r.slice(0, -1), { outcome: "self-accepted" }]);
    setResult({ outcome: "self-accepted" });
  }

  // A window-level listener (rather than an onKeyDown on some element) so
  // shortcuts keep working even when focus isn't on the text input — e.g.
  // right after the result screen replaces the answer button with "Next",
  // which drops DOM focus back to <body>.
  const latest = useRef({ phase, result, submit, next, acceptCloseEnough });
  latest.current = { phase, result, submit, next, acceptCloseEnough };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const { phase, result, submit, next, acceptCloseEnough } = latest.current;
      if (phase === "question" && e.key === "Enter") submit();
      if (phase === "result" && e.key === "Enter") next();
      if (phase === "result" && result?.outcome === "wrong" && (e.key === "c" || e.key === "C")) {
        acceptCloseEnough();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (dataset.kanji.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.kanjiTest")} />
        <EmptyState />
      </div>
    );
  }

  if (phase === "config") {
    return (
      <div>
        <PageHeader title={t("nav.kanjiTest")} />
        <div className="test-config">
          <label>
            {t("common.lesson")}:{" "}
            <select value={lessonFilter} onChange={(e) => setLessonFilter(e.target.value)}>
              <option value="all">{t("common.all")}</option>
              {dataset.lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {localizedText(l.title, language)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Direction:{" "}
            <select value={directionSetting} onChange={(e) => setDirectionSetting(e.target.value as Direction | "mixed")}>
              <option value="mixed">Mixed</option>
              <option value="jp-to-en">Japanese → English</option>
              <option value="en-to-jp">English → Japanese</option>
            </select>
          </label>
          <label>
            Questions:{" "}
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              <option value={10}>10 (short)</option>
              <option value={15}>15 (normal)</option>
              <option value={30}>30 (long)</option>
            </select>
          </label>
        </div>
        <p style={{ color: "var(--color-text-muted)" }}>{available.length} kanji available with this filter.</p>
        <button type="button" className="btn btn--primary" onClick={startTest} disabled={available.length === 0}>
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
      <div>
        <PageHeader title={t("nav.kanjiTest")} />
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

  if (!current) return null;

  return (
    <div>
      <PageHeader title={t("nav.kanjiTest")} description={`${qIndex + 1} / ${queue.length}`} />
      <div className="card test-question">
        {current.direction === "jp-to-en" ? (
          <div className="jp-text test-question__prompt">{current.kanji.character}</div>
        ) : (
          <div className="test-question__prompt" style={{ fontSize: "1.75rem" }}>
            {meaningsToAcceptedAnswers(current.kanji.meanings, language).join(" / ")}
          </div>
        )}

        {phase === "question" && (
          <>
            <input
              ref={inputRef}
              className="test-question__input jp-text"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={current.direction === "jp-to-en" ? "Type the meaning..." : "日本語で入力..."}
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
            <p
              className={`test-question__result test-question__result--${
                result.outcome === "wrong" ? "wrong" : "correct"
              }`}
            >
              {result.outcome === "auto-correct" && `✓ ${t("common.correct")}`}
              {result.outcome === "self-accepted" && `~ ${t("common.closeEnough")}`}
              {result.outcome === "wrong" && `✗ ${t("common.wrong")}`}
            </p>
            <p>
              Answer:{" "}
              <strong className="jp-text">
                {current.direction === "jp-to-en"
                  ? localizedText(current.kanji.meanings, language)
                  : current.kanji.character}
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
    </div>
  );
}
