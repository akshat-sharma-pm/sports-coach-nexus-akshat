import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { assessments, athletes } from "@/data/seed";
import { useUI } from "@/store/ui";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/assessments")({
  head: () => ({ meta: [{ title: "Assessments · USI" }] }),
  component: Assessments,
});

function pct(value: number, all: number[]) {
  const sorted = [...all].sort((a,b) => a-b);
  const rank = sorted.findIndex((v) => v >= value);
  return Math.round((rank / sorted.length) * 100);
}

function Assessments() {
  const { openPanel } = useUI();
  const sprint = assessments.map(a => a.sprint40m);
  const cmj = assessments.map(a => a.cmj);
  const imtp = assessments.map(a => a.imtp);
  const yoyo = assessments.map(a => a.yoyo);

  const enriched = assessments.map((a) => {
    const ath = athletes.find(x => x.id === a.athleteId)!;
    return { ...a, name: ath.name, sport: ath.sport };
  }).sort((x, y) => y.talentScore - x.talentScore);

  return (
    <div>
      <PageHeader title="Assessment & Talent Identification" subtitle="Test battery results · percentile bands · talent scoring" />
      <div className="p-6 space-y-3">
        <div className="surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Test battery — top 25 athletes by talent score</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left pb-2">Athlete</th><th className="text-left pb-2">Sport</th>
                <th className="text-right pb-2">40m (s)</th><th className="text-left pb-2 w-40">%ile</th>
                <th className="text-right pb-2">CMJ (cm)</th><th className="text-left pb-2 w-40">%ile</th>
                <th className="text-right pb-2">IMTP (N)</th><th className="text-right pb-2">Talent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enriched.slice(0, 25).map((r) => {
                const sp = 100 - pct(r.sprint40m, sprint);
                const cp = pct(r.cmj, cmj);
                return (
                  <tr key={r.athleteId} className="hover:bg-accent/30 cursor-pointer" onClick={() => openPanel("athlete", r.athleteId)}>
                    <td className="py-2 font-medium">{r.name}</td>
                    <td className="py-2 text-muted-foreground">{r.sport}</td>
                    <td className="py-2 text-right font-mono">{r.sprint40m}</td>
                    <td className="py-2"><Bar p={sp} /></td>
                    <td className="py-2 text-right font-mono">{r.cmj}</td>
                    <td className="py-2"><Bar p={cp} /></td>
                    <td className="py-2 text-right font-mono">{r.imtp}</td>
                    <td className="py-2 text-right">
                      <Badge className={r.talentScore >= 85 ? "bg-[color:var(--success)] text-background" : ""}>{r.talentScore}</Badge>
                    </td>
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

function Bar({ p }: { p: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-secondary rounded overflow-hidden"><div className="h-full" style={{ width: `${p}%`, background: p > 70 ? "var(--color-success)" : p > 40 ? "var(--color-warning)" : "var(--color-danger)" }} /></div>
      <span className="text-[10px] font-mono text-muted-foreground">{p}</span>
    </div>
  );
}
