import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useUI } from "@/store/ui";
import { getAthlete, injuries, teamOf, academyOf, stateOf } from "@/data/seed";
import { acwr, readinessScore, injuryRiskScore, riskLevel, recommend } from "@/lib/ai";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkline } from "@/components/sparkline";
import { Link } from "@tanstack/react-router";

export function DetailPanel() {
  const { panelKind, panelId, closePanel } = useUI();
  const open = panelKind !== null;

  let content: React.ReactNode = null;
  if (panelKind === "athlete" && panelId) {
    const a = getAthlete(panelId);
    if (a) {
      const risk = injuryRiskScore(a);
      const ready = readinessScore(a);
      const r = acwr(a);
      const athInjuries = injuries.filter((i) => i.athleteId === a.id);
      content = (
        <>
          <SheetHeader className="px-5 py-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-base">{a.name}</SheetTitle>
                <SheetDescription className="font-mono text-[11px]">
                  {a.id} · {a.sport} · {a.sex} · {a.age}y · {a.height}cm / {a.weight}kg
                </SheetDescription>
              </div>
              <Badge variant={a.status === "Active" ? "default" : "destructive"} className="text-[10px]">{a.status}</Badge>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono pt-1">
              {stateOf(a).name} › {academyOf(a).name} › {teamOf(a).name}
            </div>
          </SheetHeader>

          <div className="grid grid-cols-3 gap-px bg-border">
            <Stat label="Readiness" value={ready} suffix="/100" tone={ready > 70 ? "ok" : ready > 50 ? "warn" : "bad"} />
            <Stat label="Risk" value={risk} suffix={` · ${riskLevel(risk)}`} tone={risk < 25 ? "ok" : risk < 45 ? "warn" : "bad"} />
            <Stat label="ACWR" value={r} tone={r > 1.5 ? "bad" : r > 1.3 ? "warn" : "ok"} />
          </div>

          <Tabs defaultValue="overview" className="p-4">
            <TabsList className="bg-secondary/60">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 pt-3">
              <Trend label="Training load (60d sRPE)" data={a.load} color="var(--color-chart-1)" />
              <Trend label="HRV (ms)" data={a.hrv} color="var(--color-chart-2)" />
              <Trend label="Sleep (h)" data={a.sleep} color="var(--color-chart-3)" />
              <Trend label="Wellness" data={a.wellness} color="var(--color-chart-5)" />
            </TabsContent>
            <TabsContent value="medical" className="space-y-2 pt-3">
              {athInjuries.length === 0 && <p className="text-xs text-muted-foreground">No recorded injuries.</p>}
              {athInjuries.map((i) => (
                <div key={i.id} className="surface p-3 text-[12px]">
                  <div className="flex justify-between"><span className="font-medium">{i.type}</span><Badge variant="outline">{i.severity}</Badge></div>
                  <div className="text-muted-foreground font-mono text-[11px] mt-1">{i.site} · {i.date} · {i.daysOut}d out · {i.status}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="ai" className="space-y-2 pt-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI recommendations</div>
              {recommend(a).map((r, i) => (
                <div key={i} className="surface p-3 text-[12px] flex gap-2">
                  <span className="text-primary">›</span>{r}
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="p-4 border-t border-border">
            <Link to="/registry/$athleteId" params={{ athleteId: a.id }} onClick={closePanel}
              className="text-[12px] text-primary hover:underline">Open full athlete profile →</Link>
          </div>
        </>
      );
    }
  } else if (panelKind === "injury" && panelId) {
    const i = injuries.find((x) => x.id === panelId);
    if (i) {
      const a = getAthlete(i.athleteId);
      content = (
        <>
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle className="text-base">{i.type} — {i.site}</SheetTitle>
            <SheetDescription className="font-mono text-[11px]">{i.id} · {a?.name} · {i.date}</SheetDescription>
          </SheetHeader>
          <div className="p-5 space-y-3 text-[12px]">
            <Row k="Severity" v={i.severity} />
            <Row k="Status" v={i.status} />
            <Row k="Days out" v={`${i.daysOut} days`} />
            <Row k="Athlete" v={a?.name ?? "—"} />
            <div className="surface p-3 mt-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Rehab plan</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Phase 1 — Pain-free ROM, isometrics</li>
                <li>Phase 2 — Eccentric loading, single-leg control</li>
                <li>Phase 3 — Sport-specific reintegration</li>
                <li>Phase 4 — Return-to-play clearance</li>
              </ol>
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) closePanel(); }}>
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto bg-card">{content}</SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, suffix, tone }: { label: string; value: number | string; suffix?: string; tone: "ok"|"warn"|"bad" }) {
  const color = tone === "ok" ? "text-[color:var(--success)]" : tone === "warn" ? "text-[color:var(--warning)]" : "text-[color:var(--danger)]";
  return (
    <div className="bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg ${color}`}>{value}<span className="text-[11px] text-muted-foreground ml-0.5">{suffix}</span></div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border pb-1.5"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}
function Trend({ label, data, color }: { label: string; data: number[]; color: string }) {
  const v = data[data.length - 1];
  return (
    <div className="surface p-3">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-sm">{typeof v === "number" ? v.toFixed(1) : v}</span>
      </div>
      <Sparkline data={data} color={color} height={36} />
    </div>
  );
}
