import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, teams } from "@/data/seed";
import { acwr } from "@/lib/ai";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training · USI" }] }),
  component: Training,
});

const phases = ["Prep", "Pre-Comp", "Comp", "Comp", "Taper", "Recovery", "Prep", "Pre-Comp", "Comp", "Comp", "Taper", "Recovery"];

function Training() {
  const { openPanel } = useUI();
  const list = athletes.slice(0, 18);

  return (
    <div>
      <PageHeader title="Training & Periodisation" subtitle="Annual macrocycle view with athlete chronic load"
        actions={<Button asChild size="sm" className="h-8 gap-1"><Link to="/training/sessions/new"><Plus className="w-3.5 h-3.5" /> New session</Link></Button>}
      />

      <div className="p-6 space-y-4">
        <div className="surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Macrocycle — current quarter</div>
          <div className="grid grid-cols-12 gap-1">
            {phases.map((p, i) => (
              <div key={i} className="surface p-2 text-center">
                <div className="text-[9px] text-muted-foreground font-mono">W{i+1}</div>
                <div className="text-[11px] font-medium mt-1">{p}</div>
                <div className={`h-1 mt-1 rounded ${p === "Comp" ? "bg-[color:var(--danger)]" : p === "Taper" || p === "Recovery" ? "bg-[color:var(--success)]" : "bg-primary"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="surface">
          <div className="grid grid-cols-[180px_repeat(14,_minmax(0,1fr))_80px] text-[11px] border-b border-border bg-secondary/40">
            <div className="px-3 py-2 text-muted-foreground uppercase tracking-wider text-[10px]">Athlete</div>
            {Array.from({length:14}).map((_,i) => <div key={i} className="px-1 py-2 text-center text-muted-foreground font-mono text-[10px]">D{i+1}</div>)}
            <div className="px-2 py-2 text-right text-muted-foreground uppercase tracking-wider text-[10px]">ACWR</div>
          </div>
          {list.map((a) => {
            const r = acwr(a);
            return (
              <div key={a.id} onClick={() => openPanel("athlete", a.id)}
                className="grid grid-cols-[180px_repeat(14,_minmax(0,1fr))_80px] items-center text-[11px] border-b border-border hover:bg-accent/30 cursor-pointer">
                <div className="px-3 py-2 truncate">{a.name} <span className="text-muted-foreground font-mono text-[10px]">{teams.find(t=>t.id===a.teamId)?.name}</span></div>
                {a.load.slice(-14).map((v, i) => {
                  const intensity = Math.min(1, v / 600);
                  return <div key={i} className="px-0.5 py-2"><div className="h-5 rounded-sm" style={{ background: `oklch(${0.30 + intensity*0.3} 0.10 ${260 - intensity*60})`, opacity: 0.4 + intensity*0.6 }} title={`${Math.round(v)} sRPE`} /></div>;
                })}
                <div className={`px-2 py-2 text-right font-mono ${r > 1.5 ? "text-[color:var(--danger)]" : r > 1.3 ? "text-[color:var(--warning)]" : ""}`}>{r}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
