import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { NAV_ITEMS } from "./routes";
import { useThemeEffect } from "./useThemeEffect";
import "./layout.css";

export function Layout() {
  const { t } = useTranslation();
  useThemeEffect();

  return (
    <div className="app-shell">
      <a className="visually-hidden" href="#main-content">
        Skip to content
      </a>
      <nav className="app-nav" aria-label={t("app.title")}>
        <div className="app-nav__title">{t("app.title")}</div>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} end={item.path === "/"}>
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main-content" className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
