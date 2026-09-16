import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { useProgress } from "../progress/ProgressContext";
import { dataset } from "../../data";
import { isDue } from "../../lib/srs";

function accuracyOf(automaticCorrect: number, selfAccepted: number, wrong: number) {
  const total = automaticCorrect + selfAccepted + wrong;
  if (total === 0) return null;
  return {
    total,
    autoPct: Math.round((automaticCorrect / total) * 100),
    selfPct: Math.round((selfAccepted / total) * 100),
    totalAcceptedPct: Math.round(((automaticCorrect + selfAccepted) / total) * 100),
  };
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { state } = useProgress();

  const recent = state.attempts.slice(-50);
  const recentAuto = recent.filter((a) => a.outcome === "auto-correct").length;
  const recentSelf = recent.filter((a) => a.outcome === "self-accepted").length;
  const recentWrong = recent.filter((a) => a.outcome === "wrong").length;
  const accuracy = accuracyOf(recentAuto, recentSelf, recentWrong);

  const dueCount = Object.values(state.itemStats).filter((s) => isDue(s)).length;

  const contentTotals = {
    kanji: dataset.kanji.length,
    vocabulary: dataset.vocabulary.length,
    grammar: dataset.grammar.length,
    numbers: dataset.numbers.length,
    lessons: dataset.lessons.length,
  };

  const hasAnyContent = Object.values(contentTotals).some((n) => n > 0);

  return (
    <div>
      <PageHeader title={t("nav.dashboard")} />

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
        <div className="card">
          <strong>{t("dashboard.streak")}</strong>
          <p style={{ fontSize: "1.75rem", margin: "var(--space-2) 0 0" }}>{state.currentStreak ?? 0}</p>
        </div>
        <div className="card">
          <strong>{t("dashboard.dueToday")}</strong>
          <p style={{ fontSize: "1.75rem", margin: "var(--space-2) 0 0" }}>{dueCount}</p>
        </div>
        <div className="card">
          <strong>{t("dashboard.recentAccuracy")}</strong>
          {accuracy ? (
            <p style={{ margin: "var(--space-2) 0 0" }}>
              {accuracy.totalAcceptedPct}%{" "}
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                (auto {accuracy.autoPct}% + self {accuracy.selfPct}%)
              </span>
            </p>
          ) : (
            <p style={{ color: "var(--color-text-muted)", margin: "var(--space-2) 0 0" }}>{t("dashboard.noDataYet")}</p>
          )}
        </div>
      </section>

      <section style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontSize: "1.1rem" }}>{t("dashboard.quickStart")}</h2>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Link className="btn btn--primary" to="/kanji/test">
            {t("nav.kanjiTest")}
          </Link>
          <Link className="btn btn--primary" to="/vocabulary/test">
            {t("nav.vocabularyTest")}
          </Link>
          <Link className="btn" to="/grammar">
            {t("nav.grammar")}
          </Link>
          <Link className="btn" to="/numbers">
            {t("nav.numbers")}
          </Link>
          <Link className="btn" to="/review/mixed">
            {t("nav.mixedReview")}
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem" }}>{t("dashboard.overallProgress")}</h2>
        {hasAnyContent ? (
          <ul>
            <li>
              {t("nav.kanjiLessons")}: {contentTotals.kanji}
            </li>
            <li>
              {t("nav.vocabularyLessons")}: {contentTotals.vocabulary}
            </li>
            <li>
              {t("nav.grammar")}: {contentTotals.grammar}
            </li>
            <li>
              {t("nav.numbers")}: {contentTotals.numbers}
            </li>
            <li>
              {t("nav.lessonReview")}: {contentTotals.lessons}
            </li>
          </ul>
        ) : (
          <EmptyState message="No lesson content has been processed into the app yet — this will fill in as PDFs are extracted." />
        )}
      </section>
    </div>
  );
}
