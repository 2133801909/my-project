export interface MatchCandidate {
  id: string;
  department?: string;
  matchingEnabled?: boolean;
  blocked?: string[];
}

export interface MatchMe {
  id?: string;
  department?: string;
  matchingEnabled?: boolean;
  blocked?: string[];
}

/**
 * Matching is opt-in on both sides and limited to the same department.
 * Either side blocking the other removes the candidate.
 */
export function eligibleMatches<T extends MatchCandidate>(
  me: MatchMe | null | undefined,
  candidates: T[],
): T[] {
  if (!me?.matchingEnabled || !me.department) return [];
  return (candidates ?? []).filter(
    (candidate) =>
      candidate.id !== me.id &&
      candidate.matchingEnabled &&
      candidate.department === me.department &&
      !(me.blocked ?? []).includes(candidate.id) &&
      !(candidate.blocked ?? []).includes(me.id ?? ''),
  );
}

export function sharedInterests(a: string[], b: string[]): string[] {
  const right = new Set(b);
  return a.filter((interest) => right.has(interest));
}
