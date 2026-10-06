/**
 * The handful separated by volume (p-m1 observe step), drawn as a graduated
 * cylinder. An idealised moist loam, with the real range beside it.
 */
const LAYERS = [
  { id: "mineral", label: "Mineral grains", pct: 45, fill: "comp-mineral" },
  { id: "organic", label: "Organic matter", pct: 5, fill: "comp-organic" },
  { id: "water", label: "Water", pct: 25, fill: "comp-water" },
  { id: "air", label: "Air", pct: 25, fill: "comp-air" },
];

export function Composition({ guess, reveal }: { guess: number | undefined; reveal: boolean }) {
  const H = 260;
  const top = 20;
  const x0 = 120;
  const cw = 120;
  const y = (pct: number) => top + H - (pct / 100) * H;
  let acc = 0;
  return (
    <figure className="composition">
      <svg
        viewBox="0 0 420 320"
        role="img"
        aria-label="A graduated cylinder: 45 % mineral, 5 % organic matter, 25 % water, 25 % air. The solid share in typical topsoil ranges from about 40 to 60 %."
      >
        {/* scale */}
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p}>
            <line x1={x0 - 8} x2={x0} y1={y(p)} y2={y(p)} className="axis" />
            <text x={x0 - 14} y={y(p) + 4} className="axis-label" textAnchor="end">
              {p} %
            </text>
          </g>
        ))}
        {/* layers */}
        {LAYERS.map((l, i) => {
          const from = acc;
          acc += l.pct;
          return (
            <g key={l.id} className="layer" data-reveal={reveal} style={{ transitionDelay: `${i * 260}ms` }}>
              <rect x={x0} y={y(acc)} width={cw} height={(l.pct / 100) * H} className={l.fill} />
              <line
                x1={x0 + cw}
                x2={x0 + cw + 18}
                y1={y((from + acc) / 2)}
                y2={y((from + acc) / 2)}
                className="leader"
              />
              <text x={x0 + cw + 24} y={y((from + acc) / 2) + 4} className="layer-label">
                {l.label} <tspan className="mono">{l.pct} %</tspan>
              </text>
            </g>
          );
        })}
        {/* the real range for solids */}
        <rect x={x0 - 4} y={y(60)} width={4} height={y(40) - y(60)} className="range" />
        <rect x={x0} y={top} width={cw} height={H} className="cylinder" />
        <line x1={x0} x2={x0 + cw} y1={y(50)} y2={y(50)} className="solid-line" data-reveal={reveal} />
        {guess !== undefined && (
          <g className="guess">
            <line x1={x0 - 30} x2={x0 + cw + 6} y1={y(guess)} y2={y(guess)} />
            <circle cx={x0 - 30} cy={y(guess)} r={5} />
            <text x={x0 - 38} y={y(guess) - 8} textAnchor="end">
              Your guess {guess} %
            </text>
          </g>
        )}
      </svg>
      <figcaption>
        Idealised moist loam. Real topsoils run about 40–60 % solid (the bar on the scale), and the water/air
        split changes with every rain.
      </figcaption>
    </figure>
  );
}
