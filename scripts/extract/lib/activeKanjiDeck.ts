import { extractPages } from "./pdftext";

/**
 * Parses the ordered list of "kanji of the week" (character + terse meaning)
 * out of an "ACTIVE KANJI — Set n°xx.pdf" slide deck.
 *
 * Each kanji gets one slide of the fixed shape (order of the surrounding
 * lines varies slightly, verified across sets 01-02):
 *
 *   ... "— Meaning —" ...
 *   <meaning line(s)>
 *   <the bare kanji character, alone on its own line>
 *   ... "日本語" ...
 *   <vocab lines...>
 *
 * This is used as ground truth for the kanji list itself (character +
 * canonical meaning), because the paired "KANJI SET synthesis" document
 * only gives a standalone line for kanji that are naturally standalone
 * words — kanji that are only ever taught via an inflected/compound form
 * (e.g. 大きい for 大, 切る for 切) never get a bare-character line there,
 * even though the slide deck always dedicates a full page to them.
 */

export interface ActiveKanjiEntry {
  character: string;
  meaning: string;
  page: number;
}

function isSingleCjk(s: string): boolean {
  return Array.from(s).length === 1 && /[㐀-鿿]/.test(s);
}

export function parseActiveKanjiDeck(pdfPath: string): ActiveKanjiEntry[] {
  const pages = extractPages(pdfPath);
  const entries: ActiveKanjiEntry[] = [];

  pages.forEach((pageText, idx) => {
    if (!pageText.includes("— Meaning —")) return;
    const lines = pageText.split("\n").map((l) => l.trim());
    const meaningIdx = lines.findIndex((l) => l === "— Meaning —");
    const meaningParts: string[] = [];
    let kanjiChar: string | null = null;
    for (let i = meaningIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      if (isSingleCjk(line)) {
        kanjiChar = line;
        break;
      }
      meaningParts.push(line);
    }
    if (kanjiChar) {
      // Lines are already comma-separated in the source; a wrapped meaning
      // just continues onto the next line, so join with a space (joining
      // with ", " would double up the comma already at the wrap point).
      const meaning = meaningParts.join(" ").replace(/\s+/g, " ").trim();
      entries.push({ character: kanjiChar, meaning, page: idx + 1 });
    }
  });

  return entries;
}
