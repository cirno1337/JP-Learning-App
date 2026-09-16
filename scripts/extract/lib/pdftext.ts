import { execFileSync } from "node:child_process";

/**
 * Thin wrapper around poppler's `pdftotext`. Plain (non `-layout`) mode is
 * used deliberately: for this project's cleanly-typeset "synthesis &
 * assignments" documents it produces one logical line per entry, which is
 * far easier to parse reliably than `-layout` mode's reading-order
 * reconstruction (which gets confused by the slide decks' furigana-over-kanji
 * positioning — see docs/source-inventory.md).
 *
 * pdftotext always separates pages with a form-feed character (\f, \x0c)
 * regardless of mode, which is what `extractPages` splits on to keep
 * per-page provenance.
 */

const LIGATURE_FIXES: Record<string, string> = {
  "ﬀ": "ff",
  "ﬁ": "fi",
  "ﬂ": "fl",
  "ﬃ": "ffi",
  "ﬄ": "ffl",
  // The "... synthesis & assignments.pdf" family embeds a font that maps the
  // "tt" and "ff" ligatures to Private Use Area codepoints instead of
  // standard Unicode, so pdftotext extracts them as unmapped PUA characters.
  // Confirmed by cross-checking known words split around them, e.g.
  // "hE009ps://" = "https://", "beE009er" = "better" (U+E009 = "tt"), and
  // "insuE007iciency" = "insufficiency", "seE009ing oE007" = "setting off"
  // (U+E007 = "ff"). No other PUA codepoints were found anywhere else in
  // the project's PDFs (checked across all ~80 files).
  "": "tt",
  "": "ff",
};

const LIGATURE_PATTERN = /[ﬀ-ﬄ]/g;

function fixLigatures(text: string): string {
  return text.replace(LIGATURE_PATTERN, (ch) => LIGATURE_FIXES[ch] ?? ch);
}

export function extractPages(pdfPath: string): string[] {
  const raw = execFileSync("pdftotext", [pdfPath, "-"], {
    maxBuffer: 1024 * 1024 * 64,
  }).toString("utf8");
  return raw.split("\f").map(fixLigatures);
}

export function extractLayoutPages(pdfPath: string): string[] {
  const raw = execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
    maxBuffer: 1024 * 1024 * 64,
  }).toString("utf8");
  return raw.split("\f").map(fixLigatures);
}

export function pageCount(pdfPath: string): number {
  const info = execFileSync("pdfinfo", [pdfPath]).toString("utf8");
  const match = info.match(/^Pages:\s*(\d+)/m);
  if (!match) throw new Error(`Could not determine page count for ${pdfPath}`);
  return Number(match[1]);
}
