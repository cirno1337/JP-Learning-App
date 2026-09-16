import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { dataset } from "../../data";
import { searchDataset, type SearchResultCategory } from "../../lib/search";
import "../kanji/kanji.css";

const CATEGORY_LABELS: Record<SearchResultCategory, string> = {
  kanji: "Kanji",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  numbers: "Numbers",
  kana: "Kana",
  lesson: "Lessons",
};

export function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const results = useMemo(() => searchDataset(dataset, query), [query]);

  const grouped = useMemo(() => {
    const map = new Map<SearchResultCategory, typeof results>();
    for (const r of results) {
      map.set(r.category, [...(map.get(r.category) ?? []), r]);
    }
    return map;
  }, [results]);

  return (
    <div>
      <PageHeader title={t("search.title")} description={query ? `${results.length} results for "${query}"` : undefined} />

      <input
        type="search"
        className="test-question__input jp-text"
        style={{ width: "100%", maxWidth: 480, marginBottom: "var(--space-4)" }}
        placeholder={t("search.placeholder")}
        defaultValue={query}
        autoFocus
        onChange={(e) => {
          const value = e.target.value;
          setSearchParams(value ? { q: value } : {}, { replace: true });
        }}
      />

      {query && results.length === 0 && <EmptyState message={t("search.noResults")} />}

      {Array.from(grouped.entries()).map(([category, items]) => (
        <section key={category} className="card" style={{ marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>
            {CATEGORY_LABELS[category]} ({items.length})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td className="jp-text" style={{ padding: "var(--space-1) var(--space-2)" }}>
                    {r.primary}
                    {r.secondary && <span style={{ color: "var(--color-text-muted)" }}> ({r.secondary})</span>}
                  </td>
                  <td style={{ padding: "var(--space-1) var(--space-2)" }}>{r.meaning}</td>
                  <td style={{ padding: "var(--space-1) var(--space-2)" }}>
                    <Link to={r.path}>
                      {t("search.viewIn")} {CATEGORY_LABELS[category]}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
