import { EMPTY_PROGRESS, type ProgressState } from "./types";

/**
 * Persistence for user progress. Backed by localStorage: the progress state
 * itself (stats, attempts, settings) stays small (thousands of small
 * records at most) even though the content dataset itself is much larger,
 * so localStorage is sufficient — see spec section 47 ("do not prematurely
 * optimise"). The interface is deliberately narrow so a future IndexedDB
 * implementation could replace it without touching callers.
 */
export interface ProgressStore {
  load(): ProgressState;
  save(state: ProgressState): void;
  reset(): void;
}

const STORAGE_KEY = "jp-a2-app:progress";

function isProgressState(value: unknown): value is ProgressState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "number" &&
    typeof v.itemStats === "object" &&
    Array.isArray(v.attempts) &&
    Array.isArray(v.sessions) &&
    typeof v.settings === "object"
  );
}

class LocalStorageProgressStore implements ProgressStore {
  load(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(EMPTY_PROGRESS);
      const parsed = JSON.parse(raw);
      if (!isProgressState(parsed)) {
        console.warn("Corrupted progress data found; resetting to defaults.");
        return structuredClone(EMPTY_PROGRESS);
      }
      return { ...structuredClone(EMPTY_PROGRESS), ...parsed };
    } catch (err) {
      console.warn("Failed to load progress data; resetting to defaults.", err);
      return structuredClone(EMPTY_PROGRESS);
    }
  }

  save(state: ProgressState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save progress data.", err);
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to reset progress data.", err);
    }
  }
}

export const progressStore: ProgressStore = new LocalStorageProgressStore();

export function exportProgressJson(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function importProgressJson(json: string): ProgressState {
  const parsed = JSON.parse(json);
  if (!isProgressState(parsed)) {
    throw new Error("The selected file does not look like a valid progress export.");
  }
  return { ...structuredClone(EMPTY_PROGRESS), ...parsed };
}
