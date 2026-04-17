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

export interface QualifierConflict {
  qualifier: string;
  count: number;
  /** 1-based labels matching generated group cards, e.g. "Group 1" */
  groups: string[];
}

interface ConflictAccumulatorEntry {
  count: number;
  groupIndices: Set<number>;
}

function distributeQualifiedBuckets(
  qualified: Map<string, ParsedName[]>,
  groups: PlacementGroup[],
  options: {
    extraEligibility?: (g: PlacementGroup) => boolean;
    bestEffort?: boolean;
    conflicts?: Map<string, ConflictAccumulatorEntry>;
  } = {},
): void {
  const { extraEligibility, bestEffort, conflicts } = options;
  const buckets = Array.from(qualified.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [qualifier, members] of buckets) {
    const shuffled = fisherYatesShuffle(members);
    for (const member of shuffled) {
      let idx = pickEligibleGroup(groups, (g) => {
        if (g.qualifiers.has(qualifier)) return false;
        if (extraEligibility && !extraEligibility(g)) return false;
        return true;
      });
      if (idx === -1) {
        if (!bestEffort) {
          throw new QualifierConflictError(
            qualifier,
            members.length,
            groups.length,
          );
        }
        idx = pickEligibleGroup(groups, (g) => {
          if (extraEligibility && !extraEligibility(g)) return false;
          return true;
        });
        if (idx === -1) {
          throw new QualifierConflictError(
            qualifier,
            members.length,
            groups.length,
          );
        }
        if (conflicts) {
          const prev = conflicts.get(qualifier) ?? {
            count: 0,
            groupIndices: new Set<number>(),
          };
          prev.count += 1;
          prev.groupIndices.add(idx);
          conflicts.set(qualifier, prev);
        }
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

function conflictsMapToArray(
  conflicts: Map<string, ConflictAccumulatorEntry>,
): QualifierConflict[] {
  return Array.from(conflicts.entries())
    .map(([qualifier, { count, groupIndices }]) => ({
      qualifier,
      count,
      groups: Array.from(groupIndices)
        .sort((a, b) => a - b)
        .map((i) => `Group ${i + 1}`),
    }))
    .sort((a, b) => b.count - a.count || a.qualifier.localeCompare(b.qualifier));
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
  distributeQualifiedBuckets(qualified, groups, {
    extraEligibility: hasCapacity,
  });
  distributeUnqualified(unqualified, groups, hasCapacity);
  return finalize(groups);
}

export function splitIntoGroupsBestEffort(
  students: ParsedName[],
  count: number,
): { groups: GeneratedGroup[]; conflicts: QualifierConflict[] } {
  const { qualified, unqualified } = bucketByQualifier(students);
  const groups: PlacementGroup[] = Array.from({ length: count }, () => ({
    students: [],
    qualifiers: new Set<string>(),
  }));
  const conflicts = new Map<string, ConflictAccumulatorEntry>();
  distributeQualifiedBuckets(qualified, groups, {
    bestEffort: true,
    conflicts,
  });
  distributeUnqualified(unqualified, groups);
  return {
    groups: finalize(groups),
    conflicts: conflictsMapToArray(conflicts),
  };
}

export function splitBySizeBestEffort(
  students: ParsedName[],
  size: number,
): { groups: GeneratedGroup[]; conflicts: QualifierConflict[] } {
  if (students.length === 0) return { groups: [], conflicts: [] };
  const numGroups = Math.ceil(students.length / size);
  const { qualified, unqualified } = bucketByQualifier(students);
  const groups: PlacementGroup[] = Array.from({ length: numGroups }, () => ({
    students: [],
    qualifiers: new Set<string>(),
  }));
  const hasCapacity = (g: PlacementGroup) => g.students.length < size;
  const conflicts = new Map<string, ConflictAccumulatorEntry>();
  distributeQualifiedBuckets(qualified, groups, {
    extraEligibility: hasCapacity,
    bestEffort: true,
    conflicts,
  });
  distributeUnqualified(unqualified, groups, hasCapacity);
  return {
    groups: finalize(groups),
    conflicts: conflictsMapToArray(conflicts),
  };
}
