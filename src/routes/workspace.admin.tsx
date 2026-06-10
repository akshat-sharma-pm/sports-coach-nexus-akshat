import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { athletes, injuries, states, academies, teams } from "@/data/seed";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/store/cases";
import { useState } from "react";
import { toast } from "sonner";
import { ROLES } from "@/lib/rbac";
import { Megaphone, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/workspace/admin")({
  head: () => ({ meta: [{ title: "Federation Admin Workspace · USI" }] }),
  component: AdminWorkspace,
});

function AdminWorkspace() {
  const cases = useCases(s => s.cases);
  const audit = cases.flatMap(c => c.audit.map(e => ({ ...e, caseId: c.id }))).sort((a,b) => +new Date(b.at) - +new Date(a.at)).slice(0, 12);
  const [announcement, setAnnouncement] = useState("");

  const stateRollup = states.map(s => {
    const teamIds = teams.filter(t => academies.find(a => a.id === t.academyId)?.stateId === s.id).map(t => t.id);
    const ath = athletes.filter(a => teamIds.includes(a.teamId));
    return { state: s, athletes: ath.length, injured: ath.filter(a => a.status === "Injured" || a.status === "Rehab").length };
  });

  const fakeUsers = [
    { id: "u1", name: "Dr. Anita Sharma", role: "physio", state: "Maharashtra", active: true },
    { id: "u2", name: "Coach Vikram Singh", role: "coach", state: "Punjab", active: true },
    { id: "u3", name: "Dr. Karthik Iyer", role: "scientist", state: "Tamil Nadu", active: true },
    { id: "u4", name: "Priya Menon", role: "nutritionist", state: "Kerala", active: false },
    { id: "u5", name: "Rohan Patel", role: "coach", state: "Maharashtra", active: true },
  ];

  return (
    <div>
      <PageHeader title="Federation Admin Workspace" subtitle="Org KPIs · state rollups · users · audit log" actions={<Badge variant="outline" className="text-[10px]"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>} />
      <div className="grid grid-cols-5 gap-3 px-6 pt-4">
        <KpiCard label="Total athletes" value={athletes.length} />
        <KpiCard label="Active injuries" value={injuries.filter(i => i.status === "Active").length} tone="bad" />
        <KpiCard label="Cost / athlete" value="₹4.2L" />
        <KpiCard label="Talent pipeline" value={athletes.filter(a => a.age < 21).length} />
        <KpiCard label="Academies" value={academies.length} />
      </div>

      <div className="grid grid-cols-12 gap-3 p-6">
        {/* State rollup */}
        <div className="col-span-12 lg:col-span-5 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">State rollup</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">State</th><th className="text-right pb-2">Athletes</th><th className="text-right pb-2">Injured</th><th className="text-right pb-2">Rate</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stateRollup.map(r => (
                <tr key={r.state.id}>
                  <td className="py-1.5">{r.state.name}</td>
                  <td className="py-1.5 text-right font-mono">{r.athletes}</td>
                  <td className="py-1.5 text-right font-mono">{r.injured}</td>
                  <td className="py-1.5 text-right font-mono text-[color:var(--warning)]">{r.athletes ? ((r.injured/r.athletes)*100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users */}
        <div className="col-span-12 lg:col-span-7 surface p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Users & roles</div>
            <Button size="sm" className="h-7 text-[11px]" onClick={() => toast.success("Invite link copied")}>Invite user</Button>
          </div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left pb-2">Name</th><th className="text-left pb-2">Role</th><th className="text-left pb-2">Scope</th><th className="text-left pb-2">Status</th><th className="text-right pb-2">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fakeUsers.map(u => (
                <tr key={u.id}>
                  <td className="py-1.5">{u.name}</td>
                  <td className="py-1.5">
                    <select className="bg-transparent border border-border rounded text-[11px] px-1 py-0.5" defaultValue={u.role}>
                      {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 font-mono text-[11px] text-muted-foreground">{u.state}</td>
                  <td className="py-1.5"><Badge variant={u.active ? "default" : "outline"} className="text-[9px]">{u.active ? "Active" : "Suspended"}</Badge></td>
                  <td className="py-1.5 text-right">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => toast(`Role updated for ${u.name}`)}>Save</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Broadcast */}
        <div className="col-span-12 lg:col-span-5 surface p-4 space-y-2">
          <div className="flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5 text-primary" /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Broadcast announcement</span></div>
          <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="National camp eligibility window opens Monday…" className="w-full h-20 text-[12px] bg-input/60 border border-border rounded p-2 outline-none focus:border-primary" />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setAnnouncement("")}>Clear</Button>
            <Button size="sm" className="h-7 text-[11px]" onClick={() => { if (announcement) { toast.success("Broadcast sent to 320 users"); setAnnouncement(""); } }}>Broadcast</Button>
          </div>
        </div>

        {/* Audit log */}
        <div className="col-span-12 lg:col-span-7 surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Audit log — recent activity</div>
          <div className="space-y-1 max-h-[260px] overflow-y-auto">
            {audit.map((e, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_auto] gap-3 text-[11px] border-b border-border pb-1">
                <span className="font-mono text-muted-foreground uppercase">{e.actor}</span>
                <span>{e.action}{e.note ? ` — ${e.note}` : ""}</span>
                <span className="font-mono text-muted-foreground">{formatDistanceToNow(new Date(e.at), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
