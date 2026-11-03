import { createContext, useContext } from 'react';
import type { AppState, DemoSession } from '@/domain/types';
import type { AppAction } from '@/state/reducer';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  session: DemoSession;
  signIn: (name: string) => AuthResult;
  register: (name: string) => AuthResult;
  continueAsGuest: () => void;
  signOut: () => void;
  resetDemoData: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>');
  return value;
}
