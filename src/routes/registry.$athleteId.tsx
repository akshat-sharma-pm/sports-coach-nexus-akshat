import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { getAthlete, injuries, teamOf, academyOf, stateOf } from "@/data/seed";
import { acwr, readinessScore, injuryRiskScore, riskLevel, recommend } from "@/lib/ai";
import { KpiCard } from "@/components/kpi-card";
import { Sparkline } from "@/components/sparkline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/registry/$athleteId")({
  head: () => ({ meta: [{ title: "Athlete 360 · USI" }] }),
  component: AthleteProfile,
});

function AthleteProfile() {
  const { athleteId } = Route.useParams();
  const a = getAthlete(athleteId);
  if (!a) return <div className="p-6 text-sm">Athlete not found.</div>;
  const risk = injuryRiskScore(a);
  const ready = readinessScore(a);
  const r = acwr(a);
  const myInj = injuries.filter((i) => i.athleteId === a.id);

  return (
    <div>
      <PageHeader
        title={a.name}
        subtitle={`${a.id} · ${stateOf(a).name} › ${academyOf(a).name} › ${teamOf(a).name} · ${a.sport}${a.position ? ` (${a.position})` : ""}`}
        actions={
          <div className="flex gap-2 items-center">
            <Link to="/twin/$athleteId" params={{ athleteId: a.id }} className="text-[12px] text-primary hover:underline">Digital Twin →</Link>
            <Link to="/registry" className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Registry</Link>
          </div>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-6">
        <KpiCard label="Readiness" value={ready} unit="/100" tone={ready > 70 ? "ok" : ready > 50 ? "warn" : "bad"} />
        <KpiCard label="Injury Risk" value={risk} unit={`· ${riskLevel(risk)}`} tone={risk < 25 ? "ok" : risk < 45 ? "warn" : "bad"} />
        <KpiCard label="ACWR" value={r} tone={r > 1.5 ? "bad" : r > 1.3 ? "warn" : "ok"} />
        <KpiCard label="Prior Injuries" value={a.priorInjuries} tone={a.priorInjuries >= 3 ? "warn" : "neutral"} />
        <KpiCard label="Days in System" value={a.joinedDays} />
      </div>

      <div className="px-6 pb-8">
        <Tabs defaultValue="overview">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            <Card title="Training Load (60d sRPE)"><Sparkline data={a.load} color="var(--color-chart-1)" height={80} /></Card>
            <Card title="HRV (ms)"><Sparkline data={a.hrv} color="var(--color-chart-2)" height={80} /></Card>
            <Card title="Sleep (h)"><Sparkline data={a.sleep} color="var(--color-chart-3)" height={80} /></Card>
            <Card title="Wellness (1-10)"><Sparkline data={a.wellness} color="var(--color-chart-5)" height={80} /></Card>
          </TabsContent>

          <TabsContent value="training" className="pt-4">
            <Card title="Weekly load distribution">
              <div className="grid grid-cols-7 gap-1.5">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
                  const v = a.load[a.load.length - 7 + i];
                  const h = Math.max(8, (v / 600) * 100);
                  return (
                    <div key={d} className="flex flex-col items-center gap-1">
                      <div className="w-full bg-secondary rounded relative" style={{ height: 100 }}>
                        <div className="absolute bottom-0 inset-x-0 bg-primary/70 rounded" style={{ height: `${h}%` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{d}</div>
                      <div className="text-[10px] font-mono">{Math.round(v)}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="pt-4 space-y-2">
            {myInj.length === 0 && <p className="text-xs text-muted-foreground">No recorded injuries.</p>}
            {myInj.map((i) => (
              <div key={i.id} className="surface p-3 flex justify-between text-[12px]">
                <div>
                  <div className="font-medium">{i.type} · {i.site}</div>
                  <div className="text-muted-foreground font-mono text-[11px]">{i.date} · {i.daysOut} days out</div>
                </div>
                <div className="flex gap-2 items-start">
                  <Badge variant="outline">{i.severity}</Badge>
                  <Badge>{i.status}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="nutrition" className="pt-4">
            <Card title="Macro targets (today)">
              <div className="grid grid-cols-3 gap-3 text-[12px]">
                {[{l:"Protein",t:Math.round(a.weight*1.8),a:Math.round(a.weight*1.6),u:"g"},
                  {l:"Carbs",t:Math.round(a.weight*5.5),a:Math.round(a.weight*4.9),u:"g"},
                  {l:"Fat",t:Math.round(a.weight*1.1),a:Math.round(a.weight*1.0),u:"g"}].map((m) => (
                  <div key={m.l} className="surface p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</div>
                    <div className="font-mono text-lg">{m.a}<span className="text-muted-foreground text-[11px]">/{m.t}{m.u}</span></div>
                    <div className="h-1 bg-secondary rounded mt-1 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100,(m.a/m.t)*100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Sprint 10m" value={(1.7 + (a.weight%10)/100).toFixed(2)} unit="s" />
            <KpiCard label="CMJ" value={(40 + (a.age%10)).toFixed(1)} unit="cm" />
            <KpiCard label="IMTP" value={2400 + a.weight * 10} unit="N" />
            <KpiCard label="Yo-Yo IR2" value={1800 + (a.age * 12) % 600} unit="m" />
          </TabsContent>

          <TabsContent value="ai" className="pt-4 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI recommendations</div>
            {recommend(a).map((r, i) => (
              <div key={i} className="surface p-3 text-[12px] flex gap-2">
                <span className="text-primary">›</span>{r}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}
