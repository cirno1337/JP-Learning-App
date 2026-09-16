/** Decorative scattered sakura-blossom motif for hero/banner backgrounds. */
function Blossom({ x, y, size, rotate, opacity }: { x: number; y: number; size: number; rotate: number; opacity: number }) {
  // A single petal: a rounded diamond with a notch at its outer tip,
  // repeated five times around the center to read as a sakura flower.
  const petal = `M0 0 Q ${size * 0.55} ${-size * 0.25} ${size * 0.18} ${-size * 0.95}
    Q 0 ${-size * 1.05} ${-size * 0.18} ${-size * 0.95}
    Q ${-size * 0.55} ${-size * 0.25} 0 0 Z`;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity} fill="currentColor">
      {[0, 72, 144, 216, 288].map((angle) => (
        <path key={angle} d={petal} transform={`rotate(${angle})`} />
      ))}
      <circle r={size * 0.16} fill="currentColor" />
    </g>
  );
}

export function SakuraPetals({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Blossom x={40} y={35} size={16} rotate={10} opacity={0.55} />
      <Blossom x={130} y={95} size={10} rotate={-20} opacity={0.35} />
      <Blossom x={230} y={28} size={20} rotate={35} opacity={0.4} />
      <Blossom x={310} y={80} size={13} rotate={-8} opacity={0.3} />
      <Blossom x={365} y={30} size={11} rotate={50} opacity={0.4} />
      <Blossom x={80} y={130} size={12} rotate={70} opacity={0.3} />
      <Blossom x={270} y={135} size={9} rotate={-40} opacity={0.35} />
    </svg>
  );
}
