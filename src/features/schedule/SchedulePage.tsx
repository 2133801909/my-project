import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { addDays, formatMonthDay, mondayOf, toISODate } from '@/domain/dates';
import {
  currentAcademicWeek,
  isCourseVisibleInWeek,
  scheduleWeekNumber,
  sortCourses,
} from '@/domain/schedule';
import type { Course, WeekMode } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import { CourseDialog } from './CourseDialog';
import { WeekGrid } from './WeekGrid';

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const WEEK_MODE_LABEL: Record<WeekMode, string> = {
  current: '当前周',
  odd: '单周',
  even: '双周',
};

function visibilityLabel(value: string): string {
  return value === 'public' ? '公开' : value === 'friends' ? '好友可见' : '仅自己';
}

export function SchedulePage() {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [mode, setMode] = useState<WeekMode>('current');
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(((new Date().getDay() + 6) % 7) + 1);
  const [editing, setEditing] = useState<Course | null>(null);
  const [adding, setAdding] = useState(false);
  const [weekStartOpen, setWeekStartOpen] = useState(false);

  const currentWeek = currentAcademicWeek(state);
  const displayWeek = scheduleWeekNumber(mode, currentWeek);
  const monday = addDays(mondayOf(new Date()), (displayWeek - currentWeek) * 7);

  const openEdit = (course: Course) => setEditing(course);

  const saveWeekStart = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('start') ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      show('请选择有效的第 1 周周一日期', 'error');
      return;
    }
    dispatch({ type: 'week/set-start', start: value });
    setWeekStartOpen(false);
    show('教学周起始日已更新', 'success');
  };

  const dayCourses = sortCourses(
    state.courses.filter(
      (course) => course.day === selectedDay && isCourseVisibleInWeek(course, displayWeek),
    ),
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="课程节奏"
        title="我的课表"
        description="单双周课程会按教学周自动显示；点击课程即可编辑。"
        actions={
          <Button icon={<Icon name="plus" size={16} />} onClick={() => setAdding(true)}>
            添加课程
          </Button>
        }
      />

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="课表视图">
          <button
            type="button"
            className={view === 'week' ? 'is-active' : ''}
            onClick={() => setView('week')}
          >
            周视图
          </button>
          <button
            type="button"
            className={view === 'day' ? 'is-active' : ''}
            onClick={() => setView('day')}
          >
            日视图
          </button>
        </div>

        <div className="segmented" role="group" aria-label="周次筛选">
          {(Object.keys(WEEK_MODE_LABEL) as WeekMode[]).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? 'is-active' : ''}
              onClick={() => setMode(item)}
            >
              {WEEK_MODE_LABEL[item]}
            </button>
          ))}
        </div>

        <span className="toolbar__meta">
          第 {displayWeek} 教学周 · 课表可见范围：{visibilityLabel(state.settings.visibility)}
        </span>

        <Button variant="ghost" size="sm" onClick={() => setWeekStartOpen(true)}>
          设置教学周
        </Button>
      </div>

      {view === 'week' ? (
        <WeekGrid
          courses={state.courses}
          weekNumber={displayWeek}
          monday={monday}
          showToday={displayWeek === currentWeek}
          onEdit={openEdit}
        />
      ) : (
        <div className="day-view">
          <div className="day-view__tabs" role="tablist" aria-label="选择日期">
            {DAY_LABELS.map((label, index) => {
              const day = index + 1;
              const date = addDays(monday, index);
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={selectedDay === day}
                  className={selectedDay === day ? 'is-active' : ''}
                  onClick={() => setSelectedDay(day)}
                >
                  <span>周{label}</span>
                  <small>{formatMonthDay(date)}</small>
                </button>
              );
            })}
          </div>

          <div className="day-view__list">
            {dayCourses.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="这一天没有课程"
                description="可以切换周次，或添加一门新课程。"
                action={<Button onClick={() => setAdding(true)}>添加课程</Button>}
              />
            ) : (
              dayCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className={`course-row course-card--${course.color}`}
                  onClick={() => openEdit(course)}
                >
                  <span className="course-row__time">
                    {course.start}
                    <small>{course.end}</small>
                  </span>
                  <span className="course-row__main">
                    <strong>{course.title}</strong>
                    <small>
                      {course.location || '地点待定'}
                      {course.teacher ? ` · ${course.teacher}` : ''}
                    </small>
                  </span>
                  <span className="pill">
                    {course.weekType === 'every'
                      ? '每周'
                      : course.weekType === 'odd'
                        ? '单周'
                        : '双周'}
                  </span>
                  <Icon name="edit" size={16} />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="info-strip">
        <Icon name="shield" size={16} />
        <span>
          课表默认私密，仅自己可见。可在
          <Link to={ROUTES.settings}> 设置 </Link>
          调整可见范围与“只分享忙闲”选项。
        </span>
      </div>

      {adding ? <CourseDialog onClose={() => setAdding(false)} /> : null}
      {editing ? <CourseDialog course={editing} onClose={() => setEditing(null)} /> : null}
      {weekStartOpen ? (
        <Dialog title="设置教学周起始日" onClose={() => setWeekStartOpen(false)}>
          <form className="stack" onSubmit={saveWeekStart}>
            <label className="field" htmlFor="week-start">
              <span className="field__label">第 1 周周一日期</span>
              <input
                id="week-start"
                name="start"
                type="date"
                className="input"
                defaultValue={state.weekCalendar.start || toISODate(monday)}
                required
              />
              <span className="field__hint">当前为第 {currentWeek} 教学周。</span>
            </label>
            <div className="dialog-actions">
              <span className="spacer" />
              <Button variant="ghost" onClick={() => setWeekStartOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </div>
  );
}
