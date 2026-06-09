import { athletes, injuries, type Athlete, getAthlete } from "@/data/seed";

const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const last = <T,>(a: T[], n: number) => a.slice(-n);

// Acute:Chronic Workload Ratio (7d vs 28d)
export function acwr(a: Athlete): number {
  const acute = avg(last(a.load, 7));
  const chronic = avg(last(a.load, 28));
  return Number((acute / Math.max(1, chronic)).toFixed(2));
}

export function readinessScore(a: Athlete): number {
  const hrv = avg(last(a.hrv, 7));
  const sleep = avg(last(a.sleep, 7));
  const wellness = avg(last(a.wellness, 7));
  const hrvN = Math.min(1, hrv / 80);
  const sleepN = Math.min(1, sleep / 8);
  const wellN = wellness / 10;
  const score = (hrvN * 0.4 + sleepN * 0.35 + wellN * 0.25) * 100;
  return Math.round(score);
}

export function injuryRiskScore(a: Athlete): number {
  const r = acwr(a);
  const loadFactor = r > 1.5 ? 35 : r > 1.3 ? 22 : r < 0.8 ? 12 : 5;
  const sleepDef = Math.max(0, 7.5 - avg(last(a.sleep, 7))) * 8;
  const priorWeight = a.priorInjuries * 6;
  const wellnessDeficit = Math.max(0, 7 - avg(last(a.wellness, 7))) * 5;
  const raw = loadFactor + sleepDef + priorWeight + wellnessDeficit;
  return Math.min(99, Math.round(raw));
}

export function riskLevel(score: number): "Low" | "Moderate" | "High" | "Critical" {
  if (score >= 65) return "Critical";
  if (score >= 45) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

export interface Insight { id: string; severity: "info" | "warn" | "alert"; title: string; detail: string; athleteId?: string }

export function generateInsights(): Insight[] {
  const out: Insight[] = [];
  const ranked = athletes
    .map((a) => ({ a, risk: injuryRiskScore(a) }))
    .sort((x, y) => y.risk - x.risk)
    .slice(0, 6);
  ranked.forEach(({ a, risk }, i) => {
    if (risk >= 45) {
      out.push({
        id: `ins-${i}`,
        severity: risk >= 65 ? "alert" : "warn",
        title: `${a.name} flagged ${riskLevel(risk)} risk`,
        detail: `ACWR ${acwr(a)}, sleep ${avg(last(a.sleep, 7)).toFixed(1)}h/night, ${a.priorInjuries} prior injuries. Recommend deload + sleep extension.`,
        athleteId: a.id,
      });
    }
  });
  out.push({
    id: "ins-x1",
    severity: "info",
    title: "Football U21 chronic load trending up 14%",
    detail: "Consider 1:1 deload microcycle next week or reduce VO2 sessions to 1×.",
  });
  out.push({
    id: "ins-x2",
    severity: "warn",
    title: "Hamstring injuries cluster in Athletics Senior",
    detail: "3 strains in 21 days. Add Nordic Curl prehab protocol 2×/wk.",
  });
  return out;
}

export function recommend(a: Athlete): string[] {
  const recs: string[] = [];
  const r = acwr(a);
  const s = avg(last(a.sleep, 7));
  if (r > 1.4) recs.push("Reduce session RPE by 2 for next 5 days (acute load spike).");
  if (r < 0.8) recs.push("Reintroduce mid-intensity blocks to rebuild chronic load.");
  if (s < 7) recs.push(`Sleep deficit detected (${s.toFixed(1)}h avg). Earlier bedtime + nap protocol.`);
  if (a.priorInjuries >= 2) recs.push("Add prehab block: Nordic curls, Copenhagen plank, single-leg RDL.");
  if (recs.length === 0) recs.push("Maintain current programming. Reassess in 7 days.");
  return recs;
}

export function copilotReply(prompt: string): string {
  const q = prompt.toLowerCase();
  if (q.includes("risk") || q.includes("flag")) {
    const top = athletes.map((a) => ({ a, r: injuryRiskScore(a) })).sort((x, y) => y.r - x.r).slice(0, 5);
    return [
      "### Top injury risk this week",
      ...top.map(({ a, r }, i) => `${i + 1}. **${a.name}** — risk ${r} (${riskLevel(r)}), ACWR ${acwr(a)}`),
      "",
      "Recommend: review session intensity for all 5; schedule physio screening.",
    ].join("\n");
  }
  if (q.includes("deload") || q.includes("u19") || q.includes("u21")) {
    return [
      "### Deload microcycle — Football U21",
      "- **Mon** Mobility + technical (RPE 4)",
      "- **Tue** Strength @ 60% (RPE 5)",
      "- **Wed** OFF",
      "- **Thu** Small-sided games 4v4 (RPE 6)",
      "- **Fri** Recovery pool + soft-tissue",
      "- **Sat** Tactical walkthrough",
      "- **Sun** OFF",
      "",
      "Expected ACWR drop: 1.34 → 0.92.",
    ].join("\n");
  }
  if (q.includes("readiness")) {
    const r = athletes.slice(0, 8).map((a) => `- ${a.name}: ${readinessScore(a)}`).join("\n");
    return `### Squad readiness snapshot\n${r}`;
  }
  if (q.includes("nutrition") || q.includes("meal")) {
    return "### Nutrition note\nProtein target 1.8 g/kg/day. Athletes <85% compliance: schedule nutritionist 1:1.";
  }
  return "I can analyze risk, readiness, training load, nutrition compliance, and injury trends. Try: *'who is at risk this week?'* or *'build a deload for U21'*.";
}

export function bodyRegionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  injuries.forEach((i) => { counts[i.site] = (counts[i.site] || 0) + 1; });
  return counts;
}

export { getAthlete };
