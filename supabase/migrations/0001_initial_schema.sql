-- AI Work Planner V1
-- Apply only after linking the Supabase CLI to a reviewed development project.

create extension if not exists pgcrypto;

create type public.task_status as enum ('inbox', 'planned', 'in_progress', 'done', 'cancelled');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.calendar_event_kind as enum ('official', 'personal');
create type public.ai_capture_status as enum ('received', 'analyzing', 'reviewing', 'confirmed', 'cancelled', 'failed');
create type public.ai_suggestion_kind as enum ('task', 'time_block', 'calendar_event');
create type public.integration_provider as enum ('google_calendar', 'slack', 'google_chat');
create type public.sync_state as enum ('pending', 'synced', 'failed', 'conflict', 'deleted');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  timezone text not null default 'Asia/Seoul',
  locale text not null default 'ko-KR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  color text not null default '#6558D3' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  notes text,
  status public.task_status not null default 'inbox',
  priority public.task_priority not null default 'medium',
  due_at timestamptz,
  estimate_minutes integer check (estimate_minutes is null or estimate_minutes > 0),
  labels text[] not null default '{}',
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_state_consistent check (
    (status = 'done' and completed_at is not null)
    or (status <> 'done' and completed_at is null)
  )
);

-- A task deadline lives on tasks.due_at. Planned work lives in zero-to-many rows
-- here, so splitting or moving work never changes the deadline accidentally.
create table public.task_time_blocks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 300),
  notes text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  source text not null default 'manual' check (source in ('manual', 'ai', 'rescheduled')),
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_time_block_range check (end_at > start_at)
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 300),
  description text,
  location text,
  kind public.calendar_event_kind not null default 'personal',
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  sync_to_google boolean not null default false,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_event_range check (end_at > start_at),
  constraint only_official_events_sync check (
    sync_to_google = false or (kind = 'official' and confirmed_at is not null)
  )
);

create table public.ai_captures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  raw_input text not null check (char_length(raw_input) between 1 and 10000),
  status public.ai_capture_status not null default 'received',
  timezone text not null,
  model text,
  structured_draft jsonb,
  validation_warnings jsonb not null default '[]'::jsonb,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint capture_terminal_state_consistent check (
    (status = 'confirmed' and confirmed_at is not null and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null and confirmed_at is null)
    or (status not in ('confirmed', 'cancelled') and confirmed_at is null and cancelled_at is null)
  )
);

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  capture_id uuid not null references public.ai_captures(id) on delete cascade,
  kind public.ai_suggestion_kind not null,
  payload jsonb not null,
  confidence numeric(4, 3) check (confidence between 0 and 1),
  warnings jsonb not null default '[]'::jsonb,
  accepted boolean,
  user_edited_payload jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.daily_briefings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  briefing_date date not null,
  timezone text not null,
  summary text not null,
  snapshot jsonb not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, briefing_date)
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider public.integration_provider not null,
  status text not null default 'disconnected' check (status in ('disconnected', 'connected', 'error')),
  provider_account_id text,
  selected_calendars jsonb not null default '[]'::jsonb,
  sync_cursor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider)
);

-- Kept separate from the browser-readable integration metadata. This table has RLS
-- but intentionally has no user policies; only a trusted server/service role may
-- read or write encrypted provider credentials.
create table public.integration_secrets (
  integration_id uuid primary key references public.integrations(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  token_ciphertext text not null,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_sync_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  integration_id uuid not null references public.integrations(id) on delete cascade,
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  provider_calendar_id text not null,
  provider_event_id text,
  provider_etag text,
  state public.sync_state not null default 'pending',
  direction text not null check (direction in ('inbound', 'outbound')),
  last_error text,
  last_attempted_at timestamptz,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, calendar_event_id)
);

create index projects_owner_active_idx on public.projects (owner_id, sort_order) where archived_at is null;
create index tasks_owner_status_due_idx on public.tasks (owner_id, status, due_at);
create index tasks_project_idx on public.tasks (project_id, sort_order);
create index time_blocks_owner_start_idx on public.task_time_blocks (owner_id, start_at);
create index time_blocks_task_idx on public.task_time_blocks (task_id, start_at);
create index events_owner_start_idx on public.calendar_events (owner_id, start_at);
create index events_sync_candidate_idx on public.calendar_events (owner_id, updated_at)
  where kind = 'official' and sync_to_google = true;
create index ai_captures_owner_created_idx on public.ai_captures (owner_id, created_at desc);
create index ai_suggestions_capture_idx on public.ai_suggestions (capture_id);
create index sync_records_state_idx on public.calendar_sync_records (owner_id, state, last_attempted_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();
create trigger task_time_blocks_set_updated_at before update on public.task_time_blocks
  for each row execute procedure public.set_updated_at();
create trigger calendar_events_set_updated_at before update on public.calendar_events
  for each row execute procedure public.set_updated_at();
create trigger ai_captures_set_updated_at before update on public.ai_captures
  for each row execute procedure public.set_updated_at();
create trigger integrations_set_updated_at before update on public.integrations
  for each row execute procedure public.set_updated_at();
create trigger integration_secrets_set_updated_at before update on public.integration_secrets
  for each row execute procedure public.set_updated_at();
create trigger calendar_sync_records_set_updated_at before update on public.calendar_sync_records
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_time_blocks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.ai_captures enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.daily_briefings enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_secrets enable row level security;
alter table public.calendar_sync_records enable row level security;

revoke all on table public.integration_secrets from anon, authenticated;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "projects_select_own" on public.projects for select using (owner_id = auth.uid());
create policy "projects_insert_own" on public.projects for insert with check (owner_id = auth.uid());
create policy "projects_update_own" on public.projects for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "projects_delete_own" on public.projects for delete using (owner_id = auth.uid());

create policy "tasks_select_own" on public.tasks for select using (owner_id = auth.uid());
create policy "tasks_insert_own" on public.tasks for insert with check (
  owner_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "tasks_update_own" on public.tasks for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "tasks_delete_own" on public.tasks for delete using (owner_id = auth.uid());

create policy "time_blocks_select_own" on public.task_time_blocks for select using (owner_id = auth.uid());
create policy "time_blocks_insert_own" on public.task_time_blocks for insert with check (
  owner_id = auth.uid() and (task_id is null or exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid()))
);
create policy "time_blocks_update_own" on public.task_time_blocks for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid() and (task_id is null or exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid()))
);
create policy "time_blocks_delete_own" on public.task_time_blocks for delete using (owner_id = auth.uid());

create policy "events_select_own" on public.calendar_events for select using (owner_id = auth.uid());
create policy "events_insert_own" on public.calendar_events for insert with check (owner_id = auth.uid());
create policy "events_update_own" on public.calendar_events for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "events_delete_own" on public.calendar_events for delete using (owner_id = auth.uid());

create policy "captures_select_own" on public.ai_captures for select using (owner_id = auth.uid());
create policy "captures_insert_own" on public.ai_captures for insert with check (owner_id = auth.uid());
create policy "captures_update_own" on public.ai_captures for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "captures_delete_own" on public.ai_captures for delete using (owner_id = auth.uid());

create policy "suggestions_select_own" on public.ai_suggestions for select using (owner_id = auth.uid());
create policy "suggestions_insert_own" on public.ai_suggestions for insert with check (
  owner_id = auth.uid() and exists (select 1 from public.ai_captures c where c.id = capture_id and c.owner_id = auth.uid())
);
create policy "suggestions_update_own" on public.ai_suggestions for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "suggestions_delete_own" on public.ai_suggestions for delete using (owner_id = auth.uid());

create policy "briefings_select_own" on public.daily_briefings for select using (owner_id = auth.uid());
create policy "briefings_insert_own" on public.daily_briefings for insert with check (owner_id = auth.uid());
create policy "briefings_update_own" on public.daily_briefings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "briefings_delete_own" on public.daily_briefings for delete using (owner_id = auth.uid());

create policy "integrations_select_own" on public.integrations for select using (owner_id = auth.uid());
create policy "integrations_insert_own" on public.integrations for insert with check (owner_id = auth.uid());
create policy "integrations_update_own" on public.integrations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "integrations_delete_own" on public.integrations for delete using (owner_id = auth.uid());

create policy "sync_records_select_own" on public.calendar_sync_records for select using (owner_id = auth.uid());
create policy "sync_records_insert_own" on public.calendar_sync_records for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.integrations i where i.id = integration_id and i.owner_id = auth.uid())
  and exists (
    select 1 from public.calendar_events e
    where e.id = calendar_event_id and e.owner_id = auth.uid()
      and (direction = 'inbound' or (e.kind = 'official' and e.sync_to_google = true and e.confirmed_at is not null))
  )
);
create policy "sync_records_update_own" on public.calendar_sync_records for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "sync_records_delete_own" on public.calendar_sync_records for delete using (owner_id = auth.uid());

comment on column public.tasks.due_at is 'Deadline only. Planned execution time belongs in task_time_blocks.';
comment on table public.task_time_blocks is 'Zero-to-many planned work sessions per task; independent from the task deadline.';
comment on column public.calendar_events.sync_to_google is 'True only for explicitly confirmed official events.';
comment on table public.integration_secrets is 'Server-only encrypted provider credentials. No anon/authenticated grants or RLS policies.';
