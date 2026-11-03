export interface CourseLike {
  id?: string;
  title?: string;
  day?: number;
  start?: string;
  end?: string;
  weekType?: string;
}

export interface ScheduleSettings {
  visibility: 'private' | 'friends' | 'public';
  shareBusyOnly?: boolean;
}

export interface BusySlot {
  day: number;
  start: string;
  end: string;
  label: string;
}

export interface VisibleCourse {
  title: string;
  day: number;
  start: string;
  end: string;
  location?: string;
  [key: string]: unknown;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEK_TYPES = ['every', 'odd', 'even'] as const;

export function canViewSchedule(
  settings?: ScheduleSettings | null,
  viewerIsFriend = false,
): boolean {
  if (!settings) return false;
  if (settings.visibility === 'private') return false;
  if (settings.visibility === 'public') return true;
  return settings.visibility === 'friends' && Boolean(viewerIsFriend);
}

/** Friends-only sharing can redact course titles and locations to busy slots. */
export function visibleSchedule<T extends VisibleCourse>(
  courses: T[],
  settings?: ScheduleSettings | null,
  viewerIsFriend = false,
): Array<T | BusySlot> {
  if (!canViewSchedule(settings, viewerIsFriend)) return [];
  return (courses ?? []).map((course) =>
    settings?.shareBusyOnly
      ? { day: course.day, start: course.start, end: course.end, label: '忙碌' }
      : course,
  );
}

export function isValidCourse(course?: CourseLike | null): boolean {
  if (!course) return false;
  const day = Number(course.day);
  return Boolean(
    String(course.title ?? '').trim() &&
    Number.isInteger(day) &&
    day >= 1 &&
    day <= 7 &&
    TIME_PATTERN.test(course.start ?? '') &&
    TIME_PATTERN.test(course.end ?? '') &&
    String(course.end) > String(course.start) &&
    (WEEK_TYPES as readonly string[]).includes(course.weekType ?? 'every'),
  );
}

/** 1-based teaching week derived from the Monday of week 1. */
export function academicWeekNumber(startDate: string, currentDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const current = new Date(`${currentDate}T00:00:00`);
  if (Number.isNaN(+start) || Number.isNaN(+current)) return 1;
  const startMonday = startOfMonday(start);
  const currentMonday = startOfMonday(current);
  return Math.floor((currentMonday.getTime() - startMonday.getTime()) / 604_800_000) + 1;
}

function startOfMonday(date: Date): Date {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

export function isCourseVisibleInWeek(
  course: Pick<CourseLike, 'weekType'> | null | undefined,
  weekNumber: number,
): boolean {
  const type = course?.weekType ?? 'every';
  return (
    type === 'every' ||
    (type === 'odd' && Number(weekNumber) % 2 === 1) ||
    (type === 'even' && Number(weekNumber) % 2 === 0)
  );
}

/** Odd/even view modes snap the displayed week to the nearest matching parity. */
export function scheduleWeekNumber(mode: 'current' | 'odd' | 'even', currentWeek: number): number {
  const current = Math.max(1, Math.floor(Number(currentWeek) || 1));
  if (mode === 'odd') return current % 2 === 1 ? current : Math.max(1, current - 1);
  if (mode === 'even') return current % 2 === 0 ? current : current + 1;
  return current;
}

export function currentAcademicWeek(
  state: { weekCalendar: { start: string } },
  now = new Date(),
): number {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  return Math.max(1, academicWeekNumber(state.weekCalendar.start, today));
}

export function sortCourses<T extends { day: number; start: string }>(courses: T[]): T[] {
  return [...courses].sort((a, b) =>
    a.day === b.day ? a.start.localeCompare(b.start) : a.day - b.day,
  );
}
