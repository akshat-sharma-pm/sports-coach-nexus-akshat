import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity, Users, UserPlus, CalendarDays, Dumbbell, Stethoscope,
  PersonStanding, HeartPulse, FlaskConical, Salad, Trophy, BarChart3, Sparkles, Layers,
  LayoutDashboard, Plug,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { useRole, can } from "@/lib/rbac";

const nav = [
  { group: "Workspaces", items: [
    { key: "ws-coach", title: "Coach", url: "/workspace/coach", icon: LayoutDashboard },
    { key: "ws-scientist", title: "Sports Scientist", url: "/workspace/scientist", icon: LayoutDashboard },
    { key: "ws-physio", title: "Physio", url: "/workspace/physio", icon: LayoutDashboard },
    { key: "ws-nutritionist", title: "Nutritionist", url: "/workspace/nutritionist", icon: LayoutDashboard },
    { key: "ws-admin", title: "Federation Admin", url: "/workspace/admin", icon: LayoutDashboard },
  ]},
  { group: "Operations", items: [
    { key: "command", title: "AI Command Center", url: "/", icon: Activity },
    { key: "registry", title: "Athlete Registry", url: "/registry", icon: Users },
    { key: "onboarding", title: "Onboarding", url: "/onboarding", icon: UserPlus },
  ]},
  { group: "Performance", items: [
    { key: "training", title: "Training & Periodisation", url: "/training", icon: CalendarDays },
    { key: "sessions", title: "Session Builder", url: "/training/sessions/new", icon: Dumbbell },
    { key: "sports-science", title: "Sports Science", url: "/sports-science", icon: FlaskConical },
    { key: "assessments", title: "Assessment & Talent ID", url: "/assessments", icon: Trophy },
  ]},
  { group: "Medical", items: [
    { key: "medical", title: "Medical & Injury", url: "/medical", icon: Stethoscope },
    { key: "body-map", title: "Body Map", url: "/medical/body-map", icon: PersonStanding },
    { key: "rehab", title: "Rehab Workflow", url: "/rehab", icon: HeartPulse },
  ]},
  { group: "Support", items: [
    { key: "nutrition", title: "Nutrition", url: "/nutrition", icon: Salad },
    { key: "analytics", title: "Analytics & BI", url: "/analytics", icon: BarChart3 },
    { key: "integrations", title: "Integrations", url: "/integrations", icon: Plug },
    { key: "copilot", title: "AI Copilot", url: "/copilot", icon: Sparkles },
  ]},
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { role } = useRole();
  const isActive = (url: string) => url === "/" ? path === "/" : path.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary/15 grid place-items-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-wide">USI</div>
              <div className="text-[10px] text-muted-foreground">Unified Sports Interface</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {nav.map((g) => {
          const items = g.items.filter((i) => can(role, i.key));
          if (!items.length) return null;
          return (
            <SidebarGroup key={g.group}>
              {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">{g.group}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2 text-[13px]">
                          <item.icon className="w-4 h-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
