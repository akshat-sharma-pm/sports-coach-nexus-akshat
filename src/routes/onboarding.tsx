import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes } from "@/data/seed";
import { useUI } from "@/store/ui";
import { Check, Circle } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · USI" }] }),
  component: Onboarding,
});

const stages = ["Invite Sent", "Documents", "Medical Clearance", "Baseline Tests", "Active"];

function Onboarding() {
  const { openPanel } = useUI();
  const cols = stages.map((s, i) => ({
    title: s,
    items: athletes.filter((a) => a.onboardingStage === i),
  }));

  return (
    <div>
      <PageHeader title="Athlete Onboarding" subtitle="Track new athletes from invitation through active enrolment" />
      <div className="grid grid-cols-5 gap-3 p-6 min-w-[1100px] overflow-x-auto">
        {cols.map((c, idx) => (
          <div key={c.title} className="surface p-3 min-h-[480px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                {idx === 4 ? <Check className="w-3.5 h-3.5 text-[color:var(--success)]" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground" />}
                {c.title}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">{c.items.length}</span>
            </div>
            <div className="space-y-2">
              {c.items.slice(0, 8).map((a) => (
                <button key={a.id} onClick={() => openPanel("athlete", a.id)}
                  className="w-full text-left p-2.5 rounded border border-border bg-card hover:bg-accent/40 text-[12px]">
                  <div className="font-medium truncate">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{a.id} · {a.sport}</div>
                  <div className="h-1 mt-2 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${((a.onboardingStage + 1) / 5) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
