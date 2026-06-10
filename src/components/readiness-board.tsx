import { athletes } from "@/data/seed";
import { readinessBreakdown } from "@/lib/ai-engines";
import { useUI } from "@/store/ui";
import { Activity } from "lucide-react";

export function ReadinessBoard({ limit = 12 }: { limit?: number }) {
  const { openPanel } = useUI();
  const rows = athletes.slice(0, limit).map(a => ({ a, ...readinessBreakdown(a) }));
  return (
    <div className="surface p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Readiness Engine</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Daily traffic-light</span>
      </div>
      <div className="space-y-1">
        {rows.map(({ a, score, light, confidence, contributions }) => {
          const color = light === "green" ? "bg-[color:var(--success)]" : light === "amber" ? "bg-[color:var(--warning)]" : "bg-[color:var(--danger)]";
          return (
            <button key={a.id} onClick={() => openPanel("athlete", a.id)} className="w-full grid grid-cols-[10px_1fr_auto] items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/40 text-left">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <div className="min-w-0">
                <div className="text-[12px] truncate">{a.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  {contributions.map(c => `${c.label} ${c.value}`).join(" · ")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[13px]">{score}</div>
                <div className="text-[9px] text-muted-foreground">±{100 - confidence}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
