# USI — Role Workspaces, AI Engines & Injury→RTP Flow

Builds on the existing shell, seed data, RBAC, and detail panel. No backend; deterministic mock outputs; all state via Zustand so actions, approvals, and stage transitions feel real.

## 1. Role-specific workspaces (5 new routes)

New routes under `/workspace/*`, auto-selected when the role-switcher changes (TopBar redirects to that role's workspace; manual nav still works).

```text
/workspace/coach          → Coach Workspace
/workspace/scientist      → Sports Scientist Workspace
/workspace/physio         → Physiotherapist Workspace
/workspace/nutritionist   → Nutritionist Workspace
/workspace/admin          → Federation Admin Workspace
```

Each workspace = dense 3-column operational console (not marketing):

- **Coach** — Today's session card, squad readiness heatmap, ACWR watchlist, drag-to-adjust load slider, "Approve session plan" action, AI-suggested substitutions.
- **Sports Scientist** — Live wearables feed, HRV/sleep/load trend grid, force-plate asymmetry table, anomaly queue, "Flag for review" + "Push to coach" actions.
- **Physio** — Inbox of athlete-reported issues, triage queue, active rehab cases by phase, RTP approvals pending, body-map mini.
- **Nutritionist** — Compliance leaderboard, macro deficits, meal-plan assignments, hydration alerts, "Send plan" action.
- **Federation Admin** — Org KPIs (athletes, injuries, cost/athlete, talent pipeline), state/academy rollups, user/role management table, audit log, broadcast announcement.

Sidebar gets a new "Workspaces" group; RBAC gates each route to its role + admin.

## 2. AI engines (deterministic, in `src/lib/ai.ts` + new `src/lib/ai-engines.ts`)

- **AI Risk Engine** — extends existing `injuryRiskScore` with contributing-factor breakdown (load, sleep, prior, wellness, asymmetry). Output: score, level, top 3 drivers, recommended mitigations. New `RiskEngineCard` component.
- **AI Readiness Engine** — extends `readinessScore`; daily traffic-light per athlete with HRV/sleep/sRPE/soreness contributions and confidence band. New `ReadinessBoard` component.
- **AI Return-To-Play Advisor** — given an injury: predicted RTP date, current phase, gating criteria checklist (pain, ROM, strength symmetry, sport-specific test), pass/fail per criterion, recommended next session. New `RTPAdvisor` component, embedded in detail panel + rehab cards.

All three are pure functions of seed data → memoized. Surfaced in Command Center, workspaces, and detail panel.

## 3. Athlete Digital Twin

New route `/registry/$athleteId/twin` (tab inside existing Athlete 360) and a `DigitalTwin` component:

- Left: rotatable SVG body silhouette (reuses body-map) with overlay layers (load, soreness, injury history, asymmetry).
- Middle: live vitals strip (HR, HRV, sleep, hydration, RPE) sourced from "wearables".
- Right: tabbed timeline (Training | Medical | Nutrition | Wellness) — unified longitudinal record.
- Bottom: AI panel — Risk, Readiness, RTP (if injured), Recommendations.

Layer toggles + date scrubber update overlays.

## 4. End-to-end flow: Report → Review → Rehab → RTP

State machine in new `src/store/cases.ts` (Zustand). Each "case" = `{ id, athleteId, reportedAt, symptoms, status, assignedPhysioId, diagnosis, rehabPhase, rtpCriteria, approvals[] }`. Statuses: `Reported → Triaged → Diagnosed → Rehab(Acute|Subacute|Strength|RTP) → RTP-Review → Cleared`.

Demonstrable clickable flow:

1. **Athlete role** → `/medical` → "Report Issue" button → modal (region via body-map click, severity, pain scale, notes) → creates case (status `Reported`) → toast + appears in Physio inbox.
2. **Physio role** → workspace inbox → click case → slide-over with triage form → "Accept & Diagnose" → status `Diagnosed`, RTP advisor initializes criteria, case lands in Rehab Kanban Acute column.
3. **Rehab workflow** → existing Kanban now reads from `cases` store; drag card across phases updates status; each phase shows RTP criteria progress.
4. **RTP Approval** → in final column, "Request RTP Clearance" → status `RTP-Review`; requires sign-off from Physio + Coach (two-step approval, recorded in `approvals[]` with role + timestamp); admin can override. On both approvals → `Cleared`, athlete returns to active roster, audit entry written.

Activity feed component (`CaseTimeline`) shows every transition, visible in detail panel.

## 5. Wearables & GPS integrations panel

New route `/integrations` + a compact widget reused in Sports Scientist workspace.

- Provider tiles: **Garmin**, **Catapult GPS**, **Polar**, **Generic Wearables (Apple/WHOOP/Oura)**.
- Each tile: status (Connected/Syncing/Error), last sync timestamp, device count, data streams listed (HR, HRV, GPS, accel, sleep), "Sync now" / "Disconnect" / "Configure" actions (mocked, animate sync, update last-sync timestamp).
- Per-athlete device assignment table.
- Incoming data preview (last 10 metrics with provider badge), feeding the Digital Twin vitals strip and Sports Scientist live feed.

Data generated deterministically from seed; "Sync now" advances the mock clock.

## 6. Cross-cutting

- New approval primitive: `ApprovalChip` (pending/approved/rejected, who, when) used in RTP and session-plan flows.
- Toast notifications via existing `sonner` on every state change.
- Audit log appended to `cases` store; visible in Federation Admin workspace.
- Role-switcher in TopBar deep-links to the relevant workspace on change.

## Technical section

**New files**
- `src/routes/workspace.coach.tsx`, `workspace.scientist.tsx`, `workspace.physio.tsx`, `workspace.nutritionist.tsx`, `workspace.admin.tsx`
- `src/routes/integrations.tsx`
- `src/routes/registry.$athleteId.twin.tsx` (or tab inside existing detail route)
- `src/components/digital-twin.tsx`, `risk-engine-card.tsx`, `readiness-board.tsx`, `rtp-advisor.tsx`, `case-timeline.tsx`, `approval-chip.tsx`, `report-issue-dialog.tsx`, `integration-tile.tsx`
- `src/lib/ai-engines.ts` (risk factors, readiness contributions, RTP criteria evaluator)
- `src/store/cases.ts` (Zustand: cases[], actions report/triage/diagnose/advancePhase/requestRTP/approveRTP)
- `src/data/integrations.ts` (provider configs, mock sync state)

**Edits**
- `src/lib/rbac.tsx` — add workspace keys to `ROLE_ACCESS`.
- `src/components/app-sidebar.tsx` — add "Workspaces" + "Integrations" nav groups.
- `src/components/top-bar.tsx` — on role change, `navigate` to that role's workspace.
- `src/routes/rehab.tsx` — read from `cases` store instead of static injuries.
- `src/routes/medical.tsx` — add "Report Issue" CTA visible to athlete role.
- `src/components/detail-panel.tsx` — embed RTP Advisor + Case Timeline when injury/case selected.

**Determinism**
All engine outputs are pure functions of athlete + case state, memoized via `useMemo`. No randomness at render time.

**Scope of first build**
All five workspaces, all three AI engines, Digital Twin route, full Report→RTP state machine wired through Medical + Physio Workspace + Rehab Kanban + Detail Panel, Integrations route with 4 providers. No backend, no auth, no Lovable Cloud.
