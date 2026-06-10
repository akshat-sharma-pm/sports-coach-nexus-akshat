import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { getAthlete } from "@/data/seed";
import { useUI } from "@/store/ui";
import { useCases, type CaseStatus } from "@/store/cases";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rtpAssess } from "@/lib/ai-engines";
import { toast } from "sonner";
import { ApprovalChip } from "@/components/approval-chip";

export const Route = createFileRoute("/rehab")({
  head: () => ({ meta: [{ title: "Rehab Workflow · USI" }] }),
  component: Rehab,
});

const COLUMNS: { name: string; status: CaseStatus }[] = [
  { name: "Acute", status: "Rehab:Acute" },
  { name: "Subacute", status: "Rehab:Subacute" },
  { name: "Strength", status: "Rehab:Strength" },
  { name: "Return-to-Play", status: "Rehab:RTP" },
  { name: "RTP Review", status: "RTP-Review" },
  { name: "Cleared", status: "Cleared" },
];

function Rehab() {
  const { openPanel } = useUI();
  const cases = useCases(s => s.cases);
  const advance = useCases(s => s.advancePhase);
  const approve = useCases(s => s.approveRTP);

  return (
    <div>
      <PageHeader title="Rehab Workflow" subtitle="Drag-equivalent phase board · AI RTP advisor integrated · two-step clearance" />
      <div className="grid grid-cols-6 gap-3 p-6 min-w-[1400px] overflow-x-auto">
        {COLUMNS.map((col, idx) => {
          const items = cases.filter(c => c.status === col.status);
          const nextCol = COLUMNS[idx + 1];
          return (
            <div key={col.name} className="surface p-3 min-h-[520px]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-semibold">{col.name}</div>
                <span className="text-[11px] font-mono text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(c => {
                  const a = getAthlete(c.athleteId);
                  const assess = rtpAssess({ reportedAt: c.reportedAt, severity: c.severity, site: c.site, passedIds: c.passedCriteria });
                  const physio = c.approvals.find(x => x.role === "physio");
                  const coach = c.approvals.find(x => x.role === "coach");
                  return (
                    <div key={c.id} className="p-2.5 rounded border border-border bg-card text-[12px] space-y-1.5">
                      <button onClick={() => openPanel("case", c.id)} className="w-full text-left">
                        <div className="font-medium truncate">{a?.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{c.site} · {c.severity}</div>
                      </button>
                      <div className="h-1 bg-secondary rounded overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${assess.progressPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                        <span>D{assess.daysSinceInjury}</span>
                        <span>RTP {assess.predictedRTP.slice(5)}</span>
                      </div>
                      {col.status === "RTP-Review" ? (
                        <div className="space-y-1 pt-1 border-t border-border">
                          <div className="flex gap-1 flex-wrap">
                            <ApprovalChip role="physio" approval={physio} />
                            <ApprovalChip role="coach" approval={coach} />
                          </div>
                          <div className="flex gap-1">
                            {!physio && <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => { approve(c.id, "physio", "approved"); toast.success("Physio approved"); }}>Physio ✓</Button>}
                            {!coach && <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => { approve(c.id, "coach", "approved"); toast.success("Coach approved · Cleared"); }}>Coach ✓</Button>}
                          </div>
                        </div>
                      ) : col.status === "Cleared" ? (
                        <Badge className="text-[9px]">Returned to roster</Badge>
                      ) : nextCol && (
                        <Button size="sm" variant="ghost" className="w-full h-6 text-[10px]" onClick={() => { advance(c.id, nextCol.status); toast(`Advanced to ${nextCol.name}`); }}>
                          → {nextCol.name}
                        </Button>
                      )}
                    </div>
                  );
                })}
                {items.length === 0 && <div className="text-[10px] text-muted-foreground text-center py-4">empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
