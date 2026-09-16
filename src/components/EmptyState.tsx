import type { ReactNode } from "react";
import { useTranslation } from "../i18n/useTranslation";

export function EmptyState({ message, children }: { message?: string; children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="card" role="status">
      <p style={{ color: "var(--color-text-muted)", margin: 0 }}>{message ?? t("common.noContentYet")}</p>
      {children}
    </div>
  );
}
