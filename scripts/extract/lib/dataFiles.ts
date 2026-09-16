import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Recursively reads every .json file under `dir` and returns their parsed contents flattened. */
export function readAllJson<T>(dir: string): T[] {
  if (!existsSync(dir)) return [];
  const out: T[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...readAllJson<T>(full));
    } else if (entry.name.endsWith(".json")) {
      const parsed = JSON.parse(readFileSync(full, "utf8"));
      // Most content files hold an array of entries; per-lesson files (one
      // Lesson object per file) hold a single object instead — accept both.
      if (Array.isArray(parsed)) out.push(...(parsed as T[]));
      else out.push(parsed as T);
    }
  }
  return out;
}

export function writeJson(path: string, data: unknown): void {
  const dir = path.split("/").slice(0, -1).join("/");
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}
