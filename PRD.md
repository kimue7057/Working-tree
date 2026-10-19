# AI Work Planner V1 — Product Requirements

## 1. Product summary

AI Work Planner is a personal work-management workspace that unifies project-based
to-dos and calendar planning. It helps one person decide **what must be done** and
**when to work on it** without confusing a task deadline with the time reserved to
do the work.

V1 is intentionally single-user. It establishes a dependable personal workflow
before expanding to workplace collaboration.

## 2. Product principles

1. **One planning surface:** to-dos, deadlines, time blocks, and calendar events are
   visible together.
2. **Deadline is not work time:** `due_at` describes when work is due; one or more
   time blocks describe when the user plans to work.
3. **AI proposes, the user decides:** no AI output is saved until the user has
   reviewed and explicitly confirmed it.
4. **External calendars stay clean:** only official events are eligible for Google
   Calendar sync. Tasks and personal work blocks remain local unless the user
   deliberately changes their classification.
5. **Progressive scope:** V1 serves one person; V1.1 adds Slack/Google Chat intake;
   V2 adds organizations, teams, assignments, and shared planning.

## 3. Primary workflow

### 3.1 Manual planning

1. Create or select a project.
2. Add a task with title, priority, status, estimate, and optional deadline.
3. Add zero or more work-time blocks to the task.
4. See deadlines and work blocks together in Month, Week, Today, or Timetable view.
5. Complete, reschedule, or edit the task without losing the distinction between
   its deadline and its work blocks.

### 3.2 AI natural-language intake

The save boundary is mandatory:

`Natural-language input → analysis → validation → preview/edit → explicit user confirmation → save`

Example input:

> Prepare the October operations report by Friday. Work on the draft Tuesday 2–4
> PM and review it Thursday morning. The client meeting Friday at 3 PM is official.

The preview must separate:

- task title and project;
- deadline;
- estimate, priority, and labels;
- multiple proposed work blocks;
- official calendar events;
- warnings, ambiguities, and conflicts.

The user can edit, remove, or reclassify every suggestion. Closing or cancelling
the preview persists nothing. A single, explicit **Confirm and save** action writes
the accepted items in one transaction.

### 3.3 Daily Briefing

Each morning, the Today view presents a concise briefing containing:

- today's official schedule;
- overdue and due-today tasks;
- planned work blocks;
- schedule conflicts or overloaded periods;
- the three highest-impact recommended priorities;
- unscheduled work that needs attention.

V1 generates this briefing in the app. Delivery to Slack or Google Chat is deferred
to V1.1.

## 4. Information architecture and screens

### 4.1 Three-pane desktop layout

**Left navigation**

- Inbox, Today, Upcoming, and Calendar shortcuts
- project list with task counts and project colors
- add-project action
- settings/integration entry point

**Center planning canvas**

- date navigation and Month / Week / Today / Timetable switcher
- calendar grid that shows official events, task deadlines, and work blocks with
  visually distinct treatments
- click an empty time range to create a block or event
- click an item to open details

**Right focus panel**

- Daily Briefing summary
- tasks filtered by the selected project/date
- completion toggles, priority, deadline, estimate, and scheduled-block count
- natural-language AI capture entry point

On smaller screens, the panes stack and remain usable; desktop is the primary V1
target.

### 4.2 Calendar views

- **Month:** workload and deadline overview; compact item chips per day.
- **Week:** seven-day time grid for scheduling and conflict inspection.
- **Today:** briefing-first agenda for execution.
- **Timetable:** project-colored schedule emphasizing planned work blocks.

The same underlying records power all views. Changing view does not duplicate data.

## 5. Functional requirements

### Projects

- Create, rename, recolor, archive, and select a project.
- Every task belongs to one project in V1.
- Archived projects remain queryable but are hidden by default.

### Tasks

- Fields: title, notes, status, priority, deadline, estimate, labels, and sort order.
- Statuses: inbox, planned, in progress, done, cancelled.
- Priorities: low, medium, high, urgent.
- Complete/reopen and reschedule from the planning surface.
- Support zero-to-many time blocks.

### Time blocks

- Start/end, optional task, title, notes, source, and lock state.
- A block may be split, moved, shortened, or deleted independently of its task.
- Overlaps are allowed but generate a warning.

### Calendar events

- Official and personal/local classifications.
- Only `official` events with sync explicitly enabled enter the Google Calendar
  outbound queue.
- Imported provider records retain external IDs and sync status.
- Deleting or changing an external event requires a separate, explicit action.

### AI intake

- Preserve the original input and structured draft for audit/debugging.
- Validate required fields, date ranges, duplicates, and scheduling conflicts.
- Attach a confidence value and warnings to each suggestion.
- Save accepted suggestions atomically after confirmation.
- Never execute provider sync during analysis or preview.

### Daily Briefing

- Generated per local date and timezone.
- Can be regenerated after material schedule changes.
- Stores a structured snapshot so the user can understand what was considered.

## 6. Non-functional requirements

- Keyboard-accessible navigation and controls; visible focus states.
- Responsive at 360 px and above, optimized for 1280–1600 px desktop.
- Korean-first copy with UTF-8 throughout; architecture permits localization.
- Row-level security isolates all user data.
- Dates stored as timezone-aware timestamps; user timezone stored on profile.
- AI analysis and confirmation are auditable.
- Useful empty, loading, error, and offline-safe states.

## 7. Integrations and scope boundaries

### V1

- Google Calendar: OAuth design and schema, import of selected calendars, outbound
  sync only for confirmed official events.
- No automated external writes in the scaffold.

### V1.1

- Slack and Google Chat message intake and briefing delivery.
- Messages still pass through the same preview and confirmation boundary.

### V2

- Organizations, teams, roles, assignments, shared projects, comments, activity
  logs, and team-level planning.
- Collaboration must extend the V1 model without weakening per-user permissions or
  confirmation semantics.

## 8. V1 acceptance criteria

- The three-pane planner and all four view switches are present and responsive.
- Users can filter a project, inspect tasks, distinguish deadlines/work blocks/
  official events, and complete a task in the UI.
- Natural-language capture produces an editable preview and persists locally only
  after explicit confirmation in the demo.
- Supabase schema models projects, tasks, multiple time blocks, events, AI intake,
  briefings, integrations, and sync state with RLS.
- The app can be linted, type-checked, and built from a fresh install.
- No external service is modified or deployed as part of repository setup.
