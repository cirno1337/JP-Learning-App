import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { progressStore, exportProgressJson, importProgressJson } from "../../lib/storage/progressStore";
import type { AnswerOutcome, ItemStats, ProgressState, UserSettings } from "../../lib/storage/types";
import { applyAnswerOutcome, createItemStats } from "../../lib/srs";

interface ProgressContextValue {
  state: ProgressState;
  recordAttempt: (params: {
    itemId: string;
    category: string;
    outcome: AnswerOutcome;
    direction?: "jp-to-en" | "en-to-jp" | "reading" | "meaning";
  }) => void;
  getItemStats: (itemId: string) => ItemStats;
  setMarkedKnown: (itemId: string, known: boolean) => void;
  setMarkedDifficult: (itemId: string, difficult: boolean) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  exportProgress: () => string;
  importProgress: (json: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function computeStreak(previous: ProgressState, now: Date): number {
  if (!previous.lastStudiedAt) return 1;
  const last = new Date(previous.lastStudiedAt);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - last.getTime()) / dayMs);
  if (diffDays <= 0) return previous.currentStreak ?? 1;
  if (diffDays === 1) return (previous.currentStreak ?? 0) + 1;
  return 1;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => progressStore.load());

  useEffect(() => {
    progressStore.save(state);
  }, [state]);

  const getItemStats = useCallback(
    (itemId: string): ItemStats => state.itemStats[itemId] ?? createItemStats(itemId),
    [state.itemStats],
  );

  const recordAttempt = useCallback<ProgressContextValue["recordAttempt"]>(
    ({ itemId, category, outcome, direction }) => {
      const now = new Date();
      setState((prev) => {
        const current = prev.itemStats[itemId] ?? createItemStats(itemId);
        const updatedStats = applyAnswerOutcome(current, outcome, now);
        return {
          ...prev,
          itemStats: { ...prev.itemStats, [itemId]: updatedStats },
          attempts: [
            ...prev.attempts,
            { itemId, category, outcome, direction, timestamp: now.toISOString() },
          ],
          lastStudiedAt: now.toISOString(),
          currentStreak: computeStreak(prev, now),
        };
      });
    },
    [],
  );

  const setMarkedKnown = useCallback((itemId: string, known: boolean) => {
    setState((prev) => {
      const current = prev.itemStats[itemId] ?? createItemStats(itemId);
      return {
        ...prev,
        itemStats: { ...prev.itemStats, [itemId]: { ...current, markedKnown: known } },
      };
    });
  }, []);

  const setMarkedDifficult = useCallback((itemId: string, difficult: boolean) => {
    setState((prev) => {
      const current = prev.itemStats[itemId] ?? createItemStats(itemId);
      return {
        ...prev,
        itemStats: { ...prev.itemStats, [itemId]: { ...current, markedDifficult: difficult } },
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const exportProgress = useCallback(() => exportProgressJson(state), [state]);

  const importProgress = useCallback((json: string) => {
    const imported = importProgressJson(json);
    setState(imported);
  }, []);

  const resetProgress = useCallback(() => {
    progressStore.reset();
    setState(progressStore.load());
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      recordAttempt,
      getItemStats,
      setMarkedKnown,
      setMarkedDifficult,
      updateSettings,
      exportProgress,
      importProgress,
      resetProgress,
    }),
    [state, recordAttempt, getItemStats, setMarkedKnown, setMarkedDifficult, updateSettings, exportProgress, importProgress, resetProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
