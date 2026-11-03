import type { ReactNode } from 'react';
import { isValidDemoAccountName } from '@/domain/auth';
import type { AppState, DemoSession } from '@/domain/types';
import { AppContext, type AppContextValue, type AuthResult } from '@/app/context';
import {
  AppRepository,
  SessionRepository,
  createBrowserSessionStorage,
  createBrowserStorage,
  createMemoryStorage,
} from '@/services/storage';
import { createSeed } from '@/state/seed';
import { appReducer } from '@/state/reducer';
import { useReducer, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/toast/context';

interface AppProviderProps {
  children: ReactNode;
  repository?: AppRepository;
  sessionRepository?: SessionRepository;
  initialState?: AppState;
  initialSession?: DemoSession;
  now?: () => Date;
}

function resolveSession(repository: AppRepository, session: DemoSession): DemoSession {
  if (session?.mode === 'account' && !repository.accountExists(session.name)) return null;
  return session;
}

export function AppProvider({
  children,
  repository,
  sessionRepository,
  initialState,
  initialSession,
  now = () => new Date(),
}: AppProviderProps) {
  const { show } = useToast();
  const [repo] = useState(
    () => repository ?? new AppRepository(createBrowserStorage() ?? createMemoryStorage(), now),
  );
  const [sessionRepo] = useState(
    () => sessionRepository ?? new SessionRepository(createBrowserSessionStorage()),
  );

  const [session, setSession] = useState<DemoSession>(() => {
    const stored = initialSession !== undefined ? initialSession : sessionRepo.load();
    return resolveSession(repo, stored);
  });

  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    if (initialState) return initialState;
    return repo.load(session);
  });

  const warned = useRef(false);

  useEffect(() => {
    if (!session) return;
    const result = repo.save(state, session);
    if (!result.ok && !warned.current) {
      warned.current = true;
      show(
        result.reason === 'quota'
          ? '本地存储空间已满；本次修改仅保留在内存中。'
          : '浏览器阻止了本地存储；本次修改刷新后不会保留。',
        'error',
      );
    }
  }, [state, session, repo, show]);

  const updateSession = (next: DemoSession) => {
    sessionRepo.save(next);
    setSession(next);
  };

  const signIn = (name: string): AuthResult => {
    if (!isValidDemoAccountName(name)) {
      return { ok: false, error: '昵称需为 2–40 个字符' };
    }
    const cleaned = name.trim();
    if (!repo.accountExists(cleaned)) {
      return { ok: false, error: '找不到该演示账号，请先注册或选择访客进入' };
    }
    const next: DemoSession = { mode: 'account', name: cleaned };
    updateSession(next);
    dispatch({ type: 'state/replace', state: repo.loadAccount(cleaned) });
    show(`已进入演示账号 ${cleaned}`, 'success');
    return { ok: true };
  };

  const register = (name: string): AuthResult => {
    if (!isValidDemoAccountName(name)) {
      return { ok: false, error: '昵称需为 2–40 个字符' };
    }
    const cleaned = name.trim();
    if (repo.accountExists(cleaned)) {
      return { ok: false, error: '这个演示账号已存在，请直接登录' };
    }
    const next: DemoSession = { mode: 'account', name: cleaned };
    const fresh = createSeed(now());
    updateSession(next);
    dispatch({ type: 'state/reset', state: fresh });
    repo.save(fresh, next);
    show(`演示账号 ${cleaned} 已创建，仅保存在当前浏览器`, 'success');
    return { ok: true };
  };

  const continueAsGuest = () => {
    updateSession({ mode: 'guest' });
    dispatch({ type: 'state/replace', state: repo.load({ mode: 'guest' }) });
    show('已以访客模式进入，数据只保存在当前浏览器', 'info');
  };

  const signOut = () => {
    if (session) repo.save(state, session);
    updateSession(null);
    dispatch({ type: 'state/reset', state: createSeed(now()) });
  };

  const resetDemoData = () => {
    const fresh = createSeed(now());
    dispatch({ type: 'state/reset', state: fresh });
    show('演示数据已重置', 'success');
  };

  const value: AppContextValue = {
    state,
    dispatch,
    session,
    signIn,
    register,
    continueAsGuest,
    signOut,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
