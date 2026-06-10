import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, mealPlanTemplate } from "@/data/seed";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUI } from "@/store/ui";
import { toast } from "sonner";
import { Send, Droplets } from "lucide-react";

export const Route = createFileRoute("/workspace/nutritionist")({
  head: () => ({ meta: [{ title: "Nutritionist Workspace · USI" }] }),
  component: NutritionistWorkspace,
});

function NutritionistWorkspace() {
  const { openPanel } = useUI();
  const roster = athletes.slice(0, 24).map(a => ({
    a,
    compliance: 70 + (a.weight % 30),
    proteinDeficit: Math.max(0, Math.round(a.weight * 1.8) - Math.round(a.weight * 1.6 - (a.age % 10) * 2)),
    hydration: 75 + (a.height % 20),
  }));
  const leaders = [...roster].sort((x,y) => y.compliance - x.compliance).slice(0, 8);
  const laggards = [...roster].sort((x,y) => x.compliance - y.compliance).slice(0, 6);
  const lowHydration = roster.filter(r => r.hydration < 85);
  const avgCompliance = Math.round(roster.reduce((s,r) => s + r.compliance, 0) / roster.length);

  return (
    <div>
      <PageHeader title="Nutritionist Workspace" subtitle="Macro compliance · meal plans · hydration alerts" />
      <div className="grid grid-cols-4 gap-3 px-6 pt-4">
        <KpiCard label="Avg compliance" value={`${avgCompliance}%`} tone={avgCompliance > 80 ? "ok" : "warn"} />
        <KpiCard label="Protein gaps" value={roster.filter(r => r.proteinDeficit > 10).length} tone="warn" />
        <KpiCard label="Hydration alerts" value={lowHydration.length} tone="bad" />
        <KpiCard label="Plans active" value={roster.length} />
      </div>

      <div className="grid grid-cols-12 gap-3 p-6">
        {/* Leaderboard */}
        <div className="col-span-12 lg:col-span-4 surface p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Compliance leaderboard</div>
          <div className="space-y-1">
            {leaders.map(({ a, compliance }, i) => (
              <button key={a.id} onClick={() => openPanel("athlete", a.id)} className="w-full grid grid-cols-[20px_1fr_auto] gap-2 items-center px-2 py-1.5 rounded hover:bg-accent/40 text-left">
                <span className="text-[10px] font-mono text-muted-foreground">#{i+1}</span>
                <span className="text-[12px] truncate">{a.name}</span>
                <span className="font-mono text-[12px] text-[color:var(--success)]">{compliance}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Macro deficits */}
        <div className="col-span-12 lg:col-span-5 surface p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Macro deficits — needs intervention</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">Athlete</th><th className="text-right pb-2">Compliance</th><th className="text-right pb-2">Protein gap</th><th className="text-right pb-2">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {laggards.map(({ a, compliance, proteinDeficit }) => (
                <tr key={a.id} className="hover:bg-accent/30">
                  <td className="py-1.5 cursor-pointer" onClick={() => openPanel("athlete", a.id)}>{a.name}</td>
                  <td className={`py-1.5 text-right font-mono ${compliance < 75 ? "text-[color:var(--danger)]" : "text-[color:var(--warning)]"}`}>{compliance}%</td>
                  <td className="py-1.5 text-right font-mono">-{proteinDeficit}g</td>
                  <td className="py-1.5 text-right">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => toast.success(`Plan sent to ${a.name}`)}>
                      <Send className="w-2.5 h-2.5" /> Send plan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hydration */}
        <div className="col-span-12 lg:col-span-3 surface p-3 space-y-2">
          <div className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-[color:var(--chart-2)]" /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Hydration alerts</span></div>
          {lowHydration.slice(0, 6).map(({ a, hydration }) => (
            <div key={a.id} className="bg-card border border-border rounded p-2">
              <div className="flex justify-between text-[11px]">
                <span className="truncate">{a.name}</span>
                <span className="font-mono text-[color:var(--warning)]">{hydration}%</span>
              </div>
              <div className="h-1 bg-secondary rounded overflow-hidden mt-1">
                <div className="h-full bg-[color:var(--warning)]" style={{ width: `${hydration}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Meal plan template */}
        <div className="col-span-12 surface p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Daily plan template — endurance preset</div>
            <Button size="sm" className="h-7 text-[11px]" onClick={() => toast.success("Plan assigned to 24 athletes")}>Assign to squad</Button>
          </div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">Meal</th><th className="text-right pb-2">kcal</th><th className="text-right pb-2">Protein</th><th className="text-right pb-2">Carbs</th><th className="text-right pb-2">Fat</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mealPlanTemplate.map(m => (
                <tr key={m.meal}>
                  <td className="py-1.5">{m.meal}</td>
                  <td className="py-1.5 text-right font-mono">{m.kcal}</td>
                  <td className="py-1.5 text-right font-mono">{m.p}g</td>
                  <td className="py-1.5 text-right font-mono">{m.c}g</td>
                  <td className="py-1.5 text-right font-mono">{m.f}g</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border font-medium">
                <td className="py-1.5">Total</td>
                <td className="py-1.5 text-right font-mono">{mealPlanTemplate.reduce((s,m) => s+m.kcal,0)}</td>
                <td className="py-1.5 text-right font-mono">{mealPlanTemplate.reduce((s,m) => s+m.p,0)}g</td>
                <td className="py-1.5 text-right font-mono">{mealPlanTemplate.reduce((s,m) => s+m.c,0)}g</td>
                <td className="py-1.5 text-right font-mono">{mealPlanTemplate.reduce((s,m) => s+m.f,0)}g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
