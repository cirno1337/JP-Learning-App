import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { useProgress } from "../progress/ProgressContext";
import { dataset } from "../../data";
import { isDue } from "../../lib/srs";
import "./dashboard.css";

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

  const contentTotals = [
    { icon: "🈶", label: t("nav.kanjiLessons"), count: dataset.kanji.length },
    { icon: "📖", label: t("nav.vocabularyLessons"), count: dataset.vocabulary.length },
    { icon: "🧩", label: t("nav.grammar"), count: dataset.grammar.length },
    { icon: "🔢", label: t("nav.numbers"), count: dataset.numbers.length },
    { icon: "🗂️", label: t("nav.lessonReview"), count: dataset.lessons.length },
  ];

  const hasAnyContent = contentTotals.some((c) => c.count > 0);

  return (
    <div>
      <PageHeader title={t("nav.dashboard")} description={<span className="jp-text">頑張って！Keep your streak going today.</span>} />

      <section className="stat-grid">
        <div className="card stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            🔥
          </span>
          <div>
            <p className="stat-card__label">{t("dashboard.streak")}</p>
            <p className="stat-card__value">{state.currentStreak ?? 0}</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            ⏰
          </span>
          <div>
            <p className="stat-card__label">{t("dashboard.dueToday")}</p>
            <p className="stat-card__value">{dueCount}</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            🎯
          </span>
          <div>
            <p className="stat-card__label">{t("dashboard.recentAccuracy")}</p>
            {accuracy ? (
              <>
                <p className="stat-card__value">{accuracy.totalAcceptedPct}%</p>
                <p className="stat-card__hint">
                  auto {accuracy.autoPct}% + self {accuracy.selfPct}%
                </p>
              </>
            ) : (
              <p className="stat-card__hint">{t("dashboard.noDataYet")}</p>
            )}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontSize: "1.1rem" }}>{t("dashboard.quickStart")}</h2>
        <div className="quick-start__grid">
          <Link className="btn btn--primary" to="/kanji/test">
            <span aria-hidden="true">📝</span> {t("nav.kanjiTest")}
          </Link>
          <Link className="btn btn--primary" to="/vocabulary/test">
            <span aria-hidden="true">✍️</span> {t("nav.vocabularyTest")}
          </Link>
          <Link className="btn" to="/grammar">
            <span aria-hidden="true">🧩</span> {t("nav.grammar")}
          </Link>
          <Link className="btn" to="/numbers">
            <span aria-hidden="true">🔢</span> {t("nav.numbers")}
          </Link>
          <Link className="btn" to="/review/mixed">
            <span aria-hidden="true">🎲</span> {t("nav.mixedReview")}
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem" }}>{t("dashboard.overallProgress")}</h2>
        {hasAnyContent ? (
          <ul className="progress-grid">
            {contentTotals.map((c) => (
              <li key={c.label}>
                <span className="progress-grid__icon jp-text" aria-hidden="true">
                  {c.icon}
                </span>
                {c.label}
                <span className="progress-grid__count">{c.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No lesson content has been processed into the app yet — this will fill in as PDFs are extracted." />
        )}
      </section>
    </div>
  );
}
