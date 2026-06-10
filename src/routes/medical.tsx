import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { injuries, getAthlete, athletes } from "@/data/seed";
import { injuryRiskScore, riskLevel } from "@/lib/ai";
import { useUI } from "@/store/ui";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ReportIssueDialog } from "@/components/report-issue-dialog";
import { useCases } from "@/store/cases";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/medical")({
  head: () => ({ meta: [{ title: "Medical & Injury · USI" }] }),
  component: Medical,
});

function Medical() {
  const { openPanel } = useUI();
  const cases = useCases(s => s.cases);
  const ranked = athletes.map((a) => ({ a, risk: injuryRiskScore(a) })).sort((x,y) => y.risk - x.risk).slice(0, 8);
  const sevCounts = ["Minor","Moderate","Severe"].map((s) => ({ severity: s, count: injuries.filter(i => i.severity === s).length }));
  const openCases = cases.filter(c => c.status !== "Cleared" && c.status !== "Rejected");

  return (
    <div>
      <PageHeader title="Medical & Injury Intelligence" subtitle={`${injuries.length} injuries · ${openCases.length} open cases · AI risk model active`}
        actions={
          <div className="flex gap-2 items-center">
            <ReportIssueDialog />
            <Link to="/medical/body-map" className="text-[12px] text-primary hover:underline">Open Body Map →</Link>
          </div>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6">
        <KpiCard label="Active injuries" value={injuries.filter(i => i.status === "Active").length} tone="bad" />
        <KpiCard label="In rehab" value={injuries.filter(i => i.status === "Rehab").length} tone="warn" />
        <KpiCard label="Open cases" value={openCases.length} tone="warn" />
        <KpiCard label="Days lost (total)" value={injuries.reduce((s,i) => s + i.daysOut, 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-6 pb-6">
        <div className="surface p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Open cases · clinical pipeline</div>
            <Link to="/rehab" className="text-[11px] text-primary hover:underline">Rehab board →</Link>
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left pb-2">Case</th><th className="text-left pb-2">Athlete</th><th className="text-left pb-2">Site</th><th className="text-left pb-2">Status</th><th className="text-left pb-2">Pain</th><th className="text-right pb-2">Reported</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openCases.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => openPanel("case", c.id)}>
                    <td className="py-1.5 font-mono text-muted-foreground">{c.id}</td>
                    <td className="py-1.5">{getAthlete(c.athleteId)?.name}</td>
                    <td className="py-1.5 font-mono text-[11px] text-muted-foreground">{c.site}</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px]">{c.status}</Badge></td>
                    <td className="py-1.5 font-mono">{c.painScale}/10</td>
                    <td className="py-1.5 text-right text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.reportedAt), { addSuffix: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-5 mb-3">Injury log (historical)</div>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left pb-2">ID</th><th className="text-left pb-2">Athlete</th><th className="text-left pb-2">Type</th><th className="text-left pb-2">Site</th><th className="text-left pb-2">Severity</th><th className="text-left pb-2">Status</th><th className="text-right pb-2">Days</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {injuries.slice(0, 24).map((i) => (
                  <tr key={i.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => openPanel("injury", i.id)}>
                    <td className="py-2 font-mono text-muted-foreground">{i.id}</td>
                    <td className="py-2">{getAthlete(i.athleteId)?.name}</td>
                    <td className="py-2">{i.type}</td>
                    <td className="py-2 font-mono text-[11px] text-muted-foreground">{i.site}</td>
                    <td className="py-2"><Badge variant="outline" className="text-[10px]">{i.severity}</Badge></td>
                    <td className="py-2"><Badge className="text-[10px]">{i.status}</Badge></td>
                    <td className="py-2 text-right font-mono">{i.daysOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Severity distribution</div>
            <div className="h-32"><ResponsiveContainer><BarChart data={sevCounts}><XAxis dataKey="severity" tick={{fontSize:10, fill:"var(--color-muted-foreground)"}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{background:"var(--color-card)",border:"1px solid var(--color-border)",fontSize:12}} /><Bar dataKey="count" fill="var(--color-primary)" /></BarChart></ResponsiveContainer></div>
          </div>
          <div className="surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AI predicted high risk</div>
            <div className="space-y-1">
              {ranked.map(({ a, risk }) => (
                <button key={a.id} onClick={() => openPanel("athlete", a.id)} className="w-full flex justify-between items-center p-2 text-[12px] rounded hover:bg-accent/40 text-left">
                  <span className="truncate">{a.name}</span>
                  <span className={`font-mono ${risk >= 65 ? "text-[color:var(--danger)]" : "text-[color:var(--warning)]"}`}>{risk} <span className="text-[10px] text-muted-foreground">{riskLevel(risk)}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
