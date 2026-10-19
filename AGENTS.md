# ChatGPT project context

This directory is a local mirror of the ChatGPT project “업무관리 시스템”.

- Treat every file under `sources/` as read-only reference material.
- Do not edit, rename, move, or delete synced project files.
- These files may be replaced the next time a task is created from this ChatGPT project.


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
