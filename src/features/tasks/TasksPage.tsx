import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { formatDateTime } from '@/domain/dates';
import { dueLabel, pendingTasks, sortTasksByDue } from '@/domain/tasks';
import type { Task } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader, Stat } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import { EventDialog, TaskDialog } from './TaskDialogs';

function TaskRow({ task }: { task: Task }) {
  const { dispatch } = useApp();
  const { show } = useToast();
  const [now] = useState(() => Date.now());
  const overdue = new Date(task.due).getTime() < now && !task.done;

  return (
    <li className={`task-row${task.done ? ' is-done' : ''}`}>
      <button
        type="button"
        className="check-button"
        aria-label={task.done ? `标记「${task.title}」为未完成` : `标记「${task.title}」为完成`}
        aria-pressed={task.done}
        onClick={() => dispatch({ type: 'tasks/toggle', id: task.id })}
      >
        {task.done ? <Icon name="check" size={14} /> : null}
      </button>

      <Link to={ROUTES.task(task.id)} className="task-row__main">
        <strong>{task.title}</strong>
        <span>
          {task.course || '个人待办'} · {formatDateTime(task.due)}
          {overdue ? <em className="text-danger"> · {dueLabel(task.due)}</em> : null}
        </span>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        aria-label={`删除待办 ${task.title}`}
        onClick={() => {
          if (!window.confirm(`确定删除「${task.title}」吗？`)) return;
          dispatch({ type: 'tasks/delete', id: task.id });
          show('待办已删除', 'info');
        }}
      >
        <Icon name="trash" size={15} />
      </Button>
    </li>
  );
}

export function TasksPage() {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [taskOpen, setTaskOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  const pending = pendingTasks(state.tasks);
  const done = sortTasksByDue(state.tasks.filter((task) => task.done));
  const upcomingEvents = [...state.events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="page">
      <PageHeader
        eyebrow="作业与个人节奏"
        title="待办与安排"
        description="作业、截止时间和个人计划都放在这里，完成状态与提醒开关保存在本地。"
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Icon name="calendar" size={16} />}
              onClick={() => setEventOpen(true)}
            >
              添加安排
            </Button>
            <Button icon={<Icon name="plus" size={16} />} onClick={() => setTaskOpen(true)}>
              添加待办
            </Button>
          </>
        }
      />

      <div className="stats-grid">
        <Stat label="未完成" value={pending.length} hint="按截止时间排序" />
        <Stat label="已完成" value={done.length} hint="本地保存" />
        <Stat label="个人安排" value={upcomingEvents.length} hint="含提醒开关" />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel__head">
            <h2>待办作业</h2>
            <span className="pill">{pending.length} 项未完成</span>
          </div>

          {pending.length === 0 ? (
            <EmptyState
              icon="tasks"
              title="没有未完成的待办"
              description="添加一项作业，或享受片刻轻松。"
              action={<Button onClick={() => setTaskOpen(true)}>添加待办</Button>}
            />
          ) : (
            <ul className="task-list">
              {pending.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          )}

          {done.length > 0 ? (
            <details className="completed-block">
              <summary>已完成 {done.length} 项</summary>
              <ul className="task-list">
                {done.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </ul>
            </details>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>个人安排</h2>
            <Button variant="ghost" size="sm" onClick={() => setEventOpen(true)}>
              添加
            </Button>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon="clock"
              title="还没有个人安排"
              description="添加自习、社团活动或运动计划。"
              action={<Button onClick={() => setEventOpen(true)}>添加安排</Button>}
            />
          ) : (
            <ul className="event-list">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="event-row">
                  <span className="event-row__date">{formatDateTime(event.date)}</span>
                  <div className="event-row__main">
                    <strong>{event.title}</strong>
                    <small>
                      {event.place || '地点待定'}
                      {event.note ? ` · ${event.note}` : ''}
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`toggle${event.reminder ? ' is-on' : ''}`}
                    aria-pressed={event.reminder}
                    aria-label={`${event.reminder ? '关闭' : '开启'}「${event.title}」提醒`}
                    onClick={() => dispatch({ type: 'events/toggle-reminder', id: event.id })}
                  >
                    <span />
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`删除安排 ${event.title}`}
                    onClick={() => {
                      if (!window.confirm(`确定删除「${event.title}」吗？`)) return;
                      dispatch({ type: 'events/delete', id: event.id });
                      show('安排已删除', 'info');
                    }}
                  >
                    <Icon name="trash" size={15} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {taskOpen ? <TaskDialog onClose={() => setTaskOpen(false)} /> : null}
      {eventOpen ? <EventDialog onClose={() => setEventOpen(false)} /> : null}
    </div>
  );
}
