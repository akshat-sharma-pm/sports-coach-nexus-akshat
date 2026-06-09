import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, injuries, getAthlete } from "@/data/seed";
import { useUI } from "@/store/ui";

export const Route = createFileRoute("/rehab")({
  head: () => ({ meta: [{ title: "Rehab Workflow · USI" }] }),
  component: Rehab,
});

const phases = ["Acute", "Subacute", "Strength", "Return-to-Play", "Cleared"];

function Rehab() {
  const { openPanel } = useUI();
  const inRehab = injuries.filter((i) => i.status === "Active" || i.status === "Rehab" || i.status === "Cleared").slice(0, 25);

  function phaseOf(daysIn: number, total: number) {
    const p = daysIn / total;
    if (p < 0.15) return 0;
    if (p < 0.4) return 1;
    if (p < 0.7) return 2;
    if (p < 0.95) return 3;
    return 4;
  }

  const cols = phases.map((p, i) => ({
    name: p,
    items: inRehab.filter((inj, idx) => phaseOf((idx % 14) + 1, inj.daysOut) === i),
  }));

  return (
    <div>
      <PageHeader title="Rehab Workflow" subtitle="Track athletes through return-to-play phases" />
      <div className="grid grid-cols-5 gap-3 p-6 min-w-[1100px] overflow-x-auto">
        {cols.map((c, idx) => (
          <div key={c.name} className="surface p-3 min-h-[480px]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] font-semibold">{c.name}</div>
              <span className="text-[11px] font-mono text-muted-foreground">{c.items.length}</span>
            </div>
            <div className="space-y-2">
              {c.items.slice(0, 6).map((i) => {
                const a = getAthlete(i.athleteId);
                return (
                  <button key={i.id} onClick={() => openPanel("injury", i.id)} className="w-full text-left p-2.5 rounded border border-border bg-card hover:bg-accent/40 text-[12px]">
                    <div className="font-medium truncate">{a?.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{i.type} · {i.site}</div>
                    <div className="h-1 mt-2 bg-secondary rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${((idx + 1) / 5) * 100}%` }} /></div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">Day {(idx * 7) + 2}/{i.daysOut}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
