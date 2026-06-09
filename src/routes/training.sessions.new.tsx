import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { exerciseLibrary } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/training/sessions/new")({
  head: () => ({ meta: [{ title: "Session Builder · USI" }] }),
  component: SessionBuilder,
});

interface Block { id: string; exId: string; sets: number; reps: number; load: string; rpe: number; phase: "Warmup" | "Main" | "Cooldown" }

function SessionBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "b1", exId: "ex-10", sets: 1, reps: 1, load: "BW", rpe: 3, phase: "Warmup" },
    { id: "b2", exId: "ex-1", sets: 5, reps: 5, load: "80%", rpe: 8, phase: "Main" },
    { id: "b3", exId: "ex-6", sets: 4, reps: 4, load: "BW", rpe: 7, phase: "Main" },
  ]);
  const [name, setName] = useState("Lower-body strength · Week 3");

  function add(exId: string) {
    setBlocks([...blocks, { id: `b${Date.now()}`, exId, sets: 3, reps: 8, load: "70%", rpe: 7, phase: "Main" }]);
  }
  function remove(id: string) { setBlocks(blocks.filter((b) => b.id !== id)); }

  const grouped = (["Warmup","Main","Cooldown"] as const).map((p) => ({ p, items: blocks.filter((b) => b.phase === p) }));

  return (
    <div>
      <PageHeader title="Session Builder" subtitle="Compose, periodise, and template training sessions"
        actions={<Button size="sm" className="h-8 gap-1" onClick={() => toast.success("Session template saved")}><Save className="w-3.5 h-3.5" /> Save template</Button>}
      />
      <div className="grid grid-cols-12 gap-3 p-6">
        {/* Library */}
        <div className="col-span-3 surface p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Exercise library</div>
          <div className="space-y-1">
            {exerciseLibrary.map((e) => (
              <button key={e.id} onClick={() => add(e.id)} className="w-full flex justify-between items-center p-2 text-[12px] rounded hover:bg-accent/40 text-left">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground">{e.category} · {e.muscle}</div>
                </div>
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="col-span-6 surface p-4">
          <input value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent text-[15px] font-semibold border-b border-border w-full pb-2 mb-3 outline-none focus:border-primary" />
          {grouped.map(({ p, items }) => (
            <div key={p} className="mb-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{p}</div>
              <div className="space-y-2">
                {items.map((b) => {
                  const ex = exerciseLibrary.find((e) => e.id === b.exId)!;
                  return (
                    <div key={b.id} className="surface p-3 grid grid-cols-12 gap-2 items-center text-[12px]">
                      <div className="col-span-4">
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-[10px] text-muted-foreground">{ex.category}</div>
                      </div>
                      <div className="col-span-2"><label className="text-[10px] text-muted-foreground">Sets</label><input value={b.sets} onChange={(e) => setBlocks(blocks.map(x => x.id === b.id ? {...x, sets: +e.target.value} : x))} className="w-full bg-input/60 border border-border rounded h-7 px-2 font-mono" /></div>
                      <div className="col-span-2"><label className="text-[10px] text-muted-foreground">Reps</label><input value={b.reps} onChange={(e) => setBlocks(blocks.map(x => x.id === b.id ? {...x, reps: +e.target.value} : x))} className="w-full bg-input/60 border border-border rounded h-7 px-2 font-mono" /></div>
                      <div className="col-span-2"><label className="text-[10px] text-muted-foreground">Load</label><input value={b.load} onChange={(e) => setBlocks(blocks.map(x => x.id === b.id ? {...x, load: e.target.value} : x))} className="w-full bg-input/60 border border-border rounded h-7 px-2 font-mono" /></div>
                      <div className="col-span-1"><label className="text-[10px] text-muted-foreground">RPE</label><input value={b.rpe} onChange={(e) => setBlocks(blocks.map(x => x.id === b.id ? {...x, rpe: +e.target.value} : x))} className="w-full bg-input/60 border border-border rounded h-7 px-2 font-mono" /></div>
                      <button onClick={() => remove(b.id)} className="col-span-1 text-muted-foreground hover:text-[color:var(--danger)]"><X className="w-4 h-4" /></button>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="text-[11px] text-muted-foreground italic">No blocks. Add from library.</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="col-span-3 surface p-4 self-start">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Session summary</div>
          <Row k="Total blocks" v={blocks.length} />
          <Row k="Avg RPE" v={(blocks.reduce((s,b) => s+b.rpe, 0) / Math.max(1, blocks.length)).toFixed(1)} />
          <Row k="Volume (sets)" v={blocks.reduce((s,b) => s+b.sets, 0)} />
          <Row k="Estimated TRIMP" v={Math.round(blocks.reduce((s,b) => s + b.sets * b.reps * b.rpe, 0) / 4)} />
          <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Assign to</div>
          <select className="w-full bg-input/60 border border-border rounded h-8 px-2 text-[12px]">
            <option>Athletics Senior</option><option>Football U21</option><option>Hockey Senior</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return <div className="flex justify-between text-[12px] py-1.5 border-b border-border"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}
