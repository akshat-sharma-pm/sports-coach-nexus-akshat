import type { Approval } from "@/store/cases";
import { Check, X, Clock } from "lucide-react";

export function ApprovalChip({ role, approval }: { role: Approval["role"]; approval?: Approval }) {
  const pending = !approval;
  const cls = pending ? "border-border text-muted-foreground" : approval.decision === "approved" ? "border-[color:var(--success)] text-[color:var(--success)]" : "border-[color:var(--danger)] text-[color:var(--danger)]";
  const Icon = pending ? Clock : approval.decision === "approved" ? Check : X;
  return (
    <div className={`inline-flex items-center gap-1 border rounded px-1.5 py-0.5 text-[10px] font-mono ${cls}`}>
      <Icon className="w-2.5 h-2.5" />
      <span className="uppercase">{role}</span>
      <span className="opacity-60">{pending ? "pending" : approval.decision}</span>
    </div>
  );
}
