import { athletes, type Athlete, type BodyRegion } from "@/data/seed";
import { acwr, injuryRiskScore, readinessScore, riskLevel } from "@/lib/ai";

const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const last = <T,>(a: T[], n: number) => a.slice(-n);

export interface RiskBreakdown {
  score: number;
  level: ReturnType<typeof riskLevel>;
  drivers: { label: string; value: number; weight: number; note: string }[];
  mitigations: string[];
}

export function riskBreakdown(a: Athlete): RiskBreakdown {
  const r = acwr(a);
  const sleep = avg(last(a.sleep, 7));
  const wellness = avg(last(a.wellness, 7));
  const drivers = [
    { label: "Acute:Chronic load", value: r, weight: r > 1.5 ? 35 : r > 1.3 ? 22 : r < 0.8 ? 12 : 5, note: r > 1.3 ? "Load spike" : r < 0.8 ? "Undertrained" : "In range" },
    { label: "Sleep debt", value: Number(sleep.toFixed(1)), weight: Math.round(Math.max(0, 7.5 - sleep) * 8), note: sleep < 7 ? `${sleep.toFixed(1)}h < 7.5h target` : "Adequate" },
    { label: "Prior injuries", value: a.priorInjuries, weight: a.priorInjuries * 6, note: a.priorInjuries >= 2 ? "Recurrence risk" : "Low history" },
    { label: "Wellness", value: Number(wellness.toFixed(1)), weight: Math.round(Math.max(0, 7 - wellness) * 5), note: wellness < 6.5 ? "Subjective decline" : "Stable" },
  ].sort((x, y) => y.weight - x.weight);
  const score = injuryRiskScore(a);
  const mitigations: string[] = [];
  if (r > 1.3) mitigations.push("Cap session RPE at 6 for 5 days");
  if (sleep < 7) mitigations.push("Sleep extension protocol + nap window");
  if (a.priorInjuries >= 2) mitigations.push("Add Nordic curl + Copenhagen plank prehab");
  if (wellness < 6.5) mitigations.push("1:1 check-in + reduce psychological load");
  if (!mitigations.length) mitigations.push("Maintain programming · re-assess in 7d");
  return { score, level: riskLevel(score), drivers, mitigations };
}

export interface ReadinessBreakdown {
  score: number;
  light: "green" | "amber" | "red";
  confidence: number;
  contributions: { label: string; value: number; pct: number }[];
}

export function readinessBreakdown(a: Athlete): ReadinessBreakdown {
  const hrv = avg(last(a.hrv, 7));
  const sleep = avg(last(a.sleep, 7));
  const well = avg(last(a.wellness, 7));
  const sRPE = avg(last(a.load, 3));
  const score = readinessScore(a);
  const light = score > 72 ? "green" : score > 55 ? "amber" : "red";
  return {
    score,
    light,
    confidence: 78 + ((a.id.charCodeAt(a.id.length - 1) % 20)),
    contributions: [
      { label: "HRV", value: Number(hrv.toFixed(0)), pct: 40 },
      { label: "Sleep", value: Number(sleep.toFixed(1)), pct: 30 },
      { label: "Wellness", value: Number(well.toFixed(1)), pct: 20 },
      { label: "sRPE 3d", value: Number(sRPE.toFixed(0)), pct: 10 },
    ],
  };
}

// RTP Advisor
export interface RTPCriterion {
  id: string;
  label: string;
  target: string;
  passed: boolean;
  value: string;
}
export interface RTPAssessment {
  phase: "Acute" | "Subacute" | "Strength" | "Return-to-Play" | "Cleared";
  daysSinceInjury: number;
  predictedRTP: string; // ISO date
  progressPct: number;
  criteria: RTPCriterion[];
  recommendation: string;
  confidence: number;
}

const phaseOrder: RTPAssessment["phase"][] = ["Acute", "Subacute", "Strength", "Return-to-Play", "Cleared"];

export function rtpAssess(opts: { reportedAt: string; severity: "Minor" | "Moderate" | "Severe"; site: BodyRegion; phaseHint?: RTPAssessment["phase"]; passedIds?: string[] }): RTPAssessment {
  const days = Math.floor((Date.now() - new Date(opts.reportedAt).getTime()) / 86400000);
  const expected = opts.severity === "Minor" ? 8 : opts.severity === "Moderate" ? 25 : 90;
  const p = Math.min(1, days / expected);
  const inferred: RTPAssessment["phase"] =
    p < 0.15 ? "Acute" : p < 0.4 ? "Subacute" : p < 0.75 ? "Strength" : p < 1 ? "Return-to-Play" : "Cleared";
  const phase = opts.phaseHint ?? inferred;
  const eta = new Date(new Date(opts.reportedAt).getTime() + expected * 86400000).toISOString().slice(0, 10);

  const lowerLimb = /hamstring|quad|calf|knee|ankle|hip|foot/.test(opts.site);
  const baseCriteria: RTPCriterion[] = [
    { id: "pain", label: "Pain-free ADL", target: "VAS ≤ 1/10", passed: p > 0.25, value: p > 0.25 ? "0/10" : "3/10" },
    { id: "rom", label: "Full ROM symmetry", target: "≥ 95%", passed: p > 0.45, value: p > 0.45 ? "98%" : "82%" },
    { id: "strength", label: "Isokinetic strength", target: "LSI ≥ 90%", passed: p > 0.65, value: p > 0.65 ? "92%" : "74%" },
    { id: "func", label: lowerLimb ? "Hop test battery" : "Sport-specific load", target: "≥ 90% LSI", passed: p > 0.8, value: p > 0.8 ? "94%" : "71%" },
    { id: "psy", label: "Psychological readiness (I-PRRS)", target: "≥ 50/60", passed: p > 0.7, value: p > 0.7 ? "54" : "41" },
  ];
  const passedSet = new Set(opts.passedIds ?? baseCriteria.filter(c => c.passed).map(c => c.id));
  const criteria = baseCriteria.map(c => ({ ...c, passed: passedSet.has(c.id) }));
  const passedCount = criteria.filter(c => c.passed).length;
  const progressPct = Math.round((passedCount / criteria.length) * 100);

  const rec = phase === "Cleared"
    ? "Clear for full training & competition"
    : phase === "Return-to-Play"
      ? "Sport-specific reintegration · monitor sRPE daily"
      : phase === "Strength"
        ? "Progressive overload · symmetry-focused strength"
        : phase === "Subacute"
          ? "Eccentric loading · pain-free ROM expansion"
          : "Protect · ice / compression · isometrics only";

  return { phase, daysSinceInjury: days, predictedRTP: eta, progressPct, criteria, recommendation: rec, confidence: 70 + passedCount * 5 };
}

export function nextPhase(p: RTPAssessment["phase"]): RTPAssessment["phase"] {
  const i = phaseOrder.indexOf(p);
  return phaseOrder[Math.min(phaseOrder.length - 1, i + 1)];
}
export { phaseOrder };

export function topRiskAthletes(n = 8) {
  return athletes.map(a => ({ a, ...riskBreakdown(a) })).sort((x, y) => y.score - x.score).slice(0, n);
}
export function topReadyAthletes(n = 8) {
  return athletes.map(a => ({ a, ...readinessBreakdown(a) })).sort((x, y) => y.score - x.score).slice(0, n);
}
