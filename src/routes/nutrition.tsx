import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, mealPlanTemplate } from "@/data/seed";
import { useState } from "react";
import { useUI } from "@/store/ui";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition · USI" }] }),
  component: Nutrition,
});

function Nutrition() {
  const { openPanel } = useUI();
  const [selected, setSelected] = useState(athletes[0]);
  const totals = mealPlanTemplate.reduce((s, m) => ({
    kcal: s.kcal + m.kcal, p: s.p + m.p, c: s.c + m.c, f: s.f + m.f,
  }), { kcal: 0, p: 0, c: 0, f: 0 });
  const compliance = 78 + (parseInt(selected.id.slice(-2)) % 20);

  return (
    <div>
      <PageHeader title="Nutrition Management" subtitle="Per-athlete meal plans, macros, hydration, supplement compliance" />
      <div className="grid grid-cols-12 gap-3 p-6">
        <div className="col-span-3 surface p-3 max-h-[640px] overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Athletes</div>
          {athletes.slice(0, 30).map((a) => (
            <button key={a.id} onClick={() => setSelected(a)} className={`w-full flex justify-between p-2 text-[12px] rounded text-left ${selected.id === a.id ? "bg-primary/15 border border-primary/40" : "hover:bg-accent/40 border border-transparent"}`}>
              <span className="truncate">{a.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{a.weight}kg</span>
            </button>
          ))}
        </div>

        <div className="col-span-9 space-y-3">
          <div className="flex items-center justify-between surface p-4">
            <div>
              <div className="text-[15px] font-semibold">{selected.name}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{selected.id} · {selected.weight}kg · {selected.sport}</div>
            </div>
            <button onClick={() => openPanel("athlete", selected.id)} className="text-[11px] text-primary hover:underline">Open profile →</button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Macro label="Calories" actual={Math.round(totals.kcal * compliance/100)} target={totals.kcal} unit="kcal" />
            <Macro label="Protein" actual={Math.round(totals.p * compliance/100)} target={totals.p} unit="g" />
            <Macro label="Carbs" actual={Math.round(totals.c * compliance/100)} target={totals.c} unit="g" />
            <Macro label="Fat" actual={Math.round(totals.f * compliance/100)} target={totals.f} unit="g" />
          </div>

          <div className="surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Today's meal plan</div>
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left pb-2">Meal</th><th className="text-right pb-2">kcal</th><th className="text-right pb-2">P</th><th className="text-right pb-2">C</th><th className="text-right pb-2">F</th><th className="text-right pb-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mealPlanTemplate.map((m, i) => (
                  <tr key={m.meal}>
                    <td className="py-2 font-medium">{m.meal}</td>
                    <td className="py-2 text-right font-mono">{m.kcal}</td>
                    <td className="py-2 text-right font-mono">{m.p}</td>
                    <td className="py-2 text-right font-mono">{m.c}</td>
                    <td className="py-2 text-right font-mono">{m.f}</td>
                    <td className="py-2 text-right text-[color:var(--success)] text-[11px]">{i < 4 ? "Logged" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="surface p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Hydration</div>
              <div className="font-mono text-2xl">2.8<span className="text-[12px] text-muted-foreground">/3.5L</span></div>
              <div className="h-1.5 bg-secondary rounded mt-2 overflow-hidden"><div className="h-full bg-primary" style={{ width: "80%" }} /></div>
            </div>
            <div className="surface p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Supplement stack</div>
              <div className="text-[12px] space-y-1">
                <Sup name="Creatine 5g" t /><Sup name="Whey 30g post" t /><Sup name="Omega-3 2g" t /><Sup name="Vit D3" /><Sup name="Magnesium" />
              </div>
            </div>
            <div className="surface p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">7-day compliance</div>
              <div className="font-mono text-2xl">{compliance}<span className="text-[12px] text-muted-foreground">%</span></div>
              <div className="grid grid-cols-7 gap-1 mt-3">
                {Array.from({length:7}).map((_,i) => <div key={i} className="h-6 rounded-sm" style={{background: i < Math.floor(compliance/15) ? "var(--color-primary)" : "var(--color-secondary)"}} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Macro({ label, actual, target, unit }: { label: string; actual: number; target: number; unit: string }) {
  const p = Math.min(100, (actual/target)*100);
  return (
    <div className="surface p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-xl mt-1">{actual}<span className="text-[11px] text-muted-foreground">/{target}{unit}</span></div>
      <div className="h-1.5 bg-secondary rounded mt-2 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div>
    </div>
  );
}
function Sup({ name, t }: { name: string; t?: boolean }) {
  return <div className="flex justify-between"><span>{name}</span><span className={t ? "text-[color:var(--success)]" : "text-muted-foreground"}>{t ? "✓" : "—"}</span></div>;
}
