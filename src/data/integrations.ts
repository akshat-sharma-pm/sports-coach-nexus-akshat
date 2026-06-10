export type ProviderStatus = "Connected" | "Syncing" | "Error" | "Disconnected";

export interface Provider {
  id: string;
  name: string;
  category: "Wearable" | "GPS" | "HRV" | "Smartwatch";
  status: ProviderStatus;
  lastSync: string; // ISO
  deviceCount: number;
  streams: string[];
  apiVersion: string;
  errorRate: number; // 0..1
}

export const providersSeed: Provider[] = [
  { id: "garmin", name: "Garmin Connect", category: "Wearable", status: "Connected", lastSync: new Date(Date.now() - 6 * 60_000).toISOString(), deviceCount: 87, streams: ["HR", "HRV", "Sleep", "Steps", "VO2max", "Stress"], apiVersion: "v3.2", errorRate: 0.004 },
  { id: "catapult", name: "Catapult Sports", category: "GPS", status: "Connected", lastSync: new Date(Date.now() - 12 * 60_000).toISOString(), deviceCount: 64, streams: ["GPS", "Acceleration", "Player Load", "Sprint Count", "Distance"], apiVersion: "Openfield v2", errorRate: 0.012 },
  { id: "polar", name: "Polar Team Pro", category: "HRV", status: "Syncing", lastSync: new Date(Date.now() - 2 * 60_000).toISOString(), deviceCount: 41, streams: ["HR Zones", "HRV (R-R)", "Recovery"], apiVersion: "v2.8", errorRate: 0.002 },
  { id: "wearables", name: "Apple Health / WHOOP / Oura", category: "Smartwatch", status: "Connected", lastSync: new Date(Date.now() - 21 * 60_000).toISOString(), deviceCount: 112, streams: ["HR", "HRV", "Sleep", "Resp Rate", "Body Temp"], apiVersion: "Multi-SDK", errorRate: 0.008 },
];

export interface LiveMetric {
  ts: string;
  athleteId: string;
  provider: string;
  metric: string;
  value: number;
  unit: string;
}

import { athletes } from "@/data/seed";
function rng(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
const r = rng(7);

export const liveFeed: LiveMetric[] = Array.from({ length: 24 }, (_, i) => {
  const a = athletes[Math.floor(r() * athletes.length)];
  const choice = Math.floor(r() * 4);
  const provider = ["garmin", "catapult", "polar", "wearables"][choice];
  const metric =
    provider === "garmin" ? "HR" :
    provider === "catapult" ? "Player Load" :
    provider === "polar" ? "HRV (rMSSD)" : "Sleep";
  const value =
    metric === "HR" ? Math.round(58 + r() * 80) :
    metric === "Player Load" ? Math.round(180 + r() * 320) :
    metric === "HRV (rMSSD)" ? Math.round(38 + r() * 60) :
    Number((5.5 + r() * 3).toFixed(1));
  return {
    ts: new Date(Date.now() - i * 47_000).toISOString(),
    athleteId: a.id,
    provider,
    metric,
    value,
    unit: metric === "Sleep" ? "h" : metric === "HR" ? "bpm" : metric === "HRV (rMSSD)" ? "ms" : "AU",
  };
});
