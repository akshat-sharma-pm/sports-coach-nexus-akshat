import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { IntegrationTile } from "@/components/integration-tile";
import { providersSeed, liveFeed } from "@/data/integrations";
import { athletes, getAthlete } from "@/data/seed";
import { formatDistanceToNow } from "date-fns";
import { useUI } from "@/store/ui";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations · USI" }] }),
  component: Integrations,
});

function Integrations() {
  const { openPanel } = useUI();
  // Per-athlete device assignment (deterministic)
  const assignments = athletes.slice(0, 12).map((a, i) => ({
    a,
    garmin: i % 2 === 0 ? `GAR-${1000 + i}` : "—",
    catapult: i % 3 === 0 ? `CAT-${200 + i}` : "—",
    polar: i % 4 === 0 ? `POL-${50 + i}` : "—",
    other: i % 5 === 0 ? "WHOOP" : i % 5 === 2 ? "Oura" : i % 5 === 4 ? "Apple Watch" : "—",
  }));

  return (
    <div>
      <PageHeader title="Integrations" subtitle="Wearables · GPS · HRV providers · live data streams" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 p-6">
        {providersSeed.map(p => <IntegrationTile key={p.id} provider={p} />)}
      </div>

      <div className="grid grid-cols-12 gap-3 px-6 pb-6">
        <div className="col-span-12 lg:col-span-7 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Per-athlete device assignments</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">Athlete</th><th className="text-left pb-2">Garmin</th><th className="text-left pb-2">Catapult</th><th className="text-left pb-2">Polar</th><th className="text-left pb-2">Other</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map(r => (
                <tr key={r.a.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => openPanel("athlete", r.a.id)}>
                  <td className="py-1.5">{r.a.name}</td>
                  <td className="py-1.5 font-mono text-[11px]">{r.garmin}</td>
                  <td className="py-1.5 font-mono text-[11px]">{r.catapult}</td>
                  <td className="py-1.5 font-mono text-[11px]">{r.polar}</td>
                  <td className="py-1.5 font-mono text-[11px]">{r.other}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-12 lg:col-span-5 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Live data preview</div>
          <div className="space-y-1 max-h-[360px] overflow-y-auto">
            {liveFeed.slice(0, 14).map((m, i) => {
              const a = getAthlete(m.athleteId);
              const p = providersSeed.find(x => x.id === m.provider);
              return (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-2 text-[11px] border-b border-border pb-1">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-mono uppercase">{p?.id}</span>
                  <span className="truncate">{a?.name} · {m.metric}</span>
                  <span className="font-mono">{m.value}<span className="text-muted-foreground text-[9px] ml-0.5">{m.unit}</span> · {formatDistanceToNow(new Date(m.ts), { addSuffix: true })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
