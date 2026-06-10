import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, teams, exerciseLibrary } from "@/data/seed";
import { acwr, injuryRiskScore, riskLevel } from "@/lib/ai";
import { readinessBreakdown } from "@/lib/ai-engines";
import { ReadinessBoard } from "@/components/readiness-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUI } from "@/store/ui";
import { useState } from "react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { CheckCircle2, Send, Calendar } from "lucide-react";

export const Route = createFileRoute("/workspace/coach")({
  head: () => ({ meta: [{ title: "Coach Workspace · USI" }] }),
  component: CoachWorkspace,
});

function CoachWorkspace() {
  const { openPanel } = useUI();
  const [intensity, setIntensity] = useState(7);
  const [approved, setApproved] = useState(false);
  const squad = athletes.slice(0, 18);
  const watch = squad.map(a => ({ a, risk: injuryRiskScore(a), acwr: acwr(a) })).sort((x,y) => y.risk - x.risk).slice(0, 6);
  const greens = squad.filter(a => readinessBreakdown(a).light === "green").length;
  const ambers = squad.filter(a => readinessBreakdown(a).light === "amber").length;
  const reds = squad.filter(a => readinessBreakdown(a).light === "red").length;

  return (
    <div>
      <PageHeader title="Coach Workspace" subtitle="Today's session · squad readiness · load oversight" />
      <div className="grid grid-cols-4 gap-3 px-6 pt-4">
        <KpiCard label="Squad ready" value={greens} unit={`/${squad.length}`} tone="ok" />
        <KpiCard label="Caution" value={ambers} tone="warn" />
        <KpiCard label="Hold back" value={reds} tone="bad" />
        <KpiCard label="Avg ACWR" value={(squad.reduce((s,a) => s + acwr(a), 0) / squad.length).toFixed(2)} />
      </div>

      <div className="grid grid-cols-12 gap-3 p-6">
        {/* Session card */}
        <div className="col-span-12 lg:col-span-5 surface p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Today's session · {teams[2].name}</div>
              <div className="text-[15px] font-semibold mt-0.5">Strength + Tactical 4v4</div>
              <div className="text-[10px] font-mono text-muted-foreground">17:00–18:45 · Pitch B · 24 athletes</div>
            </div>
            <Badge variant={approved ? "default" : "outline"} className="text-[10px]">{approved ? "Approved" : "Pending"}</Badge>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Target intensity (RPE): {intensity}</div>
            <input type="range" min={3} max={10} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-primary" />
            <div className="grid grid-cols-7 gap-1 mt-1">
              {[3,4,5,6,7,8,9].map(n => <div key={n} className={`text-center text-[10px] font-mono py-1 rounded ${n === intensity ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>{n}</div>)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Plan blocks</div>
            {exerciseLibrary.slice(0, 5).map(e => (
              <div key={e.id} className="flex justify-between text-[11px] border-b border-border pb-1">
                <span>{e.name}</span><span className="font-mono text-muted-foreground">{e.category}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="h-7 text-[11px] flex-1 gap-1" onClick={() => { setApproved(true); toast.success("Session plan approved & pushed to athletes"); }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve plan
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => toast("Reassigned to S&C lead")}>
              <Send className="w-3.5 h-3.5" /> Re-assign
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => toast("Session rescheduled")}>
              <Calendar className="w-3.5 h-3.5" /> Reschedule
            </Button>
          </div>
        </div>

        {/* Readiness heatmap */}
        <div className="col-span-12 lg:col-span-4">
          <ReadinessBoard limit={10} />
        </div>

        {/* ACWR watchlist */}
        <div className="col-span-12 lg:col-span-3 surface p-3 space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">ACWR watchlist</div>
          {watch.map(({ a, risk, acwr: r }) => (
            <button key={a.id} onClick={() => openPanel("athlete", a.id)} className="w-full flex justify-between items-center text-[11px] p-1.5 rounded hover:bg-accent/40 text-left">
              <span className="truncate">{a.name}</span>
              <div className="flex gap-2 items-center">
                <span className="font-mono text-muted-foreground">{r}</span>
                <span className={`font-mono ${risk >= 45 ? "text-[color:var(--danger)]" : "text-[color:var(--warning)]"}`}>{riskLevel(risk)[0]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* AI substitutions */}
        <div className="col-span-12 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AI-suggested substitutions for tonight</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[12px]">
            {watch.slice(0, 3).map(({ a }) => (
              <div key={a.id} className="surface p-3 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">Out</div>
                  <div className="font-medium">{a.name}</div>
                </div>
                <div className="text-primary">→</div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">In</div>
                  <div className="font-medium">{squad[15 - watch.indexOf(watch.find(x => x.a.id === a.id)!)].name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
