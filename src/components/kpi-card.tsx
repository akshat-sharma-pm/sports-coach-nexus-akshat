import { Sparkline } from "./sparkline";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  tone?: "ok" | "warn" | "bad" | "neutral";
  trend?: number[];
}
export function KpiCard({ label, value, unit, delta, tone = "neutral", trend }: Props) {
  const toneClass = tone === "ok" ? "text-[color:var(--success)]" : tone === "warn" ? "text-[color:var(--warning)]" : tone === "bad" ? "text-[color:var(--danger)]" : "text-foreground";
  return (
    <div className="surface p-4 flex flex-col gap-2 min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1">
        <div className={`font-mono text-2xl font-medium ${toneClass}`}>{value}</div>
        {unit && <div className="text-[11px] text-muted-foreground">{unit}</div>}
      </div>
      <div className="flex justify-between items-end">
        {delta && <div className={`text-[11px] font-mono ${toneClass}`}>{delta}</div>}
        {trend && <div className="flex-1 ml-2"><Sparkline data={trend} color="var(--color-primary)" /></div>}
      </div>
    </div>
  );
}
