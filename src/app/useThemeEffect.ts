import { useEffect } from "react";
import { useProgress } from "../features/progress/ProgressContext";

/** Applies the user's theme preference to the document root as data-theme. */
export function useThemeEffect() {
  const { state } = useProgress();
  const theme = state.settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);
}
