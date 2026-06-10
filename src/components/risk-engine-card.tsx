import type { RiskBreakdown } from "@/lib/ai-engines";
import { ShieldAlert } from "lucide-react";

export function RiskEngineCard({ name, data, compact = false }: { name?: string; data: RiskBreakdown; compact?: boolean }) {
  const tone =
    data.level === "Critical" ? "text-[color:var(--danger)]" :
    data.level === "High" ? "text-[color:var(--danger)]" :
    data.level === "Moderate" ? "text-[color:var(--warning)]" : "text-[color:var(--success)]";
  return (
    <div className="surface p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Risk Engine</span>
        </div>
        <div className={`font-mono text-base ${tone}`}>{data.score}<span className="text-[10px] text-muted-foreground ml-1">{data.level}</span></div>
      </div>
      {name && <div className="text-[12px] font-medium truncate">{name}</div>}
      <div className="space-y-1.5">
        {data.drivers.slice(0, compact ? 2 : 4).map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-mono">{d.value} <span className="text-muted-foreground">+{d.weight}</span></span>
            </div>
            <div className="h-1 bg-secondary rounded overflow-hidden mt-0.5">
              <div className="h-full bg-primary/70" style={{ width: `${Math.min(100, d.weight * 2.5)}%` }} />
            </div>
            {!compact && <div className="text-[10px] text-muted-foreground mt-0.5">{d.note}</div>}
          </div>
        ))}
      </div>
      {!compact && (
        <div className="pt-2 border-t border-border space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recommended mitigations</div>
          {data.mitigations.map((m, i) => (
            <div key={i} className="text-[11px] flex gap-1.5"><span className="text-primary">›</span>{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}
