import { rtpAssess, type RTPAssessment } from "@/lib/ai-engines";
import { useCases } from "@/store/cases";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";

export function RTPAdvisor({ caseId }: { caseId: string }) {
  const c = useCases(s => s.cases.find(x => x.id === caseId));
  const toggle = useCases(s => s.toggleCriterion);
  const requestRTP = useCases(s => s.requestRTP);
  if (!c) return null;

  const phaseHint: RTPAssessment["phase"] | undefined =
    c.status.startsWith("Rehab:") ? (c.status.split(":")[1] as RTPAssessment["phase"]) :
    c.status === "RTP-Review" ? "Return-to-Play" :
    c.status === "Cleared" ? "Cleared" : undefined;

  const assess = rtpAssess({
    reportedAt: c.reportedAt,
    severity: c.severity,
    site: c.site,
    phaseHint,
    passedIds: c.passedCriteria,
  });

  return (
    <div className="surface p-3 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Return-to-Play Advisor</div>
          <div className="text-[13px] font-medium mt-0.5">{assess.phase}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base">{assess.progressPct}%</div>
          <div className="text-[10px] text-muted-foreground">conf {assess.confidence}%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Cell icon={<Clock className="w-3 h-3" />} label="Day" value={`${assess.daysSinceInjury}`} />
        <Cell label="Predicted RTP" value={assess.predictedRTP} />
        <Cell label="Pain" value={`${c.painScale}/10`} />
      </div>

      <div className="h-1 bg-secondary rounded overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${assess.progressPct}%` }} />
      </div>

      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Gating criteria</div>
        {assess.criteria.map((cr) => (
          <button
            key={cr.id}
            onClick={() => toggle(c.id, cr.id)}
            className="w-full flex items-center gap-2 text-left p-1.5 rounded hover:bg-accent/40"
          >
            {cr.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--success)]" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground" />}
            <div className="flex-1 min-w-0">
              <div className="text-[12px]">{cr.label}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{cr.target} · {cr.value}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-[11px] text-muted-foreground border-t border-border pt-2">
        <span className="text-primary mr-1">›</span>{assess.recommendation}
      </div>

      {c.status !== "RTP-Review" && c.status !== "Cleared" && (
        <Button
          size="sm"
          className="w-full h-7 text-[12px]"
          disabled={assess.progressPct < 80}
          onClick={() => { requestRTP(c.id); toast.success(`RTP clearance requested for case ${c.id}`); }}
        >
          Request RTP clearance
        </Button>
      )}
    </div>
  );
}

function Cell({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card/60 border border-border rounded p-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="font-mono text-[12px]">{value}</div>
    </div>
  );
}
