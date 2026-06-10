import { useState } from "react";
import { getAthlete, injuries, teamOf, academyOf, stateOf } from "@/data/seed";
import { BodyMap } from "@/components/body-map";
import { Sparkline } from "@/components/sparkline";
import { riskBreakdown, readinessBreakdown, rtpAssess } from "@/lib/ai-engines";
import { RiskEngineCard } from "@/components/risk-engine-card";
import { RTPAdvisor } from "@/components/rtp-advisor";
import { useCases } from "@/store/cases";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, HeartPulse, Moon, Droplets, Gauge } from "lucide-react";

const LAYERS = [
  { id: "load", label: "Load" },
  { id: "soreness", label: "Soreness" },
  { id: "injuries", label: "Injury history" },
  { id: "asym", label: "Asymmetry" },
];

export function DigitalTwin({ athleteId }: { athleteId: string }) {
  const a = getAthlete(athleteId);
  const [layer, setLayer] = useState("injuries");
  const [day, setDay] = useState(59);
  const cases = useCases(s => s.cases.filter(c => c.athleteId === athleteId));
  if (!a) return <div className="p-6 text-sm">Athlete not found.</div>;

  const risk = riskBreakdown(a);
  const ready = readinessBreakdown(a);
  const openCase = cases.find(c => c.status !== "Cleared" && c.status !== "Rejected");
  const athInj = injuries.filter(i => i.athleteId === a.id);

  const vitals = [
    { icon: HeartPulse, label: "Resting HR", value: `${56 + (a.age % 8)}`, unit: "bpm", color: "text-[color:var(--danger)]" },
    { icon: Activity, label: "HRV", value: `${Math.round(a.hrv[day])}`, unit: "ms", color: "text-primary" },
    { icon: Moon, label: "Sleep", value: a.sleep[day].toFixed(1), unit: "h", color: "text-[color:var(--chart-3)]" },
    { icon: Droplets, label: "Hydration", value: `${85 + (a.weight % 12)}`, unit: "%", color: "text-[color:var(--chart-2)]" },
    { icon: Gauge, label: "sRPE", value: Math.round(a.load[day]).toString(), unit: "AU", color: "text-[color:var(--warning)]" },
  ];

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      {/* Header */}
      <div className="col-span-12 flex justify-between items-end border-b border-border pb-3">
        <div>
          <h1 className="text-[18px] font-semibold">{a.name} · Digital Twin</h1>
          <p className="text-[11px] text-muted-foreground font-mono">{a.id} · {stateOf(a).name} › {academyOf(a).name} › {teamOf(a).name}</p>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">Day -{59 - day} · {day === 59 ? "today" : `${59-day}d ago`}</div>
      </div>

      {/* Body map + layers */}
      <div className="col-span-12 lg:col-span-4 surface p-4">
        <div className="flex flex-wrap gap-1 mb-3">
          {LAYERS.map(l => (
            <button key={l.id} onClick={() => setLayer(l.id)} className={`text-[10px] px-2 py-1 rounded border ${layer === l.id ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>{l.label}</button>
          ))}
        </div>
        <BodyMap />
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Scrub timeline</div>
          <input type="range" min={0} max={59} value={day} onChange={(e) => setDay(Number(e.target.value))} className="w-full accent-primary" />
        </div>
      </div>

      {/* Vitals + trends */}
      <div className="col-span-12 lg:col-span-5 space-y-3">
        <div className="grid grid-cols-5 gap-px bg-border rounded overflow-hidden">
          {vitals.map(v => (
            <div key={v.label} className="bg-card p-2.5">
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground"><v.icon className="w-3 h-3" />{v.label}</div>
              <div className={`font-mono text-[15px] ${v.color}`}>{v.value}<span className="text-[10px] text-muted-foreground ml-0.5">{v.unit}</span></div>
            </div>
          ))}
        </div>
        <div className="surface p-3">
          <Tabs defaultValue="training">
            <TabsList className="bg-secondary/60 h-8">
              <TabsTrigger value="training" className="text-[11px]">Training</TabsTrigger>
              <TabsTrigger value="medical" className="text-[11px]">Medical</TabsTrigger>
              <TabsTrigger value="wellness" className="text-[11px]">Wellness</TabsTrigger>
              <TabsTrigger value="nutrition" className="text-[11px]">Nutrition</TabsTrigger>
            </TabsList>
            <TabsContent value="training" className="pt-3 space-y-3">
              <Trend label="sRPE load" data={a.load} color="var(--color-chart-1)" />
              <Trend label="HRV" data={a.hrv} color="var(--color-chart-2)" />
            </TabsContent>
            <TabsContent value="medical" className="pt-3 space-y-2">
              {athInj.length === 0 && <p className="text-[11px] text-muted-foreground">No medical history.</p>}
              {athInj.map(i => (
                <div key={i.id} className="text-[11px] flex justify-between border-b border-border pb-1">
                  <span>{i.type} · {i.site}</span>
                  <span className="font-mono text-muted-foreground">{i.date}</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="wellness" className="pt-3 space-y-3">
              <Trend label="Wellness 1-10" data={a.wellness} color="var(--color-chart-5)" />
              <Trend label="Sleep h" data={a.sleep} color="var(--color-chart-3)" />
            </TabsContent>
            <TabsContent value="nutrition" className="pt-3">
              <p className="text-[11px] text-muted-foreground">Compliance 86% (last 7d) · macros within ±8%.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI panel */}
      <div className="col-span-12 lg:col-span-3 space-y-3">
        <RiskEngineCard data={risk} />
        <div className="surface p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Readiness</div>
          <div className="font-mono text-2xl">{ready.score}<span className="text-[11px] text-muted-foreground ml-1">{ready.light}</span></div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono">conf {ready.confidence}%</div>
        </div>
        {openCase ? (
          <RTPAdvisor caseId={openCase.id} />
        ) : athInj[0] ? (
          <div className="surface p-3 text-[11px] text-muted-foreground">
            <div className="text-[10px] uppercase tracking-wider mb-1">RTP Advisor</div>
            Last injury healed · predicted full-load tolerance regained {rtpAssess({ reportedAt: athInj[0].date + "T00:00:00Z", severity: athInj[0].severity, site: athInj[0].site }).predictedRTP}.
          </div>
        ) : (
          <div className="surface p-3 text-[11px] text-muted-foreground">No active rehab case.</div>
        )}
      </div>
    </div>
  );
}

function Trend({ label, data, color }: { label: string; data: number[]; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <span>{label}</span><span className="font-mono">{data[data.length-1].toFixed(1)}</span>
      </div>
      <Sparkline data={data} color={color} height={40} />
    </div>
  );
}
