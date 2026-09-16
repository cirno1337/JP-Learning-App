/** Small original torii-gate glyph used as the app's brand mark. */
export function ToriiMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="32"
      height="32"
      role="img"
      aria-label="Torii gate"
    >
      <rect x="4" y="10" width="40" height="5" rx="1.5" fill="currentColor" />
      <rect x="2" y="17" width="6" height="4" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="40" y="17" width="6" height="4" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="10" y="14" width="5" height="30" rx="1.5" fill="currentColor" />
      <rect x="33" y="14" width="5" height="30" rx="1.5" fill="currentColor" />
      <rect x="8" y="24" width="32" height="4" rx="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
