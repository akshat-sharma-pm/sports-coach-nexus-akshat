
# Unified Sports Interface (USI) — Build Plan

A production-grade-feeling enterprise SaaS prototype for athlete management. Frontend-only with realistic seeded data, mocked role switching, and deterministic simulated AI outputs.

## Design system

- **Theme:** Dark, dense, operational — Linear × Bloomberg terminal feel. Not marketing.
- **Palette (oklch in `src/styles.css`):** near-black background (`oklch(0.14 0.01 250)`), elevated surfaces, hairline borders, electric cyan primary, amber/rose for risk states, emerald for healthy.
- **Type:** JetBrains Mono for numerics/IDs, Inter for UI. Loaded via `<link>` in `__root.tsx`.
- **Components:** shadcn (Sidebar, Sheet for slide-overs, Dialog, Tabs, Table, Command, Tooltip, Progress, Chart via recharts).
- **Density:** compact spacing, monospaced metrics, status pills, sparkline cards, drill-down tables.

## App shell

- `SidebarProvider` + collapsible icon sidebar grouping all 13 modules.
- Top bar: org breadcrumb (Federation › State › Academy › Team › Athlete), global command palette (⌘K), role switcher (Athlete / Coach / Physio / Sports Scientist / Nutritionist / Federation Admin), notifications, AI Copilot toggle.
- Right-edge slide-over panel (Sheet) for athlete/session/injury detail across modules.
- Role context (React context + localStorage) gates nav items and action buttons.

## Routes (TanStack file-based)

```
/                              → AI Command Center (default)
/registry                      → Athlete Registry
/registry/$athleteId           → Athlete 360 profile (tabs: Overview, Training, Medical, Nutrition, Assessments)
/onboarding                    → Onboarding workflow board
/training                      → Periodisation calendar
/training/sessions/new         → Session Builder
/medical                       → Medical & Injury Intelligence
/medical/body-map              → Interactive Human Body Map
/rehab                         → Rehab Workflow (Kanban)
/sports-science                → Sports Science Dashboard
/nutrition                     → Nutrition Management
/assessments                   → Assessment & Talent ID
/analytics                     → Analytics & BI
/copilot                       → AI Copilot (full chat)
```

Each route file gets its own `head()` metadata. Index is the AI Command Center, not a placeholder.

## Module specs (operational, not marketing)

1. **AI Command Center** — KPI strip (athletes active, avg readiness, injury risk count, sessions today), AI insights feed, risk-ranked athlete watchlist, today's federation-wide schedule heatmap.
2. **Athlete Registry** — virtualized table with filters (federation/state/academy/team/sport/status), bulk actions, slide-over 360 profile, export.
3. **Onboarding** — multi-step Kanban (Invite → Docs → Medical clearance → Baseline tests → Active), per-athlete progress.
4. **Training & Periodisation** — macro/meso/micro cycle calendar grid, load (ACWR) per athlete, drag-to-reschedule (visual only).
5. **Session Builder** — left exercise library, center session timeline (warmup/main/cooldown blocks), right parameters (sets/reps/load/RPE), template save.
6. **Medical & Injury Intelligence** — injury log table, severity/status, AI-predicted high-risk athletes (deterministic scoring from load + sleep + prior injury), trend charts.
7. **Body Map** — clickable SVG anterior/posterior figure, regions tinted by injury density, click → slide-over with injury history at that site.
8. **Rehab Workflow** — Kanban (Acute / Subacute / Strength / Return-to-play / Cleared), per-athlete milestones, daily compliance.
9. **Sports Science Dashboard** — readiness (HRV, sleep, sRPE, wellness), GPS load, force-plate metrics, athlete comparison chart.
10. **Nutrition** — meal plan grid, macro targets vs actuals, hydration, supplement stack, compliance score.
11. **Assessment & Talent ID** — test battery results (sprint, jump, strength), percentile bars, talent score, scouting shortlist.
12. **Analytics & BI** — pivot-style drill-down (Federation → State → Academy → Team → Athlete), multi-chart dashboards, exportable.
13. **AI Copilot** — chat UI with canned operational prompts ("Who is at risk this week?", "Build a deload for Team U19"), deterministic markdown responses generated from seed data.

## Data & logic

- `src/data/seed.ts` — federations, states, academies, teams, ~120 athletes with realistic Indian/global names, sports (athletics, football, hockey, swimming, weightlifting), full longitudinal mocks (training load 60d, wellness, injuries, nutrition, assessments).
- `src/lib/ai.ts` — pure functions: `readinessScore`, `injuryRiskScore` (ACWR + sleep deficit + prior injury weight), `recommend(athlete)`, `copilotReply(prompt, ctx)`.
- `src/lib/rbac.ts` — role → allowed routes/actions map, `useRole()` hook.
- `src/store/ui.ts` — Zustand for slide-over panel state, selected athlete, filters.

## Tech notes

- Recharts for all charts. Lucide icons. date-fns. Zustand.
- No backend. No auth. No Lovable Cloud. No AI Gateway.
- All interactions are clickable and update local state (filters, kanban moves, slide-overs, role switch).

## Scope of first turn

Ship the full shell + all 13 routes with real (mock-data-backed) screens. Depth priority: Command Center, Registry+360, Training, Body Map, Sports Science, Analytics, Copilot get the richest UI; Onboarding, Session Builder, Rehab, Nutrition, Assessments, Medical get functional but lighter screens. Polish passes follow in later turns.
