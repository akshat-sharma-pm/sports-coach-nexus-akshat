import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes } from "@/data/seed";
import { readinessScore, acwr } from "@/lib/ai";
import { useUI } from "@/store/ui";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { useState } from "react";

export const Route = createFileRoute("/sports-science")({
  head: () => ({ meta: [{ title: "Sports Science · USI" }] }),
  component: SportsScience,
});

function SportsScience() {
  const { openPanel } = useUI();
  const top = athletes.slice(0, 20);
  const [selected, setSelected] = useState(top[0]);

  const radar = [
    { metric: "HRV", v: Math.min(100, selected.hrv.slice(-7).reduce((s,x)=>s+x,0)/7 * 1.2) },
    { metric: "Sleep", v: selected.sleep.slice(-7).reduce((s,x)=>s+x,0)/7 * 12 },
    { metric: "Wellness", v: selected.wellness.slice(-7).reduce((s,x)=>s+x,0)/7 * 10 },
    { metric: "Load Balance", v: Math.max(20, 100 - Math.abs(1 - acwr(selected)) * 100) },
    { metric: "Recovery", v: readinessScore(selected) },
    { metric: "Capacity", v: 60 + (selected.age % 30) },
  ];
  const load14 = selected.load.slice(-14).map((v, i) => ({ d: `D${i+1}`, sRPE: Math.round(v) }));

  return (
    <div>
      <PageHeader title="Sports Science Dashboard" subtitle="Readiness, recovery, GPS, force-plate and wellness telemetry" />
      <div className="grid grid-cols-12 gap-3 p-6">
        <div className="col-span-3 surface p-3 max-h-[640px] overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Squad</div>
          <div className="space-y-1">
            {top.map((a) => {
              const r = readinessScore(a);
              return (
                <button key={a.id} onClick={() => setSelected(a)}
                  className={`w-full flex justify-between p-2 text-[12px] rounded text-left ${selected.id === a.id ? "bg-primary/15 border border-primary/40" : "hover:bg-accent/40 border border-transparent"}`}>
                  <span className="truncate">{a.name}</span>
                  <span className={`font-mono ${r > 70 ? "text-[color:var(--success)]" : r > 50 ? "text-[color:var(--warning)]" : "text-[color:var(--danger)]"}`}>{r}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-5 surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[15px] font-semibold">{selected.name}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{selected.id} · {selected.sport}</div>
            </div>
            <button onClick={() => openPanel("athlete", selected.id)} className="text-[11px] text-primary hover:underline">Open profile →</button>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Radar dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">14-day load (sRPE)</div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={load14}>
                <XAxis dataKey="d" tick={{fontSize:10, fill:"var(--color-muted-foreground)"}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:"var(--color-card)",border:"1px solid var(--color-border)",fontSize:12}} />
                <Bar dataKey="sRPE" fill="var(--color-chart-2)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-4 gap-3">
          <Metric label="GPS Total Distance" value="8,420" unit="m" delta="+3% vs avg" />
          <Metric label="High-speed Running" value="612" unit="m" delta="−8%" />
          <Metric label="Peak Force (IMTP)" value="2,840" unit="N" delta="PR" />
          <Metric label="CMJ asymmetry" value="4.2" unit="%" delta="within tol." />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, delta }: { label: string; value: string; unit: string; delta: string }) {
  return (
    <div className="surface p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-2xl mt-1">{value} <span className="text-[12px] text-muted-foreground">{unit}</span></div>
      <div className="text-[11px] text-muted-foreground mt-1">{delta}</div>
    </div>
  );
}
