export const DEMO_ACCOUNT_PREFIX = 'campus-life-demo-account:';
export const DEMO_ACCOUNT_MIN_LENGTH = 2;
export const DEMO_ACCOUNT_MAX_LENGTH = 40;

/** Stable localStorage key for a demo account. Never include passwords or tokens. */
export function demoAccountKey(name: string): string {
  return `${DEMO_ACCOUNT_PREFIX}${String(name ?? '')
    .trim()
    .toLowerCase()}`;
}

/** Demo nicknames are 2–40 characters after trimming; no password is ever collected. */
export function isValidDemoAccountName(name: unknown): boolean {
  const value = String(name ?? '').trim();
  return value.length >= DEMO_ACCOUNT_MIN_LENGTH && value.length <= DEMO_ACCOUNT_MAX_LENGTH;
}
