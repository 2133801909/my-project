import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/app/AppProvider';
import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { AppRepository, SessionRepository, createMemoryStorage } from '@/services/storage';
import { createSeed } from '@/state/seed';
import type { AppState, DemoSession } from '@/domain/types';

export const FIXED_NOW = new Date('2026-11-03T09:00:00');

interface RenderOptions {
  initialState?: AppState;
  initialSession?: DemoSession;
  entries?: string[];
  path?: string;
}

export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const storage = createMemoryStorage();
  const sessionStorage = createMemoryStorage();
  const repository = new AppRepository(storage, () => FIXED_NOW);
  const sessionRepository = new SessionRepository(sessionStorage);
  const state = options.initialState ?? createSeed(FIXED_NOW);
  const session: DemoSession =
    options.initialSession === undefined ? { mode: 'guest' } : options.initialSession;

  const result = render(
    <ToastProvider>
      <AppProvider
        repository={repository}
        sessionRepository={sessionRepository}
        initialState={state}
        initialSession={session}
        now={() => FIXED_NOW}
      >
        <MemoryRouter initialEntries={options.entries ?? ['/']}>
          {options.path ? (
            <Routes>
              <Route path={options.path} element={ui} />
            </Routes>
          ) : (
            ui
          )}
        </MemoryRouter>
      </AppProvider>
    </ToastProvider>,
  );

  return { ...result, repository, storage, sessionStorage };
}
