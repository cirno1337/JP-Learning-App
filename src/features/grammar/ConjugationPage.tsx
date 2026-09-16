import { useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";

export function ConjugationPage() {
  const { t, language } = useTranslation();
  const [appliesToFilter, setAppliesToFilter] = useState("all");

  const appliesToOptions = useMemo(
    () => Array.from(new Set(dataset.conjugationRules.map((r) => r.appliesTo))),
    [],
  );

  const filtered = useMemo(
    () => dataset.conjugationRules.filter((r) => appliesToFilter === "all" || r.appliesTo === appliesToFilter),
    [appliesToFilter],
  );

  if (dataset.conjugationRules.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.conjugation")} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.conjugation")} description={`${filtered.length} / ${dataset.conjugationRules.length} rules`} />

      <div className="kanji-filters">
        <label>
          {t("common.filter")}:{" "}
          <select value={appliesToFilter} onChange={(e) => setAppliesToFilter(e.target.value)}>
            <option value="all">{t("common.all")}</option>
            {appliesToOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.map((r) => (
        <section key={r.id} className="card" style={{ marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>
            {r.appliesTo} — <span className="jp-text">{r.form}</span>
          </h2>
          <p>{localizedText(r.explanation, language)}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {r.examples.map((ex, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)" }}>
                    {ex.surface}
                  </td>
                  {ex.reading && (
                    <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                      {ex.reading}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {r.exceptions && r.exceptions.length > 0 && (
            <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
              Exceptions: {r.exceptions.join("; ")}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
