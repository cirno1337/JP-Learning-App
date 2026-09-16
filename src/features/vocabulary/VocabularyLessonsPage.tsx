import { useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";
import { useProgress } from "../progress/ProgressContext";
import { illustrationForMeanings } from "../../lib/media/illustrations";
import "../kanji/kanji.css";

export function VocabularyLessonsPage() {
  const { t, language } = useTranslation();
  const { getItemStats, setMarkedKnown, setMarkedDifficult } = useProgress();
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "known" | "difficult">("all");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const filtered = useMemo(() => {
    return dataset.vocabulary.filter((v) => {
      if (lessonFilter !== "all" && !v.lessonIds.includes(lessonFilter)) return false;
      if (statusFilter !== "all") {
        const stats = getItemStats(v.id);
        if (statusFilter === "known" && !stats.markedKnown) return false;
        if (statusFilter === "difficult" && !stats.markedDifficult) return false;
      }
      return true;
    });
  }, [lessonFilter, statusFilter, getItemStats]);

  const current = filtered[Math.min(index, filtered.length - 1)];
  const stats = current ? getItemStats(current.id) : undefined;

  function goTo(newIndex: number) {
    setIndex(Math.max(0, Math.min(filtered.length - 1, newIndex)));
    setRevealed(false);
  }

  if (dataset.vocabulary.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.vocabularyLessons")} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.vocabularyLessons")} description={`${filtered.length} / ${dataset.vocabulary.length} words`} />

      <div className="kanji-filters">
        <label>
          {t("common.lesson")}:{" "}
          <select
            value={lessonFilter}
            onChange={(e) => {
              setLessonFilter(e.target.value);
              goTo(0);
            }}
          >
            <option value="all">{t("common.all")}</option>
            {dataset.lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {localizedText(l.title, language)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("common.filter")}:{" "}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              goTo(0);
            }}
          >
            <option value="all">{t("common.all")}</option>
            <option value="known">Known</option>
            <option value="difficult">Difficult</option>
          </select>
        </label>
      </div>

      {!current ? (
        <EmptyState message="No vocabulary matches the current filters." />
      ) : (
        <div className="card kanji-card">
          <div className="jp-text kanji-card__character" style={{ fontSize: "3rem" }}>
            {current.kanji ?? current.kana}
          </div>
          {current.kanji && <div className="jp-text" style={{ color: "var(--color-text-muted)" }}>{current.kana}</div>}

          <button type="button" className="btn" onClick={() => setRevealed((r) => !r)} style={{ marginTop: "var(--space-3)" }}>
            {t("common.showAnswer")}
          </button>

          {revealed && (
            <div className="kanji-card__details">
              {illustrationForMeanings(current.meanings) && (
                <div className="illustration-badge" role="img" aria-label="Illustration">
                  {illustrationForMeanings(current.meanings)}
                </div>
              )}
              <p>
                <strong>Meaning:</strong> {localizedText(current.meanings, language)}
              </p>
              {current.partOfSpeech && current.partOfSpeech.length > 0 && (
                <p>
                  <strong>Part of speech:</strong> {current.partOfSpeech.join(", ")}
                </p>
              )}
              {current.alternateSpellings && current.alternateSpellings.length > 0 && (
                <p className="jp-text">
                  <strong>Also written:</strong> {current.alternateSpellings.map((s) => s.text).join(", ")}
                </p>
              )}
              {current.notes && <p style={{ color: "var(--color-text-muted)" }}>{current.notes}</p>}
              <p className="kanji-card__source">
                {t("common.source")}: {current.source.map((s) => s.file + (s.page ? ` p.${s.page}` : "")).join("; ")}
              </p>
            </div>
          )}

          <div className="kanji-card__actions">
            <button type="button" className="btn" onClick={() => goTo(index - 1)} disabled={index === 0}>
              {t("common.previous")}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => goTo(index + 1)}
              disabled={index >= filtered.length - 1}
            >
              {t("common.next")}
            </button>
            <button
              type="button"
              className="btn"
              aria-pressed={stats?.markedKnown ?? false}
              onClick={() => setMarkedKnown(current.id, !stats?.markedKnown)}
            >
              {stats?.markedKnown ? "✓ Known" : "Mark as known"}
            </button>
            <button
              type="button"
              className="btn"
              aria-pressed={stats?.markedDifficult ?? false}
              onClick={() => setMarkedDifficult(current.id, !stats?.markedDifficult)}
            >
              {stats?.markedDifficult ? "✓ Difficult" : "Mark as difficult"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
