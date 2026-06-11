import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRole, ROLES, ROLE_HOME } from "@/lib/rbac";
import type { Role } from "@/data/seed";
import { useUI } from "@/store/ui";
import { federations, states, academies, teams, athletes } from "@/data/seed";
import { ChevronRight, Bell, Search, Sparkles, AlertTriangle, Activity, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useMemo } from "react";
import { injuryRiskScore } from "@/lib/ai";


export function TopBar() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const { scope, setScope, openPanel } = useUI();
  const fed = federations[0];
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return athletes.filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q)).slice(0, 8);
  }, [query]);

  const notifications = useMemo(() => {
    const ranked = athletes.map(a => ({ a, r: injuryRiskScore(a) })).sort((x, y) => y.r - x.r).slice(0, 5);
    return ranked.map(({ a, r }) => ({ id: a.id, title: `${a.name} · risk ${r}`, kind: r >= 65 ? "alert" : "warn" as "alert" | "warn" }));
  }, []);

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

      <Popover open={openSearch && matches.length > 0} onOpenChange={setOpenSearch}>
        <PopoverTrigger asChild>
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpenSearch(true); }}
              onFocus={() => setOpenSearch(true)}
              placeholder="Search athletes by name or ID…"
              className="h-7 w-72 pl-7 pr-2 rounded bg-input/60 border border-border text-[12px] outline-none focus:border-primary"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
          {matches.map(a => (
            <button key={a.id} className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[12px] rounded hover:bg-accent text-left"
              onClick={() => { openPanel("athlete", a.id); setOpenSearch(false); setQuery(""); }}>
              <span className="truncate"><Activity className="w-3 h-3 inline mr-1.5 text-muted-foreground" />{a.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{a.id}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Select value={role} onValueChange={(v) => { const r = v as Role; setRole(r); navigate({ to: ROLE_HOME[r] }); }}>
        <SelectTrigger className="h-7 text-[12px] w-44 bg-input/60 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[color:var(--danger)]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 pb-2">High-risk alerts</div>
          {notifications.map(n => (
            <button key={n.id} className="w-full flex items-start gap-2 px-2 py-1.5 text-[12px] rounded hover:bg-accent text-left"
              onClick={() => openPanel("athlete", n.id)}>
              {n.kind === "alert" ? <ShieldAlert className="w-3.5 h-3.5 mt-0.5 text-[color:var(--danger)]" /> : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-[color:var(--warning)]" />}
              <span className="truncate">{n.title}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Button asChild variant="outline" size="sm" className="h-7 text-[12px] gap-1">
        <Link to="/copilot"><Sparkles className="w-3.5 h-3.5 text-primary" /> Copilot</Link>
      </Button>
    </header>
  );
}
