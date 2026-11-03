import { addDays } from '@/domain/dates';
import { isCourseVisibleInWeek, sortCourses } from '@/domain/schedule';
import type { Course } from '@/domain/types';
import { Icon } from '@/components/ui/Icon';

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export function WeekGrid({
  courses,
  weekNumber,
  monday,
  showToday,
  onEdit,
}: {
  courses: Course[];
  weekNumber: number;
  monday: Date;
  showToday: boolean;
  onEdit: (course: Course) => void;
}) {
  const today = showToday ? (new Date().getDay() + 6) % 7 : -1;

  return (
    <div className="week-grid" role="table" aria-label="课表周视图">
      {DAY_LABELS.map((label, index) => {
        const day = index + 1;
        const date = addDays(monday, index);
        const dayCourses = sortCourses(
          courses.filter(
            (course) => course.day === day && isCourseVisibleInWeek(course, weekNumber),
          ),
        );
        return (
          <div
            key={label}
            role="columnheader"
            className={`week-day${index === today ? ' is-today' : ''}`}
          >
            <div className="week-day__head">
              <span>周{label}</span>
              <small>
                {date.getMonth() + 1}/{date.getDate()}
              </small>
            </div>
            <div className="week-day__body">
              {dayCourses.length === 0 ? (
                <p className="week-day__empty">无课</p>
              ) : (
                dayCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className={`course-card course-card--${course.color}`}
                    onClick={() => onEdit(course)}
                    aria-label={`编辑课程 ${course.title}，周${label} ${course.start}–${course.end}`}
                  >
                    <strong>{course.title}</strong>
                    <span>
                      {course.start}–{course.end}
                    </span>
                    {course.location ? (
                      <small>
                        <Icon name="map" size={12} /> {course.location}
                      </small>
                    ) : null}
                    {course.weekType !== 'every' ? (
                      <em>{course.weekType === 'odd' ? '单周' : '双周'}</em>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
