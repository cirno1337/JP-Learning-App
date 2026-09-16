import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { localizedText } from "../../i18n/content";
import { dataset } from "../../data";

export function LessonReviewPage() {
  const { t, language } = useTranslation();
  return (
    <div>
      <PageHeader title={t("nav.lessonReview")} description={`${dataset.lessons.length} lessons`} />
      {dataset.lessons.length === 0 ? (
        <EmptyState />
      ) : (
        dataset.lessons.map((lesson) => {
          const itemCount = lesson.sections.reduce((sum, s) => sum + s.itemIds.length, 0);
          return (
            <Link
              key={lesson.id}
              to={`/lessons/${lesson.id}`}
              className="card"
              style={{ display: "block", marginBottom: "var(--space-3)", textDecoration: "none", color: "inherit" }}
            >
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{localizedText(lesson.title, language)}</h2>
              {lesson.description && (
                <p style={{ color: "var(--color-text-muted)", margin: "var(--space-1) 0 0" }}>
                  {localizedText(lesson.description, language)}
                </p>
              )}
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", margin: "var(--space-2) 0 0" }}>
                {lesson.sections.length} section{lesson.sections.length === 1 ? "" : "s"} · {itemCount} items
                {lesson.date ? ` · ${lesson.date}` : ""}
              </p>
            </Link>
          );
        })
      )}
    </div>
  );
}
