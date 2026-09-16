import { useRef } from "react";
import { PageHeader } from "../../components/PageHeader";
import { useTranslation } from "../../i18n/useTranslation";
import { useProgress } from "../progress/ProgressContext";
import type { ThemePreference, UiLanguage } from "../../lib/storage/types";

export function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { state, updateSettings, exportProgress, importProgress, resetProgress } = useProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `japanese-a2-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importProgress(text);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to import progress file.");
    } finally {
      event.target.value = "";
    }
  }

  function handleReset() {
    if (confirm(t("settings.resetConfirm"))) {
      resetProgress();
    }
  }

  return (
    <div>
      <PageHeader title={t("nav.settings")} />

      <section className="card" style={{ marginBottom: "var(--space-4)" }}>
        <label htmlFor="ui-language" style={{ display: "block", marginBottom: "var(--space-2)" }}>
          {t("settings.uiLanguage")}
        </label>
        <select
          id="ui-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as UiLanguage)}
        >
          <option value="en">English</option>
          <option value="pl">Polski</option>
        </select>
      </section>

      <section className="card" style={{ marginBottom: "var(--space-4)" }}>
        <label htmlFor="theme" style={{ display: "block", marginBottom: "var(--space-2)" }}>
          {t("settings.theme")}
        </label>
        <select
          id="theme"
          value={state.settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value as ThemePreference })}
        >
          <option value="system">{t("settings.themeSystem")}</option>
          <option value="light">{t("settings.themeLight")}</option>
          <option value="dark">{t("settings.themeDark")}</option>
        </select>
      </section>

      <section className="card" style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={handleExport}>
          {t("settings.exportProgress")}
        </button>
        <button type="button" className="btn" onClick={handleImportClick}>
          {t("settings.importProgress")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="visually-hidden"
        />
        <button type="button" className="btn" onClick={handleReset}>
          {t("settings.resetProgress")}
        </button>
      </section>
    </div>
  );
}
