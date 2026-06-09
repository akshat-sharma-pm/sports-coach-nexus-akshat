import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { BodyMap } from "@/components/body-map";
import { injuries, getAthlete } from "@/data/seed";
import { useUI } from "@/store/ui";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/medical/body-map")({
  head: () => ({ meta: [{ title: "Body Map · USI" }] }),
  component: BodyMapPage,
});

function BodyMapPage() {
  const { openPanel } = useUI();
  const [region, setRegion] = useState<string | null>(null);
  const filtered = region ? injuries.filter((i) => i.site === region) : injuries;

  return (
    <div>
      <PageHeader title="Interactive Human Body Map" subtitle="Click a region to filter injury history at that site" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        <div className="surface p-6 flex flex-col items-center">
          <BodyMap onSelect={(r) => setRegion(r)} />
          <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-px">
              {[0.1,0.3,0.5,0.7,0.9].map(t => <div key={t} className="w-6 h-3" style={{background: `oklch(${0.72-t*0.1} ${0.18+t*0.08} ${75-t*55})`}} />)}
            </div>
            <span>High</span>
          </div>
        </div>
        <div className="surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{region ? `Injuries at ${region}` : "All injuries"}</div>
            {region && <button onClick={() => setRegion(null)} className="text-[11px] text-primary hover:underline">Clear filter</button>}
          </div>
          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {filtered.map((i) => (
              <button key={i.id} onClick={() => openPanel("injury", i.id)} className="w-full text-left surface p-3 hover:bg-accent/40">
                <div className="flex justify-between text-[12px]">
                  <span className="font-medium">{i.type}</span>
                  <Badge variant="outline" className="text-[10px]">{i.severity}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono mt-1">{getAthlete(i.athleteId)?.name} · {i.site} · {i.date}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
