import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useCases } from "@/store/cases";
import { getAthlete } from "@/data/seed";
import { BodyMap } from "@/components/body-map";
import { ApprovalChip } from "@/components/approval-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUI } from "@/store/ui";
import { useState } from "react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { formatDistanceToNow } from "date-fns";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/workspace/physio")({
  head: () => ({ meta: [{ title: "Physio Workspace · USI" }] }),
  component: PhysioWorkspace,
});

function PhysioWorkspace() {
  const cases = useCases(s => s.cases);
  const triage = useCases(s => s.triage);
  const diagnose = useCases(s => s.diagnose);
  const approve = useCases(s => s.approveRTP);
  const { openPanel } = useUI();
  const [selected, setSelected] = useState<string | null>(null);

  const inbox = cases.filter(c => c.status === "Reported" || c.status === "Triaged");
  const rehab = cases.filter(c => c.status.startsWith("Rehab:"));
  const rtp = cases.filter(c => c.status === "RTP-Review");
  const sel = selected ? cases.find(c => c.id === selected) : null;

  return (
    <div>
      <PageHeader title="Physio Workspace" subtitle="Triage · diagnose · rehab oversight · RTP approval" />
      <div className="grid grid-cols-4 gap-3 px-6 pt-4">
        <KpiCard label="New reports" value={inbox.filter(c => c.status === "Reported").length} tone="bad" />
        <KpiCard label="Active rehab" value={rehab.length} tone="warn" />
        <KpiCard label="RTP pending" value={rtp.length} tone="warn" />
        <KpiCard label="Cleared (30d)" value={cases.filter(c => c.status === "Cleared").length} tone="ok" />
      </div>

      <div className="grid grid-cols-12 gap-3 p-6">
        {/* Inbox */}
        <div className="col-span-12 lg:col-span-4 surface p-3">
          <div className="flex items-center gap-1.5 mb-2"><Stethoscope className="w-3.5 h-3.5 text-primary" /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Triage inbox</span></div>
          <div className="space-y-1 max-h-[420px] overflow-y-auto">
            {inbox.length === 0 && <div className="text-[11px] text-muted-foreground p-2">No new reports.</div>}
            {inbox.map(c => {
              const a = getAthlete(c.athleteId);
              return (
                <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-2 rounded border ${selected === c.id ? "border-primary bg-primary/5" : "border-border"} hover:bg-accent/40`}>
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium truncate">{a?.name}</span>
                    <Badge variant="outline" className="text-[9px]">{c.status}</Badge>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">{c.site} · pain {c.painScale}/10 · {c.severity}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(c.reportedAt), { addSuffix: true })}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="col-span-12 lg:col-span-5 surface p-4 space-y-3">
          {!sel ? (
            <div className="text-[12px] text-muted-foreground p-6 text-center">Select a case from the inbox.</div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] text-muted-foreground font-mono">{sel.id} · reported {formatDistanceToNow(new Date(sel.reportedAt), { addSuffix: true })}</div>
                  <div className="text-[15px] font-semibold">{getAthlete(sel.athleteId)?.name}</div>
                </div>
                <Badge>{sel.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-px bg-border rounded overflow-hidden">
                <Cell label="Site" value={sel.site} />
                <Cell label="Pain" value={`${sel.painScale}/10`} />
                <Cell label="Severity" value={sel.severity} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Symptoms</div>
                <div className="text-[12px]">{sel.symptoms}</div>
              </div>
              {sel.diagnosis && <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Diagnosis</div><div className="text-[12px]">{sel.diagnosis}</div></div>}
              <div className="flex gap-2 pt-2 border-t border-border">
                {sel.status === "Reported" && (
                  <Button size="sm" className="h-7 text-[11px] flex-1" onClick={() => { triage(sel.id, "Initial assessment complete"); toast.success("Case triaged"); }}>Mark triaged</Button>
                )}
                {(sel.status === "Reported" || sel.status === "Triaged") && (
                  <Button size="sm" variant="default" className="h-7 text-[11px] flex-1" onClick={() => { diagnose(sel.id, `${sel.severity} ${sel.site.replace("_", " ")} strain`); toast.success("Case diagnosed → Rehab Acute"); }}>Accept & diagnose</Button>
                )}
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => openPanel("athlete", sel.athleteId)}>View athlete</Button>
              </div>
            </>
          )}
        </div>

        {/* Body map mini */}
        <div className="col-span-12 lg:col-span-3 surface p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Injury density</div>
          <BodyMap />
        </div>

        {/* RTP approvals */}
        <div className="col-span-12 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">RTP approvals pending</div>
          {rtp.length === 0 && <div className="text-[11px] text-muted-foreground">No RTP requests pending.</div>}
          <div className="space-y-2">
            {rtp.map(c => {
              const a = getAthlete(c.athleteId);
              const physio = c.approvals.find(x => x.role === "physio");
              const coach = c.approvals.find(x => x.role === "coach");
              return (
                <div key={c.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center bg-card border border-border rounded p-3">
                  <div>
                    <div className="text-[12px] font-medium">{a?.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{c.id} · {c.site} · {c.diagnosis}</div>
                  </div>
                  <div className="flex gap-1">
                    <ApprovalChip role="physio" approval={physio} />
                    <ApprovalChip role="coach" approval={coach} />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { approve(c.id, "physio", "approved", "Cleared on objective criteria"); toast.success("Physio approval recorded"); }} disabled={!!physio}>Approve as Physio</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { approve(c.id, "physio", "rejected", "Insufficient symmetry"); toast.error("RTP rejected"); }}>Reject</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-[12px]">{value}</div>
    </div>
  );
}
