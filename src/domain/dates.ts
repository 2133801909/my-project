export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Local calendar date as YYYY-MM-DD (never UTC, to avoid off-by-one days). */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Local datetime as YYYY-MM-DDTHH:mm for datetime-local inputs. */
export function toISODateTime(date: Date): string {
  return `${toISODate(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function parseDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mondayOf(date: Date): Date {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatMonthDay(value: string | Date): string {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return String(value);
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(date);
}

export function formatDateTime(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatToday(): string {
  return new Intl.DateTimeFormat('zh-CN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function formatChatTime(date = new Date()): string {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(date);
}
