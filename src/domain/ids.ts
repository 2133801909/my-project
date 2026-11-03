let counter = 0;

/** Stable-enough local ID; prefers crypto.randomUUID in secure contexts. */
export function uid(prefix = 'x'): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  counter += 1;
  return `${prefix}${uuid}${counter.toString(36)}`;
}
