import { describe, expect, it, vi } from 'vitest';
import {
  AppRepository,
  LEGACY_STATE_KEY,
  LEGACY_SESSION_KEY,
  STATE_KEY,
  SESSION_KEY,
  SessionRepository,
  createMemoryStorage,
  normalizeState,
} from '@/services/storage';
import { createSeed } from '@/state/seed';
import type { KeyValueStorage } from '@/services/storage';

const now = new Date('2026-11-03T09:00:00');

describe('AppRepository', () => {
  it('round-trips state for guest sessions', () => {
    const storage = createMemoryStorage();
    const repository = new AppRepository(storage, () => now);
    const state = createSeed(now);
    state.profile.name = '访客小林';

    expect(repository.save(state, { mode: 'guest' })).toEqual({ ok: true });
    const loaded = repository.load({ mode: 'guest' });
    expect(loaded.profile.name).toBe('访客小林');
  });

  it('keeps per-account snapshots isolated', () => {
    const storage = createMemoryStorage();
    const repository = new AppRepository(storage, () => now);
    const alice = createSeed(now);
    alice.profile.name = 'Alice';
    const bob = createSeed(now);
    bob.profile.name = 'Bob';

    repository.save(alice, { mode: 'account', name: 'Alice' });
    repository.save(bob, { mode: 'account', name: 'Bob' });

    expect(repository.loadAccount('Alice').profile.name).toBe('Alice');
    expect(repository.loadAccount('Bob').profile.name).toBe('Bob');
    expect(repository.accountExists('alice')).toBe(true);
  });

  it('migrates the legacy v1 state key', () => {
    const legacy = createSeed(now);
    legacy.profile.name = '旧版用户';
    const storage = createMemoryStorage({ [LEGACY_STATE_KEY]: JSON.stringify(legacy) });
    const repository = new AppRepository(storage, () => now);
    expect(repository.load({ mode: 'guest' }).profile.name).toBe('旧版用户');
  });

  it('reports storage failures instead of pretending success', () => {
    const broken: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => undefined,
    };
    const repository = new AppRepository(broken, () => now);
    expect(repository.save(createSeed(now), { mode: 'guest' }).ok).toBe(false);
  });

  it('reports quota errors distinctly', () => {
    const quota = new DOMException('full', 'QuotaExceededError');
    const storage = createMemoryStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw quota;
    });
    const repository = new AppRepository(storage, () => now);
    expect(repository.save(createSeed(now), { mode: 'guest' })).toEqual({
      ok: false,
      reason: 'quota',
    });
  });

  it('normalizes malformed persisted data back to safe defaults', () => {
    const normalized = normalizeState({ courses: 'nope', profile: null }, createSeed(now));
    expect(Array.isArray(normalized.courses)).toBe(true);
    expect(normalized.profile.name).toBe('林同学');
    expect(normalized.weekCalendar.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('writes the v2 state key', () => {
    const storage = createMemoryStorage();
    const repository = new AppRepository(storage, () => now);
    repository.save(createSeed(now), { mode: 'guest' });
    expect(storage.getItem(STATE_KEY)).toContain('profile');
  });
});

describe('SessionRepository', () => {
  it('persists account and guest sessions as JSON', () => {
    const storage = createMemoryStorage();
    const repository = new SessionRepository(storage);
    repository.save({ mode: 'account', name: '小林' });
    expect(repository.load()).toEqual({ mode: 'account', name: '小林' });
    expect(storage.getItem(SESSION_KEY)).toBeTruthy();

    repository.save({ mode: 'guest' });
    expect(repository.load()).toEqual({ mode: 'guest' });
  });

  it('migrates the legacy plain-string session', () => {
    const guestStorage = createMemoryStorage({ [LEGACY_SESSION_KEY]: 'guest' });
    expect(new SessionRepository(guestStorage).load()).toEqual({ mode: 'guest' });

    const accountStorage = createMemoryStorage({ [LEGACY_SESSION_KEY]: '小林' });
    expect(new SessionRepository(accountStorage).load()).toEqual({
      mode: 'account',
      name: '小林',
    });
  });

  it('clears both keys on logout', () => {
    const storage = createMemoryStorage();
    const repository = new SessionRepository(storage);
    repository.save({ mode: 'guest' });
    repository.save(null);
    expect(repository.load()).toBeNull();
    expect(storage.getItem(SESSION_KEY)).toBeNull();
  });
});
