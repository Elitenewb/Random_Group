import type { GeneratedGroup, GroupMode, ParsedName } from '../types';
import { fisherYatesShuffle } from './shuffle';

export class QualifierConflictError extends Error {
  qualifier: string;
  count: number;
  maxAllowed: number;

  constructor(qualifier: string, count: number, maxAllowed: number) {
    super(
      `Qualifier '${qualifier}' has ${count} members but only ${maxAllowed} group${
        maxAllowed === 1 ? '' : 's'
      } are available.`,
    );
    this.name = 'QualifierConflictError';
    this.qualifier = qualifier;
    this.count = count;
    this.maxAllowed = maxAllowed;
  }
}

export type QualifierFeasibility =
  | { ok: true }
  | { ok: false; qualifier: string; count: number; maxAllowed: number };

function bucketByQualifier(students: ParsedName[]): {
  qualified: Map<string, ParsedName[]>;
  unqualified: ParsedName[];
} {
  const qualified = new Map<string, ParsedName[]>();
  const unqualified: ParsedName[] = [];
  for (const s of students) {
    if (s.qualifier !== null) {
      const list = qualified.get(s.qualifier);
      if (list) list.push(s);
      else qualified.set(s.qualifier, [s]);
    } else {
      unqualified.push(s);
    }
  }
  return { qualified, unqualified };
}

function largestBucketSize(qualified: Map<string, ParsedName[]>): {
  qualifier: string;
  count: number;
} | null {
  let largest: { qualifier: string; count: number } | null = null;
  for (const [qualifier, list] of qualified) {
    if (!largest || list.length > largest.count) {
      largest = { qualifier, count: list.length };
    }
  }
  return largest;
}

export function analyzeQualifierFeasibility(
  students: ParsedName[],
  mode: GroupMode,
  groupCount: number,
): QualifierFeasibility {
  if (students.length === 0 || groupCount <= 0) return { ok: true };
  const { qualified } = bucketByQualifier(students);
  const maxAllowed =
    mode === 'byGroups' ? groupCount : Math.ceil(students.length / groupCount);
  const largest = largestBucketSize(qualified);
  if (largest && largest.count > maxAllowed) {
    return {
      ok: false,
      qualifier: largest.qualifier,
      count: largest.count,
      maxAllowed,
    };
  }
  return { ok: true };
}

interface PlacementGroup {
  students: string[];
  qualifiers: Set<string>;
}

function pickEligibleGroup(
  groups: PlacementGroup[],
  isEligible: (g: PlacementGroup, index: number) => boolean,
): number {
  let bestSize = Infinity;
  const candidates: number[] = [];
  for (let i = 0; i < groups.length; i++) {
    if (!isEligible(groups[i], i)) continue;
    const size = groups[i].students.length;
    if (size < bestSize) {
      bestSize = size;
      candidates.length = 0;
      candidates.push(i);
    } else if (size === bestSize) {
      candidates.push(i);
    }
  }
  if (candidates.length === 0) return -1;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function distributeQualifiedBuckets(
  qualified: Map<string, ParsedName[]>,
  groups: PlacementGroup[],
  extraEligibility?: (g: PlacementGroup) => boolean,
): void {
  const buckets = Array.from(qualified.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [qualifier, members] of buckets) {
    const shuffled = fisherYatesShuffle(members);
    for (const member of shuffled) {
      const idx = pickEligibleGroup(groups, (g) => {
        if (g.qualifiers.has(qualifier)) return false;
        if (extraEligibility && !extraEligibility(g)) return false;
        return true;
      });
      if (idx === -1) {
        throw new QualifierConflictError(qualifier, members.length, groups.length);
      }
      groups[idx].students.push(member.display);
      groups[idx].qualifiers.add(qualifier);
    }
  }
}

function distributeUnqualified(
  unqualified: ParsedName[],
  groups: PlacementGroup[],
  extraEligibility?: (g: PlacementGroup) => boolean,
): void {
  const shuffled = fisherYatesShuffle(unqualified);
  for (const member of shuffled) {
    const idx = pickEligibleGroup(
      groups,
      extraEligibility ? (g) => extraEligibility(g) : () => true,
    );
    if (idx === -1) return;
    groups[idx].students.push(member.display);
  }
}

function finalize(groups: PlacementGroup[]): GeneratedGroup[] {
  return groups.map((g, i) => ({
    label: `Group ${i + 1}`,
    students: g.students,
  }));
}

export function splitIntoGroups(
  students: ParsedName[],
  count: number,
): GeneratedGroup[] {
  const { qualified, unqualified } = bucketByQualifier(students);
  const largest = largestBucketSize(qualified);
  if (largest && largest.count > count) {
    throw new QualifierConflictError(largest.qualifier, largest.count, count);
  }
  const groups: PlacementGroup[] = Array.from({ length: count }, () => ({
    students: [],
    qualifiers: new Set<string>(),
  }));
  distributeQualifiedBuckets(qualified, groups);
  distributeUnqualified(unqualified, groups);
  return finalize(groups);
}

export function splitBySize(
  students: ParsedName[],
  size: number,
): GeneratedGroup[] {
  if (students.length === 0) return [];
  const numGroups = Math.ceil(students.length / size);
  const { qualified, unqualified } = bucketByQualifier(students);
  const largest = largestBucketSize(qualified);
  if (largest && largest.count > numGroups) {
    throw new QualifierConflictError(
      largest.qualifier,
      largest.count,
      numGroups,
    );
  }
  const groups: PlacementGroup[] = Array.from({ length: numGroups }, () => ({
    students: [],
    qualifiers: new Set<string>(),
  }));
  const hasCapacity = (g: PlacementGroup) => g.students.length < size;
  distributeQualifiedBuckets(qualified, groups, hasCapacity);
  distributeUnqualified(unqualified, groups, hasCapacity);
  return finalize(groups);
}
