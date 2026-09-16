import { useCallback } from "react";
import { useProgress } from "../features/progress/ProgressContext";
import { translations, type TranslationKey } from "./translations";
import type { UiLanguage } from "../lib/storage/types";

export function useTranslation() {
  const { state, updateSettings } = useProgress();
  const language = state.settings.uiLanguage;

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) {
        console.warn(`Missing translation key: ${key}`);
        return key;
      }
      return entry[language] ?? entry.en;
    },
    [language],
  );

  const setLanguage = useCallback(
    (next: UiLanguage) => updateSettings({ uiLanguage: next }),
    [updateSettings],
  );

  return { t, language, setLanguage };
}
