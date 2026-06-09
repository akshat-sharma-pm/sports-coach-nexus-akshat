import { bodyRegionCounts } from "@/lib/ai";
import { injuries } from "@/data/seed";
import { useUI } from "@/store/ui";

const regions = [
  // [region, cx, cy, rx, ry] anterior figure
  { k: "head", x: 100, y: 30, rx: 14, ry: 16 },
  { k: "neck", x: 100, y: 50, rx: 6, ry: 5 },
  { k: "chest", x: 100, y: 78, rx: 26, ry: 18 },
  { k: "shoulder_l", x: 72, y: 62, rx: 10, ry: 10 },
  { k: "shoulder_r", x: 128, y: 62, rx: 10, ry: 10 },
  { k: "elbow_l", x: 58, y: 100, rx: 6, ry: 8 },
  { k: "elbow_r", x: 142, y: 100, rx: 6, ry: 8 },
  { k: "wrist_l", x: 50, y: 140, rx: 6, ry: 7 },
  { k: "wrist_r", x: 150, y: 140, rx: 6, ry: 7 },
  { k: "back_lower", x: 100, y: 120, rx: 22, ry: 12 },
  { k: "hip_l", x: 88, y: 150, rx: 10, ry: 10 },
  { k: "hip_r", x: 112, y: 150, rx: 10, ry: 10 },
  { k: "quad_l", x: 88, y: 188, rx: 12, ry: 22 },
  { k: "quad_r", x: 112, y: 188, rx: 12, ry: 22 },
  { k: "hamstring_l", x: 88, y: 220, rx: 12, ry: 14 },
  { k: "hamstring_r", x: 112, y: 220, rx: 12, ry: 14 },
  { k: "knee_l", x: 88, y: 244, rx: 9, ry: 8 },
  { k: "knee_r", x: 112, y: 244, rx: 9, ry: 8 },
  { k: "calf_l", x: 88, y: 280, rx: 10, ry: 18 },
  { k: "calf_r", x: 112, y: 280, rx: 10, ry: 18 },
  { k: "ankle_l", x: 88, y: 312, rx: 7, ry: 6 },
  { k: "ankle_r", x: 112, y: 312, rx: 7, ry: 6 },
  { k: "foot_l", x: 86, y: 328, rx: 10, ry: 6 },
  { k: "foot_r", x: 114, y: 328, rx: 10, ry: 6 },
];

export function BodyMap({ onSelect }: { onSelect?: (region: string) => void }) {
  const counts = bodyRegionCounts();
  const max = Math.max(1, ...Object.values(counts));
  const { openPanel } = useUI();

  function color(k: string) {
    const c = counts[k] || 0;
    if (!c) return "oklch(0.30 0.013 250)";
    const t = c / max;
    // gradient amber → red
    return `oklch(${0.72 - t * 0.1} ${0.18 + t * 0.08} ${75 - t * 55})`;
  }

  return (
    <svg viewBox="0 0 200 350" className="w-full max-w-[260px] mx-auto">
      {/* base silhouette */}
      <path
        d="M100 14 q14 0 14 16 q0 12 -6 18 q10 4 14 14 l4 24 q4 8 10 14 l12 30 q4 10 -2 16 l-6 6 q-2 4 0 8 l4 8 q2 8 -6 8 l-4 -2 l-2 22 l-2 32 l2 50 q2 6 -4 8 q-10 2 -14 -4 l-6 -50 q-2 -8 -4 0 l-6 50 q-4 6 -14 4 q-6 -2 -4 -8 l2 -50 l-2 -32 l-2 -22 l-4 2 q-8 0 -6 -8 l4 -8 q2 -4 0 -8 l-6 -6 q-6 -6 -2 -16 l12 -30 q6 -6 10 -14 l4 -24 q4 -10 14 -14 q-6 -6 -6 -18 q0 -16 14 -16 z"
        fill="oklch(0.22 0.013 250)"
        stroke="oklch(0.32 0.013 250)"
      />
      {regions.map((r) => (
        <ellipse
          key={r.k}
          cx={r.x} cy={r.y} rx={r.rx} ry={r.ry}
          fill={color(r.k)}
          opacity={0.85}
          className="cursor-pointer transition-opacity hover:opacity-100"
          onClick={() => {
            if (onSelect) onSelect(r.k);
            const inj = injuries.find((i) => i.site === r.k);
            if (inj) openPanel("injury", inj.id);
          }}
        >
          <title>{`${r.k}: ${counts[r.k] || 0} injuries`}</title>
        </ellipse>
      ))}
    </svg>
  );
}
