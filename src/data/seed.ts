// Deterministic seed data for USI
export type Sport = "Athletics" | "Football" | "Hockey" | "Swimming" | "Weightlifting" | "Boxing";
export type Role = "athlete" | "coach" | "physio" | "scientist" | "nutritionist" | "admin";

export interface Federation { id: string; name: string }
export interface State { id: string; name: string; federationId: string }
export interface Academy { id: string; name: string; stateId: string }
export interface Team { id: string; name: string; sport: Sport; academyId: string }

export interface Athlete {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  sport: Sport;
  position?: string;
  teamId: string;
  status: "Active" | "Injured" | "Rehab" | "Onboarding" | "Suspended";
  onboardingStage: 0 | 1 | 2 | 3 | 4; // 4 = complete
  // longitudinal
  load: number[];        // 60d sRPE
  hrv: number[];         // 60d
  sleep: number[];       // 60d hours
  wellness: number[];    // 60d 1-10
  // derived
  priorInjuries: number;
  joinedDays: number;
  height: number; // cm
  weight: number; // kg
}

export interface Injury {
  id: string;
  athleteId: string;
  site: BodyRegion;
  type: string;
  severity: "Minor" | "Moderate" | "Severe";
  status: "Active" | "Rehab" | "Cleared";
  date: string;
  daysOut: number;
}

export type BodyRegion =
  | "head" | "neck" | "shoulder_l" | "shoulder_r" | "chest" | "back_upper" | "back_lower"
  | "elbow_l" | "elbow_r" | "wrist_l" | "wrist_r" | "hip_l" | "hip_r"
  | "hamstring_l" | "hamstring_r" | "quad_l" | "quad_r" | "knee_l" | "knee_r"
  | "calf_l" | "calf_r" | "ankle_l" | "ankle_r" | "foot_l" | "foot_r";

// PRNG
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
const range = (min: number, max: number) => Math.round(min + rand() * (max - min));

export const federations: Federation[] = [
  { id: "fed-1", name: "National Sports Federation of India" },
];
export const states: State[] = [
  { id: "st-mh", name: "Maharashtra", federationId: "fed-1" },
  { id: "st-kl", name: "Kerala", federationId: "fed-1" },
  { id: "st-pb", name: "Punjab", federationId: "fed-1" },
  { id: "st-tn", name: "Tamil Nadu", federationId: "fed-1" },
  { id: "st-hr", name: "Haryana", federationId: "fed-1" },
];
export const academies: Academy[] = [
  { id: "ac-1", name: "Pune High Performance Centre", stateId: "st-mh" },
  { id: "ac-2", name: "Thiruvananthapuram Sports Academy", stateId: "st-kl" },
  { id: "ac-3", name: "Patiala NIS", stateId: "st-pb" },
  { id: "ac-4", name: "Chennai Aquatics Centre", stateId: "st-tn" },
  { id: "ac-5", name: "Sonipat Combat Academy", stateId: "st-hr" },
  { id: "ac-6", name: "Mumbai Football Institute", stateId: "st-mh" },
];
export const teams: Team[] = [
  { id: "tm-1", name: "Athletics Senior", sport: "Athletics", academyId: "ac-1" },
  { id: "tm-2", name: "Athletics U19", sport: "Athletics", academyId: "ac-3" },
  { id: "tm-3", name: "Football Senior", sport: "Football", academyId: "ac-6" },
  { id: "tm-4", name: "Football U21", sport: "Football", academyId: "ac-6" },
  { id: "tm-5", name: "Hockey Senior", sport: "Hockey", academyId: "ac-3" },
  { id: "tm-6", name: "Swim Squad A", sport: "Swimming", academyId: "ac-4" },
  { id: "tm-7", name: "Weightlifting Elite", sport: "Weightlifting", academyId: "ac-2" },
  { id: "tm-8", name: "Boxing Senior", sport: "Boxing", academyId: "ac-5" },
];

const firstNames = ["Arjun","Rohan","Vikram","Aditya","Karthik","Rahul","Suresh","Sanjay","Ravi","Kiran","Aakash","Manish","Deepak","Nikhil","Harish","Priya","Anita","Meera","Kavya","Divya","Pooja","Riya","Neha","Sneha","Ananya","Isha","Tara","Lakshmi","Shreya","Aishwarya"];
const lastNames = ["Sharma","Patel","Kumar","Singh","Reddy","Nair","Iyer","Menon","Khan","Gupta","Verma","Bose","Das","Joshi","Mehta","Pillai","Chopra","Rao","Naidu","Yadav"];

const regions: BodyRegion[] = ["hamstring_l","hamstring_r","knee_l","knee_r","ankle_l","ankle_r","shoulder_l","shoulder_r","back_lower","calf_l","calf_r","quad_l","quad_r","hip_l","hip_r","wrist_l","wrist_r"];
const injuryTypes = ["Strain","Sprain","Tendinopathy","Contusion","Stress reaction","Impingement","Tear"];

function series(n: number, base: number, swing: number, trend = 0): number[] {
  const arr: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.5) * swing + trend;
    v = Math.max(0, v);
    arr.push(Number(v.toFixed(1)));
  }
  return arr;
}

export const athletes: Athlete[] = [];
for (let i = 0; i < 120; i++) {
  const team = teams[i % teams.length];
  const sex = rand() > 0.5 ? "M" : "F";
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  const stageRoll = rand();
  const statusRoll = rand();
  const onboardingStage = stageRoll < 0.08 ? (range(0,3) as 0|1|2|3) : 4;
  let status: Athlete["status"] = "Active";
  if (onboardingStage < 4) status = "Onboarding";
  else if (statusRoll < 0.09) status = "Injured";
  else if (statusRoll < 0.17) status = "Rehab";
  else if (statusRoll < 0.18) status = "Suspended";

  athletes.push({
    id: `ath-${(i+1).toString().padStart(4,"0")}`,
    name,
    age: range(16, 32),
    sex,
    sport: team.sport,
    position: team.sport === "Football" ? pick(["GK","DF","MF","FW"]) : undefined,
    teamId: team.id,
    status,
    onboardingStage,
    load: series(60, 350, 120, rand() < 0.2 ? 2 : 0),
    hrv: series(60, 65, 8),
    sleep: series(60, 7.2, 1.2),
    wellness: series(60, 7, 1.5),
    priorInjuries: range(0, 4),
    joinedDays: range(40, 1400),
    height: sex === "M" ? range(168, 192) : range(155, 178),
    weight: sex === "M" ? range(60, 92) : range(48, 75),
  });
}

export const injuries: Injury[] = [];
let inj = 0;
athletes.forEach((a) => {
  const count = a.status === "Injured" || a.status === "Rehab" ? range(1, 2) : (rand() < 0.3 ? 1 : 0);
  for (let k = 0; k < count; k++) {
    inj++;
    const sev = pick(["Minor","Moderate","Severe"] as const);
    injuries.push({
      id: `inj-${inj.toString().padStart(4,"0")}`,
      athleteId: a.id,
      site: pick(regions),
      type: pick(injuryTypes),
      severity: sev,
      status: a.status === "Injured" ? "Active" : a.status === "Rehab" ? "Rehab" : "Cleared",
      date: new Date(Date.now() - range(2, 200) * 86400000).toISOString().slice(0, 10),
      daysOut: sev === "Minor" ? range(3, 10) : sev === "Moderate" ? range(14, 35) : range(60, 140),
    });
  }
});

export const exerciseLibrary = [
  { id: "ex-1", name: "Back Squat", category: "Strength", muscle: "Lower" },
  { id: "ex-2", name: "Romanian Deadlift", category: "Strength", muscle: "Posterior" },
  { id: "ex-3", name: "Bench Press", category: "Strength", muscle: "Upper" },
  { id: "ex-4", name: "Power Clean", category: "Power", muscle: "Full" },
  { id: "ex-5", name: "Sprint 40m", category: "Speed", muscle: "Lower" },
  { id: "ex-6", name: "Plyo Box Jump", category: "Power", muscle: "Lower" },
  { id: "ex-7", name: "Nordic Curl", category: "Prehab", muscle: "Hamstring" },
  { id: "ex-8", name: "Copenhagen Plank", category: "Prehab", muscle: "Adductor" },
  { id: "ex-9", name: "VO2 Intervals 4x4", category: "Conditioning", muscle: "Cardio" },
  { id: "ex-10", name: "Mobility Flow", category: "Recovery", muscle: "Full" },
];

export const assessments = athletes.slice(0, 60).map((a) => ({
  athleteId: a.id,
  sprint10m: Number((1.7 + rand() * 0.3).toFixed(2)),
  sprint40m: Number((4.6 + rand() * 0.6).toFixed(2)),
  cmj: Number((35 + rand() * 20).toFixed(1)),
  imtp: range(1800, 3400),
  yoyo: range(1200, 2400),
  talentScore: Math.round(50 + rand() * 50),
}));

export const mealPlanTemplate = [
  { meal: "Breakfast", kcal: 620, p: 38, c: 78, f: 18 },
  { meal: "Mid-morning", kcal: 280, p: 22, c: 30, f: 8 },
  { meal: "Lunch", kcal: 880, p: 55, c: 110, f: 22 },
  { meal: "Pre-training", kcal: 240, p: 12, c: 40, f: 4 },
  { meal: "Post-training", kcal: 420, p: 35, c: 55, f: 8 },
  { meal: "Dinner", kcal: 760, p: 48, c: 80, f: 24 },
];

export function getAthlete(id: string) { return athletes.find((a) => a.id === id); }
export function teamOf(a: Athlete) { return teams.find((t) => t.id === a.teamId)!; }
export function academyOf(a: Athlete) { return academies.find((x) => x.id === teamOf(a).academyId)!; }
export function stateOf(a: Athlete) { return states.find((s) => s.id === academyOf(a).stateId)!; }
