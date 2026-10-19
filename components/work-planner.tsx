"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Inbox,
  LayoutGrid,
  ListTodo,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  SunMedium,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { calendarEntries, initialTasks, projects } from "@/lib/data/seed";
import type {
  AiDraft,
  CalendarEntry,
  PlannerTask,
  Project,
  ViewMode,
} from "@/lib/domain/planner";

const viewLabels: Record<ViewMode, string> = {
  month: "월",
  week: "주",
  today: "오늘",
  timetable: "시간표",
};

const priorityLabels: Record<PlannerTask["priority"], string> = {
  urgent: "긴급",
  high: "높음",
  medium: "보통",
  low: "낮음",
};

const navItems = [
  { id: "inbox", label: "인박스", icon: Inbox, count: 3 },
  { id: "today", label: "오늘", icon: SunMedium, count: 5 },
  { id: "upcoming", label: "다가오는 일정", icon: CalendarDays, count: 0 },
  { id: "all", label: "모든 할 일", icon: ListTodo, count: 0 },
];

const defaultDraft: AiDraft = {
  taskTitle: "10월 운영 리포트 완성",
  projectId: "operations",
  deadline: "10월 23일 금요일 · 18:00",
  blocks: [
    { id: "draft", label: "10월 20일 화요일 · 14:00–16:00" },
    { id: "review", label: "10월 22일 목요일 · 09:30–10:30" },
  ],
  officialEvent: {
    title: "고객사 월간 리뷰",
    schedule: "10월 23일 금요일 · 15:00–16:00",
    syncToGoogle: true,
  },
};

function projectFor(id?: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

function EntryChip({ entry, compact = false }: { entry: CalendarEntry; compact?: boolean }) {
  const project = projectFor(entry.projectId);

  return (
    <button
      className={`entry-chip entry-${entry.kind}`}
      style={project ? ({ "--entry-color": project.color } as React.CSSProperties) : undefined}
      title={`${entry.start} ${entry.title}`}
      type="button"
    >
      <span className="entry-time">{entry.kind === "deadline" ? "마감" : entry.start}</span>
      <span className="entry-title">{entry.title}</span>
      {!compact && entry.end ? <span className="entry-end">{entry.end}</span> : null}
    </button>
  );
}

function MonthView({ selectedDate, today }: { selectedDate: Date; today: Date }) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
    });
  }, [selectedDate]);

  return (
    <section className="calendar-card month-view" aria-label="월간 캘린더">
      <div className="weekday-row">
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const dayEntries = calendarEntries.filter((entry) =>
            isSameDay(day, addDays(today, entry.dayOffset)),
          );
          const isToday = isSameDay(day, today);
          return (
            <div
              className={`day-cell ${!isSameMonth(day, selectedDate) ? "outside" : ""}`}
              key={day.toISOString()}
            >
              <div className="day-number-row">
                <span className={isToday ? "today-number" : ""}>{format(day, "d")}</span>
                {isToday ? <small>오늘</small> : null}
              </div>
              <div className="day-entries">
                {dayEntries.map((entry) => (
                  <EntryChip entry={entry} compact key={entry.id} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WeekView({ today }: { today: Date }) {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  return (
    <section className="calendar-card week-view" aria-label="주간 캘린더">
      <div className="week-header">
        <div />
        {days.map((day) => (
          <div className={isSameDay(day, today) ? "week-today" : ""} key={day.toISOString()}>
            <span>{format(day, "EEE", { locale: ko })}</span>
            <strong>{format(day, "d")}</strong>
          </div>
        ))}
      </div>
      <div className="week-body">
        <div className="hour-column">
          {hours.map((hour) => <span key={hour}>{`${hour}:00`}</span>)}
        </div>
        {days.map((day) => {
          const offset = Math.round((startOfDay(day).getTime() - today.getTime()) / 86400000);
          const items = calendarEntries.filter((entry) => entry.dayOffset === offset);
          return (
            <div className="week-column" key={day.toISOString()}>
              {hours.map((hour) => <div className="hour-line" key={hour} />)}
              {items.map((entry) => {
                const hour = Number(entry.start.split(":")[0]);
                const minute = Number(entry.start.split(":")[1]);
                const top = (hour - 9 + minute / 60) * 54;
                return (
                  <div className="week-entry" key={entry.id} style={{ top }}>
                    <EntryChip entry={entry} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TodayView() {
  const todayEntries = calendarEntries.filter((entry) => entry.dayOffset === 0);
  return (
    <section className="today-layout" aria-label="오늘 일정">
      <div className="today-lead">
        <span className="eyebrow">MONDAY FOCUS</span>
        <h2>오늘은 중요한 일 3개에<br />집중해 보세요.</h2>
        <p>회의 1개와 집중 업무 2시간 30분이 계획되어 있어요.</p>
        <div className="capacity-bar"><span /></div>
        <div className="capacity-label"><span>계획 4시간 30분</span><span>여유 2시간</span></div>
      </div>
      <div className="agenda-card">
        <div className="agenda-heading">
          <div><span className="status-dot" />오늘의 타임라인</div>
          <button type="button"><Plus size={16} /> 일정 추가</button>
        </div>
        {todayEntries.map((entry) => (
          <div className="agenda-row" key={entry.id}>
            <div className="agenda-time"><strong>{entry.start}</strong><span>{entry.end ?? "마감"}</span></div>
            <div className={`agenda-line agenda-${entry.kind}`} />
            <div className="agenda-copy">
              <span>{entry.kind === "official" ? "공식 일정" : entry.kind === "deadline" ? "업무 마감" : "집중 업무"}</span>
              <strong>{entry.title}</strong>
              {entry.projectId ? <small>{projectFor(entry.projectId)?.name}</small> : <small>Google Calendar</small>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimetableView({ today }: { today: Date }) {
  const days = Array.from({ length: 5 }, (_, index) => addDays(today, index));
  return (
    <section className="calendar-card timetable-view" aria-label="프로젝트별 시간표">
      <div className="timetable-header">
        <div>프로젝트</div>
        {days.map((day) => <div key={day.toISOString()}>{format(day, "M/d EEE", { locale: ko })}</div>)}
      </div>
      {projects.slice(0, 3).map((project) => (
        <div className="timetable-row" key={project.id}>
          <div className="timetable-project"><i style={{ background: project.color }} />{project.name}</div>
          {days.map((day, dayIndex) => {
            const entries = calendarEntries.filter(
              (entry) => entry.projectId === project.id && entry.dayOffset === dayIndex && entry.kind === "block",
            );
            return <div className="timetable-slot" key={day.toISOString()}>{entries.map((entry) => <EntryChip entry={entry} key={entry.id} />)}</div>;
          })}
        </div>
      ))}
      <div className="timetable-note"><Clock3 size={17} /> 업무 시간블록만 표시합니다. 마감일은 할 일 패널에서 확인할 수 있어요.</div>
    </section>
  );
}

function AiCapturePanel({ onClose, onSave }: { onClose: () => void; onSave: (title: string) => void }) {
  const [stage, setStage] = useState<"input" | "preview">("input");
  const [input, setInput] = useState("10월 운영 리포트를 금요일까지 끝내야 해. 화요일 오후 2시부터 4시까지 초안을 쓰고 목요일 오전에 검토할래. 금요일 3시 고객사 리뷰는 공식 일정이야.");
  const [draft, setDraft] = useState(defaultDraft);

  return (
    <div className="drawer-backdrop" role="presentation">
      <aside className="ai-drawer" aria-label="AI 업무 입력" aria-modal="true" role="dialog">
        <div className="drawer-header">
          <div className="ai-mark"><Sparkles size={18} /></div>
          <div><span>AI ASSISTANT</span><h2>{stage === "input" ? "자연어로 계획하기" : "저장 전 확인"}</h2></div>
          <button aria-label="닫기" className="icon-button" onClick={onClose} type="button"><X size={19} /></button>
        </div>

        {stage === "input" ? (
          <div className="drawer-content capture-input">
            <div className="flow-steps"><span className="active">1 입력</span><i /><span>2 검증·미리보기</span><i /><span>3 사용자 확정</span></div>
            <label htmlFor="natural-input">해야 할 일과 일정을 편하게 적어주세요.</label>
            <textarea id="natural-input" onChange={(event) => setInput(event.target.value)} value={input} />
            <div className="hint-card"><Zap size={17} /><p><strong>이렇게 이해해요</strong><br />할 일, 마감일, 작업할 시간, 공식 일정을 서로 분리해 제안합니다.</p></div>
            <button className="primary-button" disabled={!input.trim()} onClick={() => setStage("preview")} type="button">
              <Sparkles size={17} /> 분석하고 미리보기 <ArrowRight size={17} />
            </button>
            <p className="save-boundary"><CheckCircle2 size={15} /> 아직 아무것도 저장되지 않습니다.</p>
          </div>
        ) : (
          <div className="drawer-content preview-content">
            <div className="flow-steps"><span>1 입력</span><i /><span className="active">2 검증·미리보기</span><i /><span>3 사용자 확정</span></div>
            <div className="validation-banner"><CheckCircle2 size={18} /><div><strong>분석과 기본 검증을 마쳤어요</strong><span>아래 내용을 수정하거나 제외한 뒤 직접 확정해 주세요.</span></div></div>

            <div className="preview-section">
              <div className="preview-title"><span className="preview-icon task-icon"><Check size={15} /></span><div><strong>할 일 1개</strong><small>마감과 작업시간은 별도로 저장</small></div></div>
              <label>할 일 이름<input value={draft.taskTitle} onChange={(event) => setDraft({ ...draft, taskTitle: event.target.value })} /></label>
              <div className="field-pair">
                <label>프로젝트<select value={draft.projectId} onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>
                <label>마감일<input value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} /></label>
              </div>
              <div className="block-list">
                <span>작업 시간블록 · {draft.blocks.length}개</span>
                {draft.blocks.map((block, index) => <div key={block.id}><Clock3 size={15} /><input value={block.label} onChange={(event) => setDraft({ ...draft, blocks: draft.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) })} /><button aria-label="시간블록 삭제" onClick={() => setDraft({ ...draft, blocks: draft.blocks.filter((item) => item.id !== block.id) })} type="button"><X size={15} /></button></div>)}
              </div>
            </div>

            <div className="preview-section">
              <div className="preview-title"><span className="preview-icon event-icon"><CalendarDays size={15} /></span><div><strong>공식 일정 1개</strong><small>Google Calendar 동기화 대상</small></div></div>
              <label>일정 이름<input value={draft.officialEvent.title} onChange={(event) => setDraft({ ...draft, officialEvent: { ...draft.officialEvent, title: event.target.value } })} /></label>
              <label>일정 시간<input value={draft.officialEvent.schedule} onChange={(event) => setDraft({ ...draft, officialEvent: { ...draft.officialEvent, schedule: event.target.value } })} /></label>
              <label className="sync-toggle"><input checked={draft.officialEvent.syncToGoogle} onChange={(event) => setDraft({ ...draft, officialEvent: { ...draft.officialEvent, syncToGoogle: event.target.checked } })} type="checkbox" /><span /><div><strong>공식 일정으로 분류</strong><small>확정 후에만 Google Calendar 동기화 대기열에 추가</small></div></label>
            </div>

            <div className="warning-card"><Clock3 size={17} /><p><strong>일정 충돌 없음</strong><br />제안된 두 시간블록은 기존 일정과 겹치지 않습니다.</p></div>
            <div className="drawer-actions"><button className="secondary-button" onClick={() => setStage("input")} type="button">이전</button><button className="primary-button" onClick={() => onSave(draft.taskTitle)} type="button"><Check size={17} /> 사용자 확정 후 저장</button></div>
            <p className="save-boundary"><CheckCircle2 size={15} /> 이 버튼을 누르기 전까지는 저장되지 않습니다.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

export function WorkPlanner() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState<ViewMode>("month");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [tasks, setTasks] = useState(initialTasks);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const visibleTasks = tasks.filter(
    (task) => task.status !== "done" && (selectedProject === "all" || task.projectId === selectedProject),
  );

  const navigate = (direction: -1 | 1) => {
    if (view === "month") setSelectedDate((date) => direction === 1 ? addMonths(date, 1) : subMonths(date, 1));
    else setSelectedDate((date) => addDays(date, direction * (view === "week" || view === "timetable" ? 7 : 1)));
  };

  const completeTask = (taskId: string) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status: "done" } : task));
    setToast("할 일을 완료했어요");
  };

  const saveAiDraft = (title: string) => {
    setTasks((current) => [{
      id: `task-${current.length + 1}`,
      projectId: "operations",
      title,
      dueLabel: "금요일 오후 6시",
      estimateMinutes: 180,
      priority: "high",
      status: "planned",
      blockCount: 2,
    }, ...current]);
    setCaptureOpen(false);
    setToast("확정한 할 일과 일정 초안을 로컬 데모에 저장했어요");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button aria-label="메뉴 열기" className="mobile-menu" onClick={() => setSidebarOpen((open) => !open)} type="button"><Menu size={21} /></button>
        <div className="brand"><span className="brand-mark"><Check size={18} strokeWidth={3} /></span><strong>flowday</strong></div>
        <button className="search-box" type="button"><Search size={17} /><span>업무와 일정 검색</span><kbd>⌘ K</kbd></button>
        <div className="top-actions"><button className="icon-button notification" aria-label="알림" type="button"><MessageSquareText size={19} /><i /></button><div className="avatar">JK</div><button className="profile-button" type="button"><span><strong>김지훈</strong><small>개인 워크스페이스</small></span><ChevronDown size={15} /></button></div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <nav className="main-nav" aria-label="주 메뉴">
            {navItems.map(({ id, label, icon: Icon, count }) => <button className={id === "today" ? "active" : ""} key={id} type="button"><Icon size={18} /><span>{label}</span>{count > 0 ? <em>{count}</em> : null}</button>)}
          </nav>
          <div className="nav-section">
            <div className="section-label"><span>프로젝트</span><button aria-label="프로젝트 추가" type="button"><Plus size={16} /></button></div>
            <button className={selectedProject === "all" ? "project-row selected" : "project-row"} onClick={() => setSelectedProject("all")} type="button"><span className="project-all"><LayoutGrid size={13} /></span><span>전체 프로젝트</span><em>{tasks.filter((task) => task.status !== "done").length}</em></button>
            {projects.map((project) => <button className={selectedProject === project.id ? "project-row selected" : "project-row"} onClick={() => setSelectedProject(project.id)} key={project.id} type="button"><i style={{ background: project.color }} /><span>{project.name}</span><em>{tasks.filter((task) => task.projectId === project.id && task.status !== "done").length}</em></button>)}
          </div>
          <div className="sidebar-spacer" />
          <button className="integration-card" type="button"><span className="google-g">G</span><span><strong>Google Calendar</strong><small>연결 준비됨 · 비활성</small></span><ChevronRight size={15} /></button>
          <button className="settings-link" type="button"><Settings size={17} /> 설정</button>
        </aside>

        <section className="planner-panel">
          <div className="planner-header">
            <div className="date-heading"><button className="today-button" onClick={() => setSelectedDate(today)} type="button">오늘</button><div className="date-nav"><button aria-label="이전 기간" onClick={() => navigate(-1)} type="button"><ChevronLeft size={18} /></button><button aria-label="다음 기간" onClick={() => navigate(1)} type="button"><ChevronRight size={18} /></button></div><div><h1>{view === "today" ? format(selectedDate, "M월 d일 EEEE", { locale: ko }) : format(selectedDate, "yyyy년 M월", { locale: ko })}</h1><span>{view === "today" ? "오늘의 계획을 차분히 실행해 보세요" : "마감과 작업 시간을 한눈에 확인하세요"}</span></div></div>
            <div className="view-switcher" aria-label="캘린더 보기">{(Object.keys(viewLabels) as ViewMode[]).map((key) => <button aria-pressed={view === key} className={view === key ? "active" : ""} key={key} onClick={() => setView(key)} type="button">{viewLabels[key]}</button>)}</div>
          </div>
          <div className="legend"><span><i className="legend-block" />작업 시간</span><span><i className="legend-deadline" />마감</span><span><i className="legend-official" />공식 일정</span><small>마감과 작업 시간은 별도로 관리됩니다</small></div>
          <div className="view-container">
            {view === "month" ? <MonthView selectedDate={selectedDate} today={today} /> : null}
            {view === "week" ? <WeekView today={today} /> : null}
            {view === "today" ? <TodayView /> : null}
            {view === "timetable" ? <TimetableView today={today} /> : null}
          </div>
        </section>

        <aside className="focus-panel">
          <div className="briefing-card">
            <div className="briefing-top"><span><Sparkles size={15} /> DAILY BRIEFING</span><button aria-label="브리핑 더보기" type="button"><MoreHorizontal size={18} /></button></div>
            <h2>좋은 아침이에요, 지훈님.</h2>
            <p>오늘은 <strong>긴급 마감 1개</strong>와<br /><strong>회의 1개</strong>가 예정되어 있어요.</p>
            <div className="briefing-stats"><div><strong>5</strong><span>오늘 할 일</span></div><div><strong>4.5h</strong><span>계획된 시간</span></div><div><strong className="safe">0</strong><span>충돌</span></div></div>
            <button onClick={() => setView("today")} type="button">브리핑 자세히 보기 <ArrowRight size={15} /></button>
          </div>

          <div className="task-section">
            <div className="task-heading"><div><h2>집중할 일</h2><span>{visibleTasks.length}개 남음</span></div><button aria-label="할 일 추가" type="button"><Plus size={17} /></button></div>
            <div className="task-list">
              {visibleTasks.length ? visibleTasks.slice(0, 5).map((task) => {
                const project = projectFor(task.projectId)!;
                return <article className="task-card" key={task.id}><button aria-label={`${task.title} 완료`} className="task-check" onClick={() => completeTask(task.id)} type="button"><Circle size={20} /></button><div className="task-body"><h3>{task.title}</h3><div className="task-project"><i style={{ background: project.color }} />{project.name}</div><div className="task-meta"><span className={`priority priority-${task.priority}`}>{priorityLabels[task.priority]}</span><span><CalendarDays size={13} />{task.dueLabel}</span><span><Clock3 size={13} />{task.estimateMinutes >= 60 ? `${task.estimateMinutes / 60}시간` : `${task.estimateMinutes}분`}</span>{task.blockCount ? <span>{task.blockCount}개 블록</span> : <span className="unscheduled">미배치</span>}</div></div><button aria-label="할 일 메뉴" className="task-menu" type="button"><MoreHorizontal size={17} /></button></article>;
              }) : <div className="empty-tasks"><CheckCircle2 size={30} /><strong>모두 끝냈어요</strong><span>다른 프로젝트를 확인해 보세요.</span></div>}
            </div>
          </div>

          <button className="ai-capture-button" onClick={() => setCaptureOpen(true)} type="button"><span><Bot size={20} /></span><div><strong>AI로 빠르게 계획하기</strong><small>자연어로 업무와 일정을 입력해 보세요</small></div><ArrowRight size={18} /></button>
        </aside>
      </div>

      {captureOpen ? <AiCapturePanel onClose={() => setCaptureOpen(false)} onSave={saveAiDraft} /> : null}
      {toast ? <button className="toast" onClick={() => setToast(null)} type="button"><CheckCircle2 size={17} />{toast}<X size={15} /></button> : null}
    </main>
  );
}
