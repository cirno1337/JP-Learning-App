import { useMemo } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { useProgress } from "./ProgressContext";
import type { ReviewBucket } from "../../lib/storage/types";

const BUCKET_LABELS: Record<ReviewBucket, string> = {
  new: "New",
  learning: "Learning",
  review: "Review",
  mastered: "Mastered",
};

export function ProgressStatsPage() {
  const { t } = useTranslation();
  const { state } = useProgress();

  const byCategory = useMemo(() => {
    const map = new Map<string, { auto: number; self: number; wrong: number }>();
    for (const a of state.attempts) {
      const entry = map.get(a.category) ?? { auto: 0, self: 0, wrong: 0 };
      if (a.outcome === "auto-correct") entry.auto += 1;
      else if (a.outcome === "self-accepted") entry.self += 1;
      else entry.wrong += 1;
      map.set(a.category, entry);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [state.attempts]);

  const bucketCounts = useMemo(() => {
    const counts: Record<ReviewBucket, number> = { new: 0, learning: 0, review: 0, mastered: 0 };
    for (const s of Object.values(state.itemStats)) counts[s.bucket] += 1;
    return counts;
  }, [state.itemStats]);

  if (state.attempts.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.progress")} />
        <EmptyState message={t("dashboard.noDataYet")} />
      </div>
    );
  }

  const auto = state.attempts.filter((a) => a.outcome === "auto-correct").length;
  const self = state.attempts.filter((a) => a.outcome === "self-accepted").length;
  const wrong = state.attempts.filter((a) => a.outcome === "wrong").length;
  const total = state.attempts.length;
  const itemsSeen = Object.keys(state.itemStats).length;

  return (
    <div>
      <PageHeader title={t("nav.progress")} description={`${itemsSeen} items studied, ${total} attempts total`} />

      <div className="card" style={{ marginBottom: "var(--space-4)" }}>
        <p style={{ marginTop: 0, fontWeight: 600 }}>Overall accuracy</p>
        <p>Auto-correct: {Math.round((auto / total) * 100)}%</p>
        <p>Accepted by you: {Math.round((self / total) * 100)}%</p>
        <p>Wrong: {Math.round((wrong / total) * 100)}%</p>
      </div>

      <div className="card" style={{ marginBottom: "var(--space-4)" }}>
        <p style={{ marginTop: 0, fontWeight: 600 }}>Mastery distribution</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {(Object.keys(BUCKET_LABELS) as ReviewBucket[]).map((b) => (
              <tr key={b} style={{ borderTop: "1px solid var(--color-border)" }}>
                <td style={{ padding: "var(--space-1) var(--space-2)" }}>{BUCKET_LABELS[b]}</td>
                <td style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>{bucketCounts[b]} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <p style={{ marginTop: 0, fontWeight: 600 }}>Accuracy by category</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {byCategory.map(([category, s]) => {
              const categoryTotal = s.auto + s.self + s.wrong;
              return (
                <tr key={category} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "var(--space-1) var(--space-2)" }}>{category}</td>
                  <td style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                    {Math.round(((s.auto + s.self) / categoryTotal) * 100)}% correct ({categoryTotal} attempts)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
