import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { athletes, injuries, teams } from "@/data/seed";
import { generateInsights, injuryRiskScore, readinessScore, riskLevel, acwr } from "@/lib/ai";
import { useUI } from "@/store/ui";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertOctagon, Activity, Users, ShieldAlert, CalendarCheck } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center · USI" }] }),
  component: CommandCenter,
});

function CommandCenter() {
  const { openPanel } = useUI();
  const insights = generateInsights();
  const ranked = athletes.map((a) => ({ a, risk: injuryRiskScore(a), ready: readinessScore(a), acwr: acwr(a) }))
    .sort((x, y) => y.risk - x.risk);
  const activeCount = athletes.filter((a) => a.status === "Active").length;
  const injuredCount = athletes.filter((a) => a.status === "Injured" || a.status === "Rehab").length;
  const avgReady = Math.round(ranked.reduce((s, x) => s + x.ready, 0) / ranked.length);
  const criticalCount = ranked.filter((x) => x.risk >= 65).length;

  const loadTrend = Array.from({ length: 14 }, (_, i) => ({
    d: `D${i+1}`,
    load: Math.round(athletes.reduce((s, a) => s + a.load[a.load.length - 14 + i], 0) / athletes.length),
  }));

  return (
    <div>
      <PageHeader title="AI Command Center" subtitle="Live operational view across all federations, academies and teams" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6">
        <KpiCard label="Active Athletes" value={activeCount} unit={`/ ${athletes.length}`} tone="ok" trend={loadTrend.map(x => x.load)} />
        <KpiCard label="Avg Readiness" value={avgReady} unit="/100" tone={avgReady > 70 ? "ok" : "warn"} delta="+2 vs last week" />
        <KpiCard label="At-Risk Athletes" value={ranked.filter(r => r.risk >= 45).length} tone="warn" delta={`${criticalCount} critical`} />
        <KpiCard label="Active Injuries" value={injuredCount} tone="bad" delta={`${injuries.filter(i => i.status === "Active").length} new this wk`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-6 pb-6">
        <div className="surface lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Federation training load (14d)</h3>
            <span className="text-[11px] text-muted-foreground font-mono">avg sRPE per athlete</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={loadTrend}>
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Line type="monotone" dataKey="load" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-[color:var(--warning)]" /> AI insights</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {insights.map((i) => {
              const Icon = i.severity === "alert" ? AlertOctagon : i.severity === "warn" ? AlertTriangle : Info;
              const color = i.severity === "alert" ? "text-[color:var(--danger)]" : i.severity === "warn" ? "text-[color:var(--warning)]" : "text-primary";
              return (
                <button key={i.id}
                  onClick={() => i.athleteId && openPanel("athlete", i.athleteId)}
                  className="w-full text-left text-[12px] p-2.5 rounded border border-border hover:bg-accent/40 transition">
                  <div className="flex items-start gap-2">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 ${color}`} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{i.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{i.detail}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-6 pb-8">
        <div className="surface p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> High-risk watchlist</h3>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground grid grid-cols-12 gap-2 px-2 pb-2 border-b border-border">
            <div className="col-span-5">Athlete</div><div className="col-span-2 text-right">Risk</div>
            <div className="col-span-2 text-right">Ready</div><div className="col-span-2 text-right">ACWR</div><div className="col-span-1" />
          </div>
          <div className="divide-y divide-border">
            {ranked.slice(0, 10).map(({ a, risk, ready, acwr: r }) => {
              const lvl = riskLevel(risk);
              return (
                <button key={a.id} onClick={() => openPanel("athlete", a.id)}
                  className="w-full grid grid-cols-12 gap-2 items-center px-2 py-2 hover:bg-accent/40 text-left">
                  <div className="col-span-5 min-w-0">
                    <div className="text-[13px] truncate">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{a.id} · {a.sport}</div>
                  </div>
                  <div className="col-span-2 text-right font-mono text-[13px]">{risk}</div>
                  <div className="col-span-2 text-right font-mono text-[13px]">{ready}</div>
                  <div className="col-span-2 text-right font-mono text-[13px]">{r}</div>
                  <div className="col-span-1 text-right">
                    <Badge variant="outline" className={`text-[9px] ${lvl === "Critical" ? "border-[color:var(--danger)] text-[color:var(--danger)]" : lvl === "High" ? "border-[color:var(--warning)] text-[color:var(--warning)]" : ""}`}>{lvl}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="surface p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-primary" /> Today's schedule heatmap</h3>
          <div className="grid grid-cols-[160px_1fr] gap-2 text-[11px]">
            {teams.map((t) => (
              <RowHeatmap key={t.id} label={t.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RowHeatmap({ label }: { label: string }) {
  const slots = Array.from({ length: 16 }, (_, i) => 5 + i); // 5am - 9pm
  return (
    <>
      <div className="text-muted-foreground truncate self-center">{label}</div>
      <div className="grid grid-cols-16 gap-px" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
        {slots.map((h) => {
          const intensity = Math.random();
          const has = intensity > 0.55;
          const bg = !has ? "var(--color-secondary)" : intensity > 0.85 ? "var(--color-primary)" : intensity > 0.7 ? "oklch(0.55 0.13 200)" : "oklch(0.40 0.08 200)";
          return <div key={h} className="h-5 rounded-sm" title={`${h}:00`} style={{ background: bg, opacity: has ? 0.9 : 0.3 }} />;
        })}
      </div>
    </>
  );
}
