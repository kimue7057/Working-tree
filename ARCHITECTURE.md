# AI Work Planner V1 — Architecture

## 1. Stack

- Next.js App Router + React + TypeScript
- Plain CSS with design tokens (no component framework dependency)
- Supabase Postgres, Auth, and Row Level Security
- Zod for input boundary validation
- `@supabase/supabase-js` for browser/server data access
- `date-fns` for calendar calculations and localization

The first UI milestone uses typed seed data and local React state so the experience
is testable without credentials. Repositories can be switched to Supabase once the
environment is configured.

## 2. Layering

```text
app/                     routes, layouts, server endpoints
components/              interactive planning UI
lib/domain/              domain types and validation rules
lib/data/                seed data and future repository implementations
lib/supabase/            Supabase client factories
supabase/migrations/     versioned database schema and RLS
```

UI components depend on domain types, not raw database rows. Database mapping and
provider integration belong behind repository/service boundaries.

## 3. Core domain model

```text
Profile 1 ── * Project 1 ── * Task 1 ── * TaskTimeBlock
   │                         │
   ├── * CalendarEvent       └── deadline is Task.due_at (not a block)
   ├── * AiCapture 1 ── * AiSuggestion
   ├── * DailyBriefing
   └── * Integration 1 ── * CalendarSyncRecord
```

- `Task.due_at`: completion deadline.
- `TaskTimeBlock.start_at/end_at`: planned execution time; multiple rows per task.
- `CalendarEvent.kind`: `official` or `personal`.
- `CalendarEvent.sync_to_google`: an additional explicit opt-in. A database check
  prevents this flag from being true for non-official events.
- `AiCapture.status`: preserves the analyze/review/confirm lifecycle.
- `AiSuggestion.accepted`: records the user's final decision per proposed item.

## 4. AI save boundary

1. Client submits raw text and timezone.
2. Server stores/creates an `AiCapture` in `analyzing` state.
3. Model output is parsed into a strict Zod schema.
4. Deterministic validation checks dates, ownership, overlaps, and duplicates.
5. Capture moves to `reviewing`; UI receives suggestions plus warnings.
6. User edits and accepts/rejects suggestions.
7. A confirmation endpoint revalidates the complete payload and writes accepted
   tasks, blocks, and events in a single database transaction.
8. Confirmed official events may be queued for provider sync after the local
   transaction succeeds.

No step before 7 writes planner records. Google Calendar calls are never made from
the analysis request.

## 5. Google Calendar boundary

- OAuth tokens belong server-side and should be encrypted at rest.
- The integration stores selected provider calendar IDs and sync cursors.
- Inbound sync maps provider events to `calendar_events` and records external IDs.
- Outbound sync accepts only rows where `kind = 'official'`,
  `sync_to_google = true`, and user confirmation is recorded.
- Provider retries are idempotent using `(integration_id, local_event_id)` and the
  provider event ID.
- The initial repository contains schema only; it does not perform OAuth, remote
  writes, or deployment.

## 6. Security and tenancy

- Supabase Auth user IDs are the ownership root.
- Every user-owned table has RLS enabled and owner-scoped policies.
- Project-related child access is verified through the owning project/task.
- Service-role credentials never reach the browser.
- The public client uses only `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- API routes must validate both the session and input; client checks are UX only.

## 7. Environment strategy

The app starts without a Supabase environment in demo mode. Copy `.env.example` to
`.env.local` only when connecting an owned Supabase project. Apply migrations using
the Supabase CLI after reviewing the target project; setup does not link or mutate
any external project automatically.

## 8. Delivery strategy

1. **Foundation (current):** documents, repository, schema, responsive planner UI,
   local interaction demo.
2. **Persistence:** Auth, repositories, CRUD, optimistic updates, error states.
3. **AI flow:** model adapter, strict structured output, validation and atomic save.
4. **Calendar:** Google OAuth, selected-calendar import, official-event outbox.
5. **Hardening:** tests, accessibility, observability, backups, rate limits.
6. **V1.1/V2:** chat intake, then collaboration model.
