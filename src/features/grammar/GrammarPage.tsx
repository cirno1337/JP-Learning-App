import { useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";

export function GrammarPage() {
  const { t, language } = useTranslation();
  const [lessonFilter, setLessonFilter] = useState("all");

  const filtered = useMemo(
    () => dataset.grammar.filter((g) => lessonFilter === "all" || g.lessonIds.includes(lessonFilter)),
    [lessonFilter],
  );

  const lessonsWithGrammar = useMemo(
    () => dataset.lessons.filter((l) => dataset.grammar.some((g) => g.lessonIds.includes(l.id))),
    [],
  );

  if (dataset.grammar.length === 0) {
    return (
      <div>
        <PageHeader title={t("nav.grammar")} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.grammar")} description={`${filtered.length} / ${dataset.grammar.length} patterns`} />

      <div className="kanji-filters">
        <label>
          {t("common.lesson")}:{" "}
          <select value={lessonFilter} onChange={(e) => setLessonFilter(e.target.value)}>
            <option value="all">{t("common.all")}</option>
            {lessonsWithGrammar.map((l) => (
              <option key={l.id} value={l.id}>
                {localizedText(l.title, language)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.map((g) => (
        <section key={g.id} className="card" style={{ marginBottom: "var(--space-4)" }}>
          <h2 className="jp-text" style={{ fontSize: "1.2rem", marginTop: 0 }}>
            {g.pattern}
          </h2>
          <p>{localizedText(g.explanation, language)}</p>

          {g.particles && g.particles.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "var(--space-3)" }}>
              <tbody>
                {g.particles.map((p, i) => {
                  const ex = g.examples.find((e) => e.id === p.exampleSentenceId);
                  return (
                    <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                      <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", fontWeight: 600 }}>
                        {p.particle}
                      </td>
                      <td style={{ padding: "var(--space-1) var(--space-2)" }}>{localizedText(p.meaning, language)}</td>
                      {ex && (
                        <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)", color: "var(--color-text-muted)" }}>
                          {ex.japanese}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {g.examples.length > 0 && (
            <details>
              <summary style={{ cursor: "pointer", color: "var(--color-text-muted)" }}>
                {g.examples.length} example{g.examples.length === 1 ? "" : "s"}
              </summary>
              <ul>
                {g.examples.map((ex) => (
                  <li key={ex.id} className="jp-text" style={{ marginBottom: "var(--space-2)" }}>
                    {ex.japanese}
                    {ex.reading && <span style={{ color: "var(--color-text-muted)" }}> ({ex.reading})</span>}
                    <br />
                    <span style={{ fontFamily: "var(--font-ui)" }}>{localizedText(ex.meanings, language)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="kanji-card__source" style={{ marginTop: "var(--space-3)" }}>
            {t("common.source")}: {g.source.map((s) => s.file + (s.page ? ` p.${s.page}` : "")).join("; ")}
          </p>
        </section>
      ))}
    </div>
  );
}
