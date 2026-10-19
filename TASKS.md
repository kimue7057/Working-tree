# AI Work Planner Delivery Plan

Status legend: `[x]` done, `[~]` prepared/scaffolded, `[ ]` remaining.

## Phase 1 — Foundation

- [x] Capture product requirements and fixed scope boundaries.
- [x] Initialize Git repository and Next.js/TypeScript project.
- [x] Add responsive three-pane planner shell.
- [x] Add Month, Week, Today, and Timetable view switching.
- [x] Add project filtering, task completion, Daily Briefing, and visual legend.
- [x] Add AI capture → validation/preview → edit → confirm demo flow.
- [x] Model Supabase tables, indexes, triggers, constraints, and RLS.
- [x] Add environment template and Supabase client factory.
- [ ] Connect UI repositories to a real Supabase development project.

## Phase 2 — Personal planning persistence

- [ ] Add Supabase Auth and onboarding/profile timezone selection.
- [ ] Implement project CRUD and archive behavior.
- [ ] Implement task CRUD, filters, labels, and optimistic completion.
- [ ] Implement multi-block scheduling, moving, splitting, and conflict warnings.
- [ ] Add Month/Week/Today/Timetable date navigation backed by real records.
- [ ] Add empty, loading, error, and retry states.
- [ ] Add unit tests for deadline/block separation and schedule validation.
- [ ] Add Playwright flows for task creation and AI confirmation cancellation.

## Phase 3 — AI workflow

- [ ] Define the production structured-output prompt and model adapter.
- [ ] Validate all model output with Zod and deterministic business rules.
- [ ] Detect ambiguous dates, duplicates, overlaps, and timezone issues.
- [ ] Persist capture/suggestion audit records.
- [ ] Implement atomic `confirm_ai_capture` database function.
- [ ] Ensure cancel/close produces no planner writes.
- [ ] Add safety, rate-limit, timeout, and retry behavior.

## Phase 4 — Google Calendar

- [ ] Implement Google OAuth on the server and encrypt refresh tokens.
- [ ] Let users select calendars for import.
- [ ] Implement cursor-based inbound sync and webhook renewal.
- [ ] Implement an outbox for confirmed official events only.
- [ ] Add idempotency, retry, conflict, deletion, and disconnect behavior.
- [ ] Complete provider integration and privacy tests.

## Phase 5 — Daily Briefing and V1 release

- [ ] Generate and store timezone-aware briefing snapshots.
- [ ] Add priority recommendations, overload/conflict detection, and regeneration.
- [ ] Complete accessibility, responsive, performance, and security review.
- [ ] Add observability and operational runbook.
- [ ] Prepare deployment only after the user selects and approves targets.

## Deferred by product decision

- [ ] **V1.1:** Slack intake/briefing delivery.
- [ ] **V1.1:** Google Chat intake/briefing delivery.
- [ ] **V2:** organizations, teams, roles, assignments, shared projects, comments,
  and team planning.
