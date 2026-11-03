import type { Task } from './types';

export function isValidEvent(
  event?: { title?: string; date?: string; place?: string } | null,
): boolean {
  return Boolean(event && String(event.title ?? '').trim() && String(event.date ?? '').trim());
}

export function isValidTask(task?: { title?: string; due?: string } | null): boolean {
  return Boolean(task && String(task.title ?? '').trim() && String(task.due ?? '').trim());
}

/** Pure toggle: never mutates the input task. */
export function toggleTask(task: Task): Task {
  return { ...task, done: !task.done };
}

export function sortTasksByDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.due.localeCompare(b.due));
}

export function pendingTasks(tasks: Task[]): Task[] {
  return sortTasksByDue(tasks.filter((task) => !task.done));
}

export function dueLabel(due: string, now = new Date()): string {
  const date = new Date(due);
  if (Number.isNaN(+date)) return due;
  const diff = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  if (diff < 0) return '已逾期';
  if (diff === 0) return '今天截止';
  if (diff === 1) return '明天截止';
  return `${diff} 天后截止`;
}
