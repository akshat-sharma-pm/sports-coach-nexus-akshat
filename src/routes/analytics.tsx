import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, teams, academies, states, injuries } from "@/data/seed";
import { injuryRiskScore, readinessScore } from "@/lib/ai";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { KpiCard } from "@/components/kpi-card";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · USI" }] }),
  component: Analytics,
});

const COLORS = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)","var(--color-chart-5)"];

function Analytics() {
  const sportDist = ["Athletics","Football","Hockey","Swimming","Weightlifting","Boxing"].map((s) => ({
    name: s, value: athletes.filter(a => a.sport === s).length,
  }));
  const stateDist = states.map((s) => {
    const acs = academies.filter(a => a.stateId === s.id).map(a => a.id);
    const tms = teams.filter(t => acs.includes(t.academyId)).map(t => t.id);
    const ath = athletes.filter(a => tms.includes(a.teamId));
    return {
      name: s.name,
      athletes: ath.length,
      avgRisk: Math.round(ath.reduce((s2,a) => s2+injuryRiskScore(a), 0) / Math.max(1, ath.length)),
      avgReady: Math.round(ath.reduce((s2,a) => s2+readinessScore(a), 0) / Math.max(1, ath.length)),
    };
  });
  const monthly = Array.from({length:12}, (_,i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    injuries: 4 + Math.round(Math.sin(i/2) * 5 + Math.random() * 6),
    daysOut: 60 + Math.round(Math.cos(i/3) * 30 + Math.random() * 40),
  }));

  return (
    <div>
      <PageHeader title="Analytics & Business Intelligence" subtitle="Federation → State → Academy → Team → Athlete drill-down" />
      <div className="grid grid-cols-4 gap-3 p-6">
        <KpiCard label="Total Athletes" value={athletes.length} />
        <KpiCard label="States" value={states.length} />
        <KpiCard label="Academies" value={academies.length} />
        <KpiCard label="Teams" value={teams.length} />
      </div>

      <div className="grid grid-cols-12 gap-3 px-6 pb-6">
        <div className="surface p-4 col-span-8">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">State performance comparison</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stateDist}>
                <XAxis dataKey="name" tick={{fontSize:10, fill:"var(--color-muted-foreground)"}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:"var(--color-card)",border:"1px solid var(--color-border)",fontSize:12}} />
                <Bar dataKey="athletes" fill="var(--color-chart-1)" radius={[2,2,0,0]} />
                <Bar dataKey="avgRisk" fill="var(--color-chart-4)" radius={[2,2,0,0]} />
                <Bar dataKey="avgReady" fill="var(--color-chart-2)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4 col-span-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Sport distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sportDist} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {sportDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background:"var(--color-card)",border:"1px solid var(--color-border)",fontSize:12}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4 col-span-12">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Injuries — 12 month trend</div>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <XAxis dataKey="month" tick={{fontSize:10, fill:"var(--color-muted-foreground)"}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:"var(--color-card)",border:"1px solid var(--color-border)",fontSize:12}} />
                <Line dataKey="injuries" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
                <Line dataKey="daysOut" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4 col-span-12">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Drill-down hierarchy</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">State</th><th className="text-left pb-2">Academy</th><th className="text-left pb-2">Team</th><th className="text-right pb-2">Athletes</th><th className="text-right pb-2">Avg Risk</th><th className="text-right pb-2">Active Inj</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.map((t) => {
                const ac = academies.find(a => a.id === t.academyId)!;
                const st = states.find(s => s.id === ac.stateId)!;
                const tA = athletes.filter(a => a.teamId === t.id);
                const inj = injuries.filter(i => tA.some(a => a.id === i.athleteId) && i.status === "Active").length;
                const avgRisk = Math.round(tA.reduce((s,a) => s+injuryRiskScore(a), 0) / Math.max(1, tA.length));
                return (
                  <tr key={t.id} className="hover:bg-accent/30">
                    <td className="py-2">{st.name}</td>
                    <td className="py-2 text-muted-foreground">{ac.name}</td>
                    <td className="py-2">{t.name}</td>
                    <td className="py-2 text-right font-mono">{tA.length}</td>
                    <td className={`py-2 text-right font-mono ${avgRisk >= 45 ? "text-[color:var(--warning)]" : ""}`}>{avgRisk}</td>
                    <td className="py-2 text-right font-mono">{inj}</td>
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
