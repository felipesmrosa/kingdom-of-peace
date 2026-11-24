/** Gráficos simples em SVG, sem biblioteca. As cores vêm das variáveis do tema. */

export type LinePoint = { label: string; value: number };

export function LineChart({
  points,
  unit,
  title,
}: {
  points: LinePoint[];
  unit: string;
  title: string;
}) {
  if (points.length === 0) return null;
  const w = 320;
  const h = 170;
  const pl = 40;
  const pr = 14;
  const pt = 14;
  const pb = 26;

  const vals = points.map((p) => p.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) {
    min = Math.max(0, min - 5);
    max = max + 5;
  }
  const margin = (max - min) * 0.15;
  min = Math.max(0, min - margin);
  max = max + margin;

  const x = (i: number) =>
    points.length === 1 ? pl + (w - pl - pr) / 2 : pl + (i * (w - pl - pr)) / (points.length - 1);
  const y = (v: number) => pt + (h - pt - pb) * (1 - (v - min) / (max - min));
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const fmtV = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ","));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${title}: de ${fmtV(points[0].value)} ${unit} em ${points[0].label} para ${fmtV(
        points[points.length - 1].value
      )} ${unit} em ${points[points.length - 1].label}`}
      className="w-full"
    >
      {[0, 0.5, 1].map((t) => {
        const yy = pt + (h - pt - pb) * t;
        return <line key={t} x1={pl} x2={w - pr} y1={yy} y2={yy} stroke="var(--line)" strokeWidth="1" />;
      })}
      <text x={pl - 6} y={y(max) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
        {fmtV(Math.round(max))}
      </text>
      <text x={pl - 6} y={y(min) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
        {fmtV(Math.round(min))}
      </text>
      {points.length > 1 && (
        <path d={path} fill="none" stroke="var(--royal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {points.map((p, i) => (
        <circle
          key={`${p.label}-${i}`}
          cx={x(i)}
          cy={y(p.value)}
          r={i === points.length - 1 ? 5.5 : 3.5}
          fill={i === points.length - 1 ? "var(--saffron)" : "var(--royal)"}
          stroke="var(--surface)"
          strokeWidth="2"
        />
      ))}
      <text x={x(0)} y={h - 6} textAnchor={points.length === 1 ? "middle" : "start"} fontSize="11" fill="var(--muted)">
        {points[0].label}
      </text>
      {points.length > 1 && (
        <text x={x(points.length - 1)} y={h - 6} textAnchor="end" fontSize="11" fill="var(--muted)">
          {points[points.length - 1].label}
        </text>
      )}
    </svg>
  );
}

export type Bar = { label: string; value: number; highlight?: boolean };

export function BarChart({ bars, title }: { bars: Bar[]; title: string }) {
  const w = 320;
  const h = 150;
  const pb = 24;
  const pt = 18;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const slot = w / bars.length;
  const bw = Math.min(28, slot - 10);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${title}: ${bars.map((b) => `${b.label} ${b.value}`).join(", ")}`}
      className="w-full"
    >
      <line x1="0" x2={w} y1={h - pb} y2={h - pb} stroke="var(--line)" strokeWidth="1" />
      {bars.map((b, i) => {
        const bh = ((h - pb - pt) * b.value) / max;
        const cx = slot * i + slot / 2;
        return (
          <g key={b.label}>
            <rect
              x={cx - bw / 2}
              y={h - pb - Math.max(bh, b.value > 0 ? 4 : 0)}
              width={bw}
              height={Math.max(bh, b.value > 0 ? 4 : 0)}
              rx="6"
              fill={b.highlight ? "var(--saffron)" : "var(--royal)"}
              opacity={b.value === 0 ? 0.25 : 1}
            />
            {b.value > 0 && (
              <text x={cx} y={h - pb - bh - 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
                {b.value}
              </text>
            )}
            <text x={cx} y={h - 7} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
