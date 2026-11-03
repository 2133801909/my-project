import type { AppState, Campus, DemoSession, PersistenceResult } from '@/domain/types';
import { demoAccountKey } from '@/domain/auth';
import { createSeed } from '@/state/seed';
import { isRecord } from '@/services/guards';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STATE_KEY = 'campus-life-demo:v2';
export const LEGACY_STATE_KEY = 'campus-life-demo-v1';
export const SESSION_KEY = 'campus-life-demo-session-v2';
export const LEGACY_SESSION_KEY = 'campus-life-demo-session';

const CAMPUSES: Campus[] = ['下沙校区', '文一校区', '东岳校区', '绍兴校区', '青山湖校区'];

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mergeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

/**
 * Merge persisted data over a fresh seed. Missing or malformed collections fall
 * back to seed defaults; unknown fields are ignored by construction.
 */
export function normalizeState(raw: unknown, seed: AppState = createSeed()): AppState {
  if (!isRecord(raw)) return seed;
  const profile = isRecord(raw.profile) ? raw.profile : {};
  const settings = isRecord(raw.settings) ? raw.settings : {};
  const weekCalendar = isRecord(raw.weekCalendar) ? raw.weekCalendar : {};
  const campus = CAMPUSES.includes(raw.mapCampus as Campus)
    ? (raw.mapCampus as Campus)
    : seed.mapCampus;

  return {
    profile: {
      ...seed.profile,
      ...profile,
      interests: mergeArray(profile.interests, seed.profile.interests),
      matchingEnabled: Boolean(profile.matchingEnabled),
    },
    settings: {
      ...seed.settings,
      visibility: ['private', 'friends', 'public'].includes(String(settings.visibility))
        ? (settings.visibility as AppState['settings']['visibility'])
        : seed.settings.visibility,
      shareBusyOnly:
        typeof settings.shareBusyOnly === 'boolean'
          ? settings.shareBusyOnly
          : seed.settings.shareBusyOnly,
      reminders:
        typeof settings.reminders === 'boolean' ? settings.reminders : seed.settings.reminders,
    },
    courses: mergeArray(raw.courses, seed.courses),
    tasks: mergeArray(raw.tasks, seed.tasks),
    events: mergeArray(raw.events, seed.events),
    users: mergeArray(raw.users, seed.users),
    requests: mergeArray(raw.requests, seed.requests),
    invites: mergeArray(raw.invites, seed.invites),
    conversations: isRecord(raw.conversations)
      ? (raw.conversations as AppState['conversations'])
      : seed.conversations,
    posts: mergeArray(raw.posts, seed.posts),
    blocked: mergeArray(raw.blocked, seed.blocked).filter(
      (id): id is string => typeof id === 'string',
    ),
    mapCampus: campus,
    weekCalendar: {
      start: typeof weekCalendar.start === 'string' ? weekCalendar.start : seed.weekCalendar.start,
    },
  };
}

/**
 * Persistence boundary. UI and reducer never touch localStorage directly, which
 * keeps state logic testable with an in-memory storage implementation.
 */
export class AppRepository {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  load(session: DemoSession): AppState {
    const seed = createSeed(this.now());
    if (session?.mode === 'account') {
      return this.loadAccount(session.name, seed);
    }
    const raw = safeParse(this.storage.getItem(STATE_KEY));
    const legacy = raw ?? safeParse(this.storage.getItem(LEGACY_STATE_KEY));
    return normalizeState(legacy, seed);
  }

  loadAccount(name: string, seed = createSeed(this.now())): AppState {
    return normalizeState(safeParse(this.storage.getItem(demoAccountKey(name))), seed);
  }

  accountExists(name: string): boolean {
    return this.storage.getItem(demoAccountKey(name)) !== null;
  }

  /** Persist the global state and, for accounts, the per-nickname snapshot. */
  save(state: AppState, session: DemoSession): PersistenceResult {
    try {
      const serialized = JSON.stringify(state);
      this.storage.setItem(STATE_KEY, serialized);
      if (session?.mode === 'account') {
        this.storage.setItem(demoAccountKey(session.name), serialized);
      }
      return { ok: true };
    } catch (error) {
      const name = (error as { name?: unknown } | null)?.name;
      const quota = name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
      return { ok: false, reason: quota ? 'quota' : 'unavailable' };
    }
  }
}

/** Session metadata lives in sessionStorage and never contains credentials. */
export class SessionRepository {
  constructor(private readonly storage: KeyValueStorage | null) {}

  load(): DemoSession {
    if (!this.storage) return null;
    const raw = this.storage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = safeParse(raw);
      if (isRecord(parsed)) {
        if (parsed.mode === 'guest') return { mode: 'guest' };
        if (parsed.mode === 'account' && typeof parsed.name === 'string' && parsed.name.trim()) {
          return { mode: 'account', name: parsed.name };
        }
      }
      return null;
    }

    // Migrate the v1 session format: a nickname string or the literal "guest".
    const legacy = this.storage.getItem(LEGACY_SESSION_KEY);
    if (!legacy) return null;
    return legacy === 'guest' ? { mode: 'guest' } : { mode: 'account', name: legacy };
  }

  save(session: DemoSession): void {
    if (!this.storage) return;
    try {
      if (!session) {
        this.storage.removeItem(SESSION_KEY);
        this.storage.removeItem(LEGACY_SESSION_KEY);
        return;
      }
      this.storage.setItem(SESSION_KEY, JSON.stringify(session));
      this.storage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      // Session persistence is best-effort; the in-memory session still works.
    }
  }
}

export function createBrowserStorage(): KeyValueStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createBrowserSessionStorage(): KeyValueStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}
