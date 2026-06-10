import { useCases } from "@/store/cases";
import { formatDistanceToNow } from "date-fns";

export function CaseTimeline({ caseId }: { caseId: string }) {
  const c = useCases(s => s.cases.find(x => x.id === caseId));
  if (!c) return null;
  return (
    <div className="surface p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Case timeline</div>
      <ol className="relative border-l border-border ml-2 space-y-2">
        {[...c.audit].reverse().map((e, i) => (
          <li key={i} className="ml-3">
            <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
            <div className="text-[12px]">{e.action}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{e.actor} · {formatDistanceToNow(new Date(e.at), { addSuffix: true })}</div>
            {e.note && <div className="text-[11px] text-muted-foreground mt-0.5">{e.note}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}
