import { describe, expect, it } from 'vitest';
import { appReducer } from '@/state/reducer';
import { createSeed } from '@/state/seed';
import type { ChatMessage, Course, Task } from '@/domain/types';

const now = new Date('2026-11-03T09:00:00');

function seed() {
  return createSeed(now);
}

const newCourse: Course = {
  id: 'c-new',
  title: '编译原理',
  day: 3,
  start: '10:00',
  end: '11:40',
  location: '教二',
  teacher: '刘老师',
  color: 'plum',
  weekType: 'every',
};

const newTask: Task = {
  id: 't-new',
  title: '编译实验',
  course: '编译原理',
  due: '2026-11-06T23:00',
  note: '',
  done: false,
};

describe('appReducer', () => {
  it('adds, updates, and deletes courses', () => {
    const added = appReducer(seed(), { type: 'courses/add', course: newCourse });
    expect(added.courses.at(-1)).toEqual(newCourse);

    const updated = appReducer(added, {
      type: 'courses/update',
      course: { ...newCourse, title: '编译原理（实验）' },
    });
    expect(updated.courses.at(-1)?.title).toBe('编译原理（实验）');

    const deleted = appReducer(updated, { type: 'courses/delete', id: newCourse.id });
    expect(deleted.courses.some((course) => course.id === newCourse.id)).toBe(false);
  });

  it('adds and toggles tasks immutably', () => {
    const state = seed();
    const added = appReducer(state, { type: 'tasks/add', task: newTask });
    expect(state.tasks).toHaveLength(4);
    expect(added.tasks).toHaveLength(5);

    const toggled = appReducer(added, { type: 'tasks/toggle', id: newTask.id });
    expect(toggled.tasks.find((task) => task.id === newTask.id)?.done).toBe(true);
    expect(added.tasks.find((task) => task.id === newTask.id)?.done).toBe(false);
  });

  it('accepts a friend request and marks the user as a friend', () => {
    const state = seed();
    const next = appReducer(state, { type: 'friends/accept', requestId: 'r1' });
    expect(next.requests.find((request) => request.id === 'r1')?.status).toBe('accepted');
    expect(next.users.find((user) => user.id === 'u2')?.friend).toBe(true);
  });

  it('ignores duplicate outgoing requests', () => {
    const first = appReducer(seed(), {
      type: 'friends/request',
      request: { id: 'r-new', userId: 'u3', status: 'outgoing' },
    });
    const second = appReducer(first, {
      type: 'friends/request',
      request: { id: 'r-other', userId: 'u3', status: 'outgoing' },
    });
    expect(first.requests.filter((request) => request.userId === 'u3')).toHaveLength(1);
    expect(second.requests).toBe(first.requests);
  });

  it('blocks a user on both sides and removes friendship', () => {
    const state = seed();
    const next = appReducer(state, { type: 'friends/block', userId: 'u1' });
    expect(next.blocked).toContain('u1');
    expect(next.users.find((user) => user.id === 'u1')?.friend).toBe(false);
    expect(next.users.find((user) => user.id === 'u1')?.blocked).toContain('you');
  });

  it('keeps likes balanced when toggled twice', () => {
    const state = seed();
    const liked = appReducer(state, { type: 'forum/toggle-like', id: 'p1' });
    const unliked = appReducer(liked, { type: 'forum/toggle-like', id: 'p1' });
    expect(liked.posts.find((post) => post.id === 'p1')?.likes).toBe(9);
    expect(unliked.posts.find((post) => post.id === 'p1')?.likes).toBe(8);
  });

  it('only withdraws the current profile’s posts', () => {
    const state = seed();
    const own = appReducer(state, { type: 'forum/withdraw', id: 'p2' });
    expect(own.posts.some((post) => post.id === 'p2')).toBe(false);
    const other = appReducer(state, { type: 'forum/withdraw', id: 'p1' });
    expect(other.posts.some((post) => post.id === 'p1')).toBe(true);
  });

  it('appends chat messages without mutating prior state', () => {
    const state = seed();
    const message: ChatMessage = {
      id: 'm-new',
      author: '林同学',
      body: '今晚见',
      time: '09:00',
      mine: true,
      type: 'text',
    };
    const next = appReducer(state, { type: 'chat/send', userId: 'u1', message });
    expect(next.conversations.u1).toHaveLength(3);
    expect(next.conversations.u1.at(-1)).toEqual(message);
    expect(state.conversations.u1).toHaveLength(2);
  });

  it('updates privacy settings independently', () => {
    const next = appReducer(seed(), {
      type: 'settings/set-visibility',
      visibility: 'friends',
    });
    expect(next.settings.visibility).toBe('friends');
    expect(next.settings.shareBusyOnly).toBe(true);
  });
});
