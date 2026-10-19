export type ViewMode = "month" | "week" | "today" | "timetable";

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "inbox" | "planned" | "in_progress" | "done";

export interface Project {
  id: string;
  name: string;
  color: string;
  openTaskCount: number;
}

export interface PlannerTask {
  id: string;
  projectId: string;
  title: string;
  dueLabel: string;
  estimateMinutes: number;
  priority: Priority;
  status: TaskStatus;
  blockCount: number;
}

export type CalendarEntryKind = "block" | "deadline" | "official";

export interface CalendarEntry {
  id: string;
  title: string;
  projectId?: string;
  kind: CalendarEntryKind;
  dayOffset: number;
  start: string;
  end?: string;
}

export interface AiDraft {
  taskTitle: string;
  projectId: string;
  deadline: string;
  blocks: Array<{ id: string; label: string }>;
  officialEvent: {
    title: string;
    schedule: string;
    syncToGoogle: boolean;
  };
}
