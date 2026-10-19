# AI Work Planner

Canonical project folder:
`G:\내 드라이브\경영\창업\2026_이루티\2026_프로젝트\to_do`

Open this folder as a local project in Codex to continue development. The source
repository and Git history live here. Google Drive server synchronization is
managed by Drive for desktop and is independent of local save verification.

A personal, Korean-first work planner that combines project to-dos, task deadlines,
multiple work-time blocks, calendar events, AI-assisted capture, and a morning Daily
Briefing in one workspace.

## Run locally

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The initial milestone runs with local seed data and
does not require external credentials.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Optional Supabase connection

1. Create a Supabase project you control.
2. Copy `.env.example` to `.env.local` and fill in the public values.
3. Review `supabase/migrations/0001_initial_schema.sql`.
4. Link/apply it with the Supabase CLI only after confirming the target project.

The scaffold does not link, migrate, deploy, or write to any external service on its
own. Google Calendar integration is represented in the schema and architecture but
is not activated.

## Product references

- `PRD.md` — fixed V1 behavior and scope
- `ARCHITECTURE.md` — technical boundaries and data model
- `TASKS.md` — implementation roadmap
- `AGENTS.md` — instructions for Codex and contributors
