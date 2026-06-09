import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRole, ROLES } from "@/lib/rbac";
import { useUI } from "@/store/ui";
import { federations, states, academies, teams } from "@/data/seed";
import { ChevronRight, Bell, Search, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { role, setRole } = useRole();
  const { scope, setScope } = useUI();
  const fed = federations[0];
  const state = states.find((s) => s.id === scope.stateId);
  const academy = academies.find((a) => a.id === scope.academyId);
  const team = teams.find((t) => t.id === scope.teamId);

  return (
    <header className="h-12 border-b border-border bg-sidebar/40 backdrop-blur flex items-center gap-2 px-2 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground" />
      <div className="h-5 w-px bg-border mx-1" />
      <nav className="flex items-center gap-1 text-[12px] text-muted-foreground font-mono">
        <span className="text-foreground">{fed.name}</span>
        <ChevronRight className="w-3 h-3 opacity-50" />
        <select
          className="bg-transparent border-none outline-none cursor-pointer hover:text-foreground"
          value={scope.stateId ?? ""}
          onChange={(e) => setScope({ federationId: fed.id, stateId: e.target.value || undefined })}
        >
          <option value="">All states</option>
          {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {scope.stateId && (
          <>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <select
              className="bg-transparent border-none outline-none cursor-pointer hover:text-foreground"
              value={scope.academyId ?? ""}
              onChange={(e) => setScope({ ...scope, academyId: e.target.value || undefined, teamId: undefined })}
            >
              <option value="">All academies</option>
              {academies.filter((a) => a.stateId === scope.stateId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </>
        )}
        {scope.academyId && (
          <>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <select
              className="bg-transparent border-none outline-none cursor-pointer hover:text-foreground"
              value={scope.teamId ?? ""}
              onChange={(e) => setScope({ ...scope, teamId: e.target.value || undefined })}
            >
              <option value="">All teams</option>
              {teams.filter((t) => t.academyId === scope.academyId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </>
        )}
      </nav>

      <div className="flex-1" />

      <div className="relative hidden md:block">
        <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search athletes, injuries, sessions…  ⌘K"
          className="h-7 w-72 pl-7 pr-2 rounded bg-input/60 border border-border text-[12px] outline-none focus:border-primary"
        />
      </div>

      <Select value={role} onValueChange={(v) => setRole(v as never)}>
        <SelectTrigger className="h-7 text-[12px] w-44 bg-input/60 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" className="h-7 w-7"><Bell className="w-4 h-4" /></Button>
      <Button asChild variant="outline" size="sm" className="h-7 text-[12px] gap-1">
        <Link to="/copilot"><Sparkles className="w-3.5 h-3.5 text-primary" /> Copilot</Link>
      </Button>
    </header>
  );
}
