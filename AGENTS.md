# AI Work Planner — project location

The canonical development repository is:
`G:\내 드라이브\경영\창업\2026_이루티\2026_프로젝트\to_do`.

This is a standalone local repository, relocated from the ChatGPT project mirror.
Use this directory for all further development.
GitHub remote: `https://github.com/kimue7057/Working-tree` (`origin`, branch `main`).
If `sources/` is added later, treat synced reference material there as read-only.


## Project instructions

This repository contains **AI Work Planner V1**, a personal work-management app
that combines project-based to-dos and calendar time blocks.

- Read `PRD.md`, `ARCHITECTURE.md`, and `TASKS.md` before changing product behavior.
- Preserve the V1 confirmation boundary: AI may analyze and suggest, but only an
  explicit user confirmation may persist tasks, events, or integration changes.
- A task deadline and its working-time blocks are different concepts. Never merge
  them into one timestamp, and allow multiple time blocks per task.
- Only events explicitly marked as official may be eligible for Google Calendar
  sync. Personal planning blocks remain local by default.
- V1 is single-user. Slack/Google Chat belong to V1.1; team collaboration belongs
  to V2. Do not expand scope silently.
- Keep Supabase migrations additive and review row-level security for every table.
- Never commit secrets. Update `.env.example` when adding environment variables.
- Before handing off code, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
