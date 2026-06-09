interface Props { data: number[]; color?: string; height?: number; width?: number }
export function Sparkline({ data, color = "var(--color-primary)", height = 28, width = 120 }: Props) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(0.001, max - min);
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.4} />
    </svg>
  );
}
