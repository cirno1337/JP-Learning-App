import type { ReactNode } from "react";

export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header style={{ marginBottom: "var(--space-5)" }}>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{title}</h1>
      {description && (
        <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>{description}</p>
      )}
    </header>
  );
}
