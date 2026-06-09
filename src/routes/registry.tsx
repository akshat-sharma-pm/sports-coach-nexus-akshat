import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, teams, academies, states } from "@/data/seed";
import { injuryRiskScore, readinessScore, riskLevel } from "@/lib/ai";
import { useUI } from "@/store/ui";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/registry")({
  head: () => ({ meta: [{ title: "Athlete Registry · USI" }] }),
  component: Registry,
});

function Registry() {
  const { openPanel, scope } = useUI();
  const [q, setQ] = useState("");
  const [sport, setSport] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const rows = useMemo(() => {
    return athletes.filter((a) => {
      const t = teams.find((x) => x.id === a.teamId)!;
      const ac = academies.find((x) => x.id === t.academyId)!;
      if (scope.teamId && a.teamId !== scope.teamId) return false;
      if (scope.academyId && t.academyId !== scope.academyId) return false;
      if (scope.stateId && ac.stateId !== scope.stateId) return false;
      if (sport && a.sport !== sport) return false;
      if (status && a.status !== status) return false;
      if (q && !a.name.toLowerCase().includes(q.toLowerCase()) && !a.id.includes(q)) return false;
      return true;
    });
  }, [q, sport, status, scope]);

  return (
    <div>
      <PageHeader title="Athlete Registry" subtitle={`${rows.length} of ${athletes.length} athletes`}
        actions={<>
          <Button size="sm" variant="outline" className="h-8 gap-1"><Filter className="w-3.5 h-3.5" /> Saved views</Button>
          <Button size="sm" variant="outline" className="h-8 gap-1"><Download className="w-3.5 h-3.5" /> Export</Button>
        </>}
      />
      <div className="px-6 py-3 border-b border-border flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or ID"
            className="h-8 w-64 pl-7 pr-2 rounded bg-input/60 border border-border text-[12px] outline-none focus:border-primary" />
        </div>
        <select value={sport} onChange={(e) => setSport(e.target.value)} className="h-8 px-2 rounded bg-input/60 border border-border text-[12px]">
          <option value="">All sports</option>
          {["Athletics","Football","Hockey","Swimming","Weightlifting","Boxing"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 px-2 rounded bg-input/60 border border-border text-[12px]">
          <option value="">All statuses</option>
          {["Active","Injured","Rehab","Onboarding","Suspended"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="bg-secondary/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Athlete</th>
              <th className="text-left px-4 py-2">Sport</th>
              <th className="text-left px-4 py-2">Team</th>
              <th className="text-left px-4 py-2">State</th>
              <th className="text-right px-4 py-2">Age</th>
              <th className="text-right px-4 py-2">Readiness</th>
              <th className="text-right px-4 py-2">Risk</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.slice(0, 80).map((a) => {
              const t = teams.find((x) => x.id === a.teamId)!;
              const ac = academies.find((x) => x.id === t.academyId)!;
              const st = states.find((x) => x.id === ac.stateId)!;
              const risk = injuryRiskScore(a);
              const ready = readinessScore(a);
              return (
                <tr key={a.id} onClick={() => openPanel("athlete", a.id)} className="hover:bg-accent/40 cursor-pointer">
                  <td className="px-4 py-2 font-mono text-muted-foreground">{a.id}</td>
                  <td className="px-4 py-2 font-medium">{a.name}</td>
                  <td className="px-4 py-2">{a.sport}</td>
                  <td className="px-4 py-2 text-muted-foreground">{t.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{st.name}</td>
                  <td className="px-4 py-2 text-right font-mono">{a.age}</td>
                  <td className="px-4 py-2 text-right font-mono">{ready}</td>
                  <td className="px-4 py-2 text-right font-mono"><span className={risk >= 65 ? "text-[color:var(--danger)]" : risk >= 45 ? "text-[color:var(--warning)]" : ""}>{risk}</span> <span className="text-[10px] text-muted-foreground">{riskLevel(risk)}</span></td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{a.status}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
