import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { NAV_ITEMS } from "./routes";
import { useThemeEffect } from "./useThemeEffect";
import { ToriiMark } from "../components/ToriiMark";
import "./layout.css";

export function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useThemeEffect();

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("q");
    if (typeof value === "string" && value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <div className="app-shell">
      <a className="visually-hidden" href="#main-content">
        Skip to content
      </a>
      <nav className="app-nav" aria-label={t("app.title")}>
        <div className="app-nav__brand">
          <ToriiMark className="app-nav__brand-mark" />
          <span className="app-nav__title">{t("app.title")}</span>
        </div>
        <form role="search" onSubmit={handleSearchSubmit} className="app-nav__search">
          <span className="app-nav__search-icon" aria-hidden="true">
            🔍
          </span>
          <input type="search" name="q" placeholder={t("search.placeholder")} aria-label={t("search.title")} />
        </form>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} end={item.path === "/"}>
                <span className="app-nav__icon jp-text" aria-hidden="true">
                  {item.icon}
                </span>
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
