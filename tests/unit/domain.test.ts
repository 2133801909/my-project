import { describe, expect, it } from 'vitest';
import { demoAccountKey, isValidDemoAccountName } from '@/domain/auth';
import {
  academicWeekNumber,
  canViewSchedule,
  isCourseVisibleInWeek,
  isValidCourse,
  scheduleWeekNumber,
  visibleSchedule,
} from '@/domain/schedule';
import { isValidEvent, isValidTask, toggleTask } from '@/domain/tasks';
import { eligibleMatches } from '@/domain/matching';
import {
  isAllowedImageSize,
  isAllowedRecordingDuration,
  isImageMessage,
  isValidChatMessage,
  nextImageZoom,
} from '@/domain/chat';
import { canWithdrawPost, forumAuthorAction, withdrawPost } from '@/domain/forum';
import type { Post, Task, User } from '@/domain/types';

const baseCourse = { title: '离散数学', day: 2, start: '08:00', end: '09:40' };

describe('demo authentication', () => {
  it('creates a stable lowercase account key', () => {
    expect(demoAccountKey(' Student-1 ')).toBe('campus-life-demo-account:student-1');
  });

  it('accepts 2–40 character nicknames only', () => {
    expect(isValidDemoAccountName('小林同学')).toBe(true);
    expect(isValidDemoAccountName('   ')).toBe(false);
    expect(isValidDemoAccountName('名'.repeat(41))).toBe(false);
  });
});

describe('schedule', () => {
  it('defaults to private and requires friendship for friends-only visibility', () => {
    expect(canViewSchedule({ visibility: 'private' }, false)).toBe(false);
    expect(canViewSchedule({ visibility: 'friends' }, false)).toBe(false);
    expect(canViewSchedule({ visibility: 'friends' }, true)).toBe(true);
    expect(canViewSchedule({ visibility: 'public' }, false)).toBe(true);
    expect(canViewSchedule(null, true)).toBe(false);
  });

  it('redacts course details to busy slots when busy-only sharing is on', () => {
    const courses = [
      { title: '数字电路', location: '教一-203', day: 1, start: '08:00', end: '09:40' },
    ];
    expect(visibleSchedule(courses, { visibility: 'friends', shareBusyOnly: true }, true)).toEqual([
      { day: 1, start: '08:00', end: '09:40', label: '忙碌' },
    ]);
    expect(visibleSchedule(courses, { visibility: 'private' }, true)).toEqual([]);
  });

  it('validates course fields and week types', () => {
    expect(isValidCourse(baseCourse)).toBe(true);
    expect(isValidCourse({ ...baseCourse, weekType: 'odd' })).toBe(true);
    expect(isValidCourse({ ...baseCourse, weekType: 'invalid' })).toBe(false);
    expect(isValidCourse({ ...baseCourse, end: '07:00' })).toBe(false);
    expect(isValidCourse({ ...baseCourse, day: 8 })).toBe(false);
    expect(isValidCourse({ ...baseCourse, title: ' ' })).toBe(false);
  });

  it('filters odd/even courses by teaching-week parity', () => {
    expect(isCourseVisibleInWeek({ weekType: 'odd' }, 7)).toBe(true);
    expect(isCourseVisibleInWeek({ weekType: 'odd' }, 8)).toBe(false);
    expect(isCourseVisibleInWeek({ weekType: 'even' }, 8)).toBe(true);
    expect(isCourseVisibleInWeek({ weekType: 'every' }, 8)).toBe(true);
    expect(isCourseVisibleInWeek({}, 8)).toBe(true);
  });

  it('derives teaching weeks from the week-1 Monday', () => {
    expect(academicWeekNumber('2026-09-07', '2026-09-07')).toBe(1);
    expect(academicWeekNumber('2026-09-07', '2026-09-14')).toBe(2);
    expect(academicWeekNumber('2026-09-07', '2026-11-03')).toBe(9);
    expect(academicWeekNumber('not-a-date', '2026-09-14')).toBe(1);
  });

  it('snaps odd/even views to the nearest matching parity', () => {
    expect(scheduleWeekNumber('current', 8)).toBe(8);
    expect(scheduleWeekNumber('odd', 8)).toBe(7);
    expect(scheduleWeekNumber('even', 7)).toBe(8);
  });
});

describe('tasks and events', () => {
  it('requires a title but allows events without a place', () => {
    expect(isValidEvent({ title: '图书馆自习', date: '2026-10-26T14:00', place: '' })).toBe(true);
    expect(isValidEvent({ title: '', date: '2026-10-26T14:00' })).toBe(false);
    expect(isValidEvent({ title: '自习', date: '' })).toBe(false);
  });

  it('validates task title and due time', () => {
    expect(isValidTask({ title: '实验报告', due: '2026-11-04T23:00' })).toBe(true);
    expect(isValidTask({ title: '', due: '2026-11-04T23:00' })).toBe(false);
    expect(isValidTask({ title: '实验报告', due: '' })).toBe(false);
  });

  it('toggles without mutating the input', () => {
    const task: Task = {
      id: 't1',
      title: '实验',
      course: '',
      due: '2026-11-04T23:00',
      note: '',
      done: false,
    };
    expect(toggleTask(task)).toEqual({ ...task, done: true });
    expect(task.done).toBe(false);
  });
});

describe('matching', () => {
  it('requires mutual opt-in and the same department', () => {
    const me = { id: 'me', department: '计算机学院', matchingEnabled: true, blocked: [] };
    const candidates = [
      { id: 'a', department: '计算机学院', matchingEnabled: true },
      { id: 'b', department: '计算机学院', matchingEnabled: false },
      { id: 'c', department: '电子信息学院', matchingEnabled: true },
    ];
    expect(eligibleMatches(me, candidates).map((item) => item.id)).toEqual(['a']);
    expect(eligibleMatches({ ...me, matchingEnabled: false }, candidates)).toEqual([]);
  });

  it('removes candidates blocked by either side', () => {
    const me = { id: 'me', department: '计算机学院', matchingEnabled: true, blocked: ['a'] };
    expect(
      eligibleMatches(me, [{ id: 'a', department: '计算机学院', matchingEnabled: true }]),
    ).toEqual([]);
  });
});

describe('chat', () => {
  it('accepts supported payloads and rejects unsafe ones', () => {
    expect(isValidChatMessage({ type: 'text', body: '你好' })).toBe(true);
    expect(isValidChatMessage({ type: 'text', body: '   ' })).toBe(false);
    expect(isValidChatMessage({ type: 'emoji', body: '😄' })).toBe(true);
    expect(isValidChatMessage({ type: 'image', dataUrl: 'data:image/jpeg;base64,AA==' })).toBe(
      true,
    );
    expect(
      isValidChatMessage({
        type: 'image',
        dataUrl: 'data:image/jpeg;base64,' + 'A'.repeat(3 * 1024 * 1024),
      }),
    ).toBe(false);
    expect(
      isValidChatMessage({ type: 'audio', dataUrl: 'data:audio/webm;base64,AA==', duration: 12 }),
    ).toBe(true);
    expect(
      isValidChatMessage({ type: 'audio', dataUrl: 'data:audio/webm;base64,AA==', duration: 21 }),
    ).toBe(false);
    expect(isValidChatMessage({ type: 'image', dataUrl: '' })).toBe(false);
    expect(isValidChatMessage({ type: 'video', body: 'x' } as never)).toBe(false);
  });

  it('rejects mismatched MIME types and oversized media', () => {
    expect(isValidChatMessage({ type: 'image', dataUrl: 'data:audio/webm;base64,AA==' })).toBe(
      false,
    );
    expect(
      isValidChatMessage({ type: 'audio', dataUrl: 'data:image/png;base64,AA==', duration: 4 }),
    ).toBe(false);
    expect(isAllowedImageSize(1024)).toBe(true);
    expect(isAllowedImageSize(9 * 1024 * 1024)).toBe(false);
    expect(isAllowedRecordingDuration(20)).toBe(true);
    expect(isAllowedRecordingDuration(21)).toBe(false);
    expect(isImageMessage({ type: 'image', dataUrl: 'data:image/png;base64,AA==' } as never)).toBe(
      true,
    );
    expect(isImageMessage({ type: 'text', body: 'x' } as never)).toBe(false);
  });

  it('bounds image zoom between 50% and 400%', () => {
    expect(nextImageZoom(1, 1)).toBe(1.25);
    expect(nextImageZoom(1.25, -1)).toBe(1);
    expect(nextImageZoom(4, 1)).toBe(4);
    expect(nextImageZoom(0.5, -1)).toBe(0.5);
    expect(nextImageZoom(2, 0)).toBe(1);
  });
});

describe('forum and friends', () => {
  const post: Post = {
    id: 'p1',
    type: '讨论',
    author: '林同学',
    time: '今天',
    title: '标题',
    body: '正文',
    tags: [],
    likes: 0,
    liked: false,
    comments: [],
  };

  it('only allows the author to withdraw a post', () => {
    expect(canWithdrawPost(post, '林同学')).toBe(true);
    expect(canWithdrawPost(post, '周同学')).toBe(false);
    expect(withdrawPost([post], 'p1', '林同学')).toEqual([]);
    expect(withdrawPost([post], 'p1', '周同学')).toEqual([post]);
  });

  it('derives add/friend/pending states for forum authors', () => {
    const user: Pick<User, 'id' | 'friend'> = { id: 'u3', friend: false };
    expect(forumAuthorAction(user, { requests: [] })).toEqual({ kind: 'add', userId: 'u3' });
    expect(forumAuthorAction({ ...user, friend: true }, { requests: [] })).toEqual({
      kind: 'friend',
      userId: 'u3',
    });
    expect(
      forumAuthorAction(user, { requests: [{ id: 'r', userId: 'u3', status: 'outgoing' }] }),
    ).toEqual({ kind: 'pending', userId: 'u3' });
    expect(forumAuthorAction(null, { requests: [] })).toEqual({ kind: 'missing' });
  });

  it('deduplicates outgoing friend requests', () => {
    const requests = [{ id: 'r1', userId: 'u3', status: 'outgoing' } as const];
    expect(requests.some((request) => request.userId === 'u3')).toBe(true);
  });
});
