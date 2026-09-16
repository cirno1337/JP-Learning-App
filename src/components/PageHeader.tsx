import type { ReactNode } from "react";
import { SakuraPetals } from "./SakuraPetals";

export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header className="page-hero">
      <SakuraPetals className="page-hero__petals" />
      <div className="page-hero__content">
        <h1 className="page-hero__title">{title}</h1>
        {description && <p className="page-hero__description">{description}</p>}
      </div>
    </header>
  );
}
