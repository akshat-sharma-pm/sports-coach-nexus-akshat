import { create } from "zustand";
import { injuries, type BodyRegion } from "@/data/seed";

export type CaseStatus =
  | "Reported" | "Triaged" | "Diagnosed"
  | "Rehab:Acute" | "Rehab:Subacute" | "Rehab:Strength" | "Rehab:RTP"
  | "RTP-Review" | "Cleared" | "Rejected";

export interface Approval { role: "physio" | "coach" | "admin"; decision: "approved" | "rejected"; at: string; note?: string }
export interface AuditEntry { at: string; actor: string; action: string; note?: string }

export interface Case {
  id: string;
  athleteId: string;
  reportedAt: string;
  site: BodyRegion;
  symptoms: string;
  painScale: number;
  severity: "Minor" | "Moderate" | "Severe";
  status: CaseStatus;
  diagnosis?: string;
  assignedPhysioId?: string;
  passedCriteria: string[];
  approvals: Approval[];
  audit: AuditEntry[];
}

interface State {
  cases: Case[];
  reportIssue: (payload: Omit<Case, "id" | "status" | "passedCriteria" | "approvals" | "audit" | "reportedAt"> & { reportedAt?: string }) => string;
  triage: (id: string, note?: string) => void;
  diagnose: (id: string, diagnosis: string, physioId?: string) => void;
  toggleCriterion: (id: string, critId: string) => void;
  advancePhase: (id: string, phase: CaseStatus) => void;
  requestRTP: (id: string) => void;
  approveRTP: (id: string, role: Approval["role"], decision: Approval["decision"], note?: string) => void;
  reset: () => void;
}

function seedCases(): Case[] {
  // Seed a few cases from existing injuries so workflows look populated.
  const now = Date.now();
  return injuries.slice(0, 14).map((i, idx) => {
    const phase: CaseStatus =
      idx % 7 === 0 ? "Reported" :
      idx % 7 === 1 ? "Triaged" :
      idx % 7 === 2 ? "Rehab:Acute" :
      idx % 7 === 3 ? "Rehab:Subacute" :
      idx % 7 === 4 ? "Rehab:Strength" :
      idx % 7 === 5 ? "Rehab:RTP" : "RTP-Review";
    return {
      id: `case-${(idx + 1).toString().padStart(4, "0")}`,
      athleteId: i.athleteId,
      reportedAt: new Date(now - (idx * 2 + 3) * 86400000).toISOString(),
      site: i.site,
      symptoms: `${i.type.toLowerCase()} discomfort, onset during session`,
      painScale: i.severity === "Severe" ? 7 : i.severity === "Moderate" ? 5 : 3,
      severity: i.severity,
      status: phase,
      diagnosis: phase === "Reported" ? undefined : `${i.severity} ${i.type.toLowerCase()} — ${i.site}`,
      assignedPhysioId: phase === "Reported" ? undefined : "user-physio-1",
      passedCriteria:
        phase === "Rehab:Acute" ? ["pain"] :
        phase === "Rehab:Subacute" ? ["pain", "rom"] :
        phase === "Rehab:Strength" ? ["pain", "rom", "strength"] :
        phase === "Rehab:RTP" ? ["pain", "rom", "strength", "psy"] :
        phase === "RTP-Review" ? ["pain", "rom", "strength", "func", "psy"] : [],
      approvals: phase === "RTP-Review" && idx % 2 === 0 ? [{ role: "physio", decision: "approved", at: new Date(now - 3600000).toISOString() }] : [],
      audit: [
        { at: new Date(now - (idx * 2 + 3) * 86400000).toISOString(), actor: "athlete", action: "Reported issue" },
        ...(phase !== "Reported" ? [{ at: new Date(now - (idx * 2 + 2) * 86400000).toISOString(), actor: "physio", action: "Triaged & diagnosed" }] : []),
      ],
    };
  });
}

let counter = 1000;
const nowISO = () => new Date().toISOString();

export const useCases = create<State>((set) => ({
  cases: seedCases(),
  reportIssue: (p) => {
    const id = `case-${++counter}`;
    set((s) => ({
      cases: [
        { ...p, id, status: "Reported", passedCriteria: [], approvals: [], audit: [{ at: nowISO(), actor: "athlete", action: "Reported issue", note: p.symptoms }], reportedAt: p.reportedAt ?? nowISO() },
        ...s.cases,
      ],
    }));
    return id;
  },
  triage: (id, note) => set((s) => ({
    cases: s.cases.map(c => c.id === id ? { ...c, status: "Triaged", audit: [...c.audit, { at: nowISO(), actor: "physio", action: "Triaged", note }] } : c),
  })),
  diagnose: (id, diagnosis, physioId) => set((s) => ({
    cases: s.cases.map(c => c.id === id ? { ...c, status: "Rehab:Acute", diagnosis, assignedPhysioId: physioId ?? "user-physio-1", audit: [...c.audit, { at: nowISO(), actor: "physio", action: "Diagnosed", note: diagnosis }] } : c),
  })),
  toggleCriterion: (id, critId) => set((s) => ({
    cases: s.cases.map(c => {
      if (c.id !== id) return c;
      const has = c.passedCriteria.includes(critId);
      const passed = has ? c.passedCriteria.filter(x => x !== critId) : [...c.passedCriteria, critId];
      return { ...c, passedCriteria: passed, audit: [...c.audit, { at: nowISO(), actor: "physio", action: `${has ? "Unmarked" : "Marked"} criterion`, note: critId }] };
    }),
  })),
  advancePhase: (id, phase) => set((s) => ({
    cases: s.cases.map(c => c.id === id ? { ...c, status: phase, audit: [...c.audit, { at: nowISO(), actor: "physio", action: `Moved to ${phase}` }] } : c),
  })),
  requestRTP: (id) => set((s) => ({
    cases: s.cases.map(c => c.id === id ? { ...c, status: "RTP-Review", audit: [...c.audit, { at: nowISO(), actor: "physio", action: "Requested RTP clearance" }] } : c),
  })),
  approveRTP: (id, role, decision, note) => set((s) => ({
    cases: s.cases.map(c => {
      if (c.id !== id) return c;
      const approvals = [...c.approvals.filter(a => a.role !== role), { role, decision, at: nowISO(), note }];
      const hasPhysio = approvals.some(a => a.role === "physio" && a.decision === "approved");
      const hasCoach = approvals.some(a => a.role === "coach" && a.decision === "approved");
      const hasAdmin = approvals.some(a => a.role === "admin" && a.decision === "approved");
      const anyReject = approvals.some(a => a.decision === "rejected");
      const status: CaseStatus = anyReject ? "Rejected" : ((hasPhysio && hasCoach) || hasAdmin) ? "Cleared" : "RTP-Review";
      return { ...c, approvals, status, audit: [...c.audit, { at: nowISO(), actor: role, action: `${decision} RTP`, note }] };
    }),
  })),
  reset: () => set({ cases: seedCases() }),
}));
