import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, getAthlete } from "@/data/seed";
import { liveFeed, providersSeed } from "@/data/integrations";
import { readinessBreakdown } from "@/lib/ai-engines";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUI } from "@/store/ui";
import { toast } from "sonner";
import { Radio, AlertTriangle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/workspace/scientist")({
  head: () => ({ meta: [{ title: "Sports Scientist Workspace · USI" }] }),
  component: ScientistWorkspace,
});

function ScientistWorkspace() {
  const { openPanel } = useUI();
  const grid = athletes.slice(0, 9);
  const anomalies = athletes.slice(0, 20).map(a => ({ a, asym: 4 + (a.weight % 14), trigger: readinessBreakdown(a).light !== "green" })).filter(x => x.asym > 10 || x.trigger).slice(0, 6);

  return (
    <div>
      <PageHeader title="Sports Scientist Workspace" subtitle="Wearables feed · biomechanics · anomaly triage" />
      <div className="grid grid-cols-12 gap-3 p-6">
        {/* Live feed */}
        <div className="col-span-12 lg:col-span-4 surface p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-primary animate-pulse" /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Live wearables feed</span></div>
            <span className="text-[10px] font-mono text-[color:var(--success)]">● streaming</span>
          </div>
          <div className="space-y-1 max-h-[480px] overflow-y-auto">
            {liveFeed.map((m, i) => {
              const a = getAthlete(m.athleteId);
              const p = providersSeed.find(p => p.id === m.provider);
              return (
                <button key={i} onClick={() => a && openPanel("athlete", a.id)} className="w-full grid grid-cols-[1fr_auto] gap-2 px-2 py-1.5 rounded hover:bg-accent/40 text-left">
                  <div className="min-w-0">
                    <div className="text-[11px] truncate">{a?.name}</div>
                    <div className="text-[9px] font-mono text-muted-foreground truncate">{p?.name} · {m.metric}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[12px]">{m.value} <span className="text-[9px] text-muted-foreground">{m.unit}</span></div>
                    <div className="text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(m.ts), { addSuffix: true })}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* HRV / sleep / load grid */}
        <div className="col-span-12 lg:col-span-5 surface p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">HRV / Sleep / Load — last 60d</div>
          <div className="grid grid-cols-3 gap-2">
            {grid.map(a => (
              <button key={a.id} onClick={() => openPanel("athlete", a.id)} className="bg-card border border-border rounded p-2 text-left hover:border-primary/50">
                <div className="text-[11px] truncate font-medium">{a.name}</div>
                <div className="text-[9px] text-muted-foreground font-mono">{a.sport}</div>
                <div className="mt-1.5 space-y-1">
                  <Sparkline data={a.hrv} color="var(--color-chart-2)" height={20} />
                  <Sparkline data={a.sleep} color="var(--color-chart-3)" height={20} />
                  <Sparkline data={a.load} color="var(--color-chart-1)" height={20} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Anomaly queue */}
        <div className="col-span-12 lg:col-span-3 surface p-3 space-y-2">
          <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-[color:var(--warning)]" /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Anomaly queue</span></div>
          {anomalies.map(({ a, asym }) => (
            <div key={a.id} className="bg-card border border-border rounded p-2 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="truncate">{a.name}</span>
                <Badge variant="outline" className="text-[9px] text-[color:var(--warning)]">{asym}%</Badge>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">L/R force asymmetry · last session</div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => { toast.success(`Flagged ${a.name} for review`); }}>Flag</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] flex-1 gap-1" onClick={() => { toast.success(`Pushed to coach`); }}>
                  <Send className="w-2.5 h-2.5" /> Push
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Force-plate table */}
        <div className="col-span-12 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Force-plate asymmetry (last 7d)</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">Athlete</th><th className="text-right pb-2">CMJ L</th><th className="text-right pb-2">CMJ R</th><th className="text-right pb-2">LSI</th><th className="text-right pb-2">RFD L</th><th className="text-right pb-2">RFD R</th><th className="text-right pb-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {athletes.slice(0, 8).map((a, i) => {
                const lsi = 88 + (i % 12);
                return (
                  <tr key={a.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => openPanel("athlete", a.id)}>
                    <td className="py-1.5">{a.name}</td>
                    <td className="py-1.5 text-right font-mono">{(36 + i).toFixed(1)}</td>
                    <td className="py-1.5 text-right font-mono">{(34 + i).toFixed(1)}</td>
                    <td className={`py-1.5 text-right font-mono ${lsi < 90 ? "text-[color:var(--warning)]" : "text-[color:var(--success)]"}`}>{lsi}%</td>
                    <td className="py-1.5 text-right font-mono">{(4200 - i * 50)}</td>
                    <td className="py-1.5 text-right font-mono">{(4100 - i * 60)}</td>
                    <td className="py-1.5 text-right"><Badge variant="outline" className="text-[9px]">{lsi < 90 ? "Review" : "OK"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
