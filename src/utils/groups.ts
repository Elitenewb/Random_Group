import type { GeneratedGroup, ParsedName, QualifierMode } from '../types';
import { fisherYatesShuffle } from './shuffle';

export class QualifierConflictError extends Error {
  qualifier: string;
  count: number;
  maxAllowed: number;
  mode: QualifierMode;

  constructor(
    qualifier: string,
    count: number,
    maxAllowed: number,
    mode: QualifierMode = 'separate',
  ) {
    const message =
      mode === 'match'
        ? `Qualifier '${qualifier}' has ${count} members but groups only hold ${maxAllowed} student${
            maxAllowed === 1 ? '' : 's'
          }.`
        : `Qualifier '${qualifier}' has ${count} members but only ${maxAllowed} group${
            maxAllowed === 1 ? '' : 's'
          } are available.`;
    super(message);
    this.name = 'QualifierConflictError';
    this.qualifier = qualifier;
    this.count = count;
    this.maxAllowed = maxAllowed;
    this.mode = mode;
  }
}

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

interface PlacementGroup {
  students: string[];
  qualifiers: Set<string>;
  targetSize?: number;
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

/** Prefer the eligible group with the most free capacity (ties broken randomly). */
function pickMostCapacityGroup(
  groups: PlacementGroup[],
  capacityOf: (g: PlacementGroup) => number,
  isEligible: (g: PlacementGroup) => boolean,
): number {
  let bestCap = -1;
  const candidates: number[] = [];
  for (let i = 0; i < groups.length; i++) {
    if (!isEligible(groups[i])) continue;
    const cap = capacityOf(groups[i]);
    if (cap <= 0) continue;
    if (cap > bestCap) {
      bestCap = cap;
      candidates.length = 0;
      candidates.push(i);
    } else if (cap === bestCap) {
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
  /** separate: forced overlap; match: forced split across groups */
  kind: 'overlap' | 'split';
}

interface ConflictAccumulatorEntry {
  count: number;
  groupIndices: Set<number>;
}

function distributeQualifiedBucketsSeparate(
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
            'separate',
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
            'separate',
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

function distributeQualifiedBucketsMatch(
  qualified: Map<string, ParsedName[]>,
  groups: PlacementGroup[],
): void {
  const capacityOf = (g: PlacementGroup) =>
    (g.targetSize ?? Number.POSITIVE_INFINITY) - g.students.length;

  const buckets = Array.from(qualified.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );

  for (const [qualifier, members] of buckets) {
    const shuffled = fisherYatesShuffle(members);
    let remaining = shuffled;

    while (remaining.length > 0) {
      // Prefer continuing a group that already has this qualifier.
      let idx = pickMostCapacityGroup(
        groups,
        capacityOf,
        (g) => g.qualifiers.has(qualifier),
      );

      // An exact fit avoids opening a partially filled group that a later tag
      // could have occupied as a complete same-tag pair or cluster.
      if (idx === -1) {
        idx = pickEligibleGroup(groups, (g) => {
          return capacityOf(g) === remaining.length;
        });
      }

      // Otherwise use the largest available slot, minimizing the number of
      // groups this tag spans while preserving each group's balanced target.
      if (idx === -1) {
        idx = pickMostCapacityGroup(groups, capacityOf, () => true);
      }

      if (idx === -1) {
        throw new QualifierConflictError(
          qualifier,
          members.length,
          Math.max(...groups.map((g) => g.targetSize ?? 0)),
          'match',
        );
      }

      const fits = Math.min(remaining.length, capacityOf(groups[idx]));
      if (fits <= 0) {
        throw new QualifierConflictError(
          qualifier,
          members.length,
          Math.max(...groups.map((g) => g.targetSize ?? 0)),
          'match',
        );
      }

      for (let i = 0; i < fits; i++) {
        groups[idx].students.push(remaining[i].display);
      }
      groups[idx].qualifiers.add(qualifier);
      remaining = remaining.slice(fits);
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
  kind: 'overlap' | 'split',
): QualifierConflict[] {
  return Array.from(conflicts.entries())
    .map(([qualifier, { count, groupIndices }]) => ({
      qualifier,
      count,
      kind,
      groups: Array.from(groupIndices)
        .sort((a, b) => a - b)
        .map((i) => `Group ${i + 1}`),
    }))
    .sort((a, b) => b.count - a.count || a.qualifier.localeCompare(b.qualifier));
}

function balancedTargetSizes(total: number, count: number): number[] {
  const minimum = Math.floor(total / count);
  const largerGroups = total % count;
  return fisherYatesShuffle(
    Array.from(
      { length: count },
      (_, index) => minimum + (index < largerGroups ? 1 : 0),
    ),
  );
}

function emptyGroups(
  count: number,
  targetSizes?: number[],
): PlacementGroup[] {
  return Array.from({ length: count }, (_, index) => ({
    students: [],
    qualifiers: new Set<string>(),
    targetSize: targetSizes?.[index],
  }));
}

export function splitIntoGroups(
  students: ParsedName[],
  count: number,
  qualifierMode: QualifierMode = 'separate',
): GeneratedGroup[] {
  const { qualified, unqualified } = bucketByQualifier(students);
  const groups = emptyGroups(
    count,
    qualifierMode === 'match'
      ? balancedTargetSizes(students.length, count)
      : undefined,
  );
  if (qualifierMode === 'match') {
    distributeQualifiedBucketsMatch(qualified, groups);
  } else {
    distributeQualifiedBucketsSeparate(qualified, groups, { bestEffort: true });
  }
  distributeUnqualified(unqualified, groups);
  return finalize(groups);
}

export function splitBySize(
  students: ParsedName[],
  size: number,
  qualifierMode: QualifierMode = 'separate',
): GeneratedGroup[] {
  if (students.length === 0) return [];
  const numGroups = Math.ceil(students.length / size);
  const { qualified, unqualified } = bucketByQualifier(students);
  const groups = emptyGroups(
    numGroups,
    qualifierMode === 'match'
      ? balancedTargetSizes(students.length, numGroups)
      : undefined,
  );
  const hasCapacity = (g: PlacementGroup) =>
    g.students.length < (g.targetSize ?? size);
  if (qualifierMode === 'match') {
    distributeQualifiedBucketsMatch(qualified, groups);
  } else {
    distributeQualifiedBucketsSeparate(qualified, groups, {
      extraEligibility: hasCapacity,
      bestEffort: true,
    });
  }
  distributeUnqualified(unqualified, groups, hasCapacity);
  return finalize(groups);
}

export function splitIntoGroupsBestEffort(
  students: ParsedName[],
  count: number,
  qualifierMode: QualifierMode = 'separate',
): { groups: GeneratedGroup[]; conflicts: QualifierConflict[] } {
  const { qualified, unqualified } = bucketByQualifier(students);
  const groups = emptyGroups(
    count,
    qualifierMode === 'match'
      ? balancedTargetSizes(students.length, count)
      : undefined,
  );
  const conflicts = new Map<string, ConflictAccumulatorEntry>();
  if (qualifierMode === 'match') {
    distributeQualifiedBucketsMatch(qualified, groups);
  } else {
    distributeQualifiedBucketsSeparate(qualified, groups, {
      bestEffort: true,
      conflicts,
    });
  }
  distributeUnqualified(unqualified, groups);
  return {
    groups: finalize(groups),
    conflicts: conflictsMapToArray(
      conflicts,
      qualifierMode === 'match' ? 'split' : 'overlap',
    ),
  };
}

export function splitBySizeBestEffort(
  students: ParsedName[],
  size: number,
  qualifierMode: QualifierMode = 'separate',
): { groups: GeneratedGroup[]; conflicts: QualifierConflict[] } {
  if (students.length === 0) return { groups: [], conflicts: [] };
  const numGroups = Math.ceil(students.length / size);
  const { qualified, unqualified } = bucketByQualifier(students);
  const groups = emptyGroups(
    numGroups,
    qualifierMode === 'match'
      ? balancedTargetSizes(students.length, numGroups)
      : undefined,
  );
  const hasCapacity = (g: PlacementGroup) =>
    g.students.length < (g.targetSize ?? size);
  const conflicts = new Map<string, ConflictAccumulatorEntry>();
  if (qualifierMode === 'match') {
    distributeQualifiedBucketsMatch(qualified, groups);
  } else {
    distributeQualifiedBucketsSeparate(qualified, groups, {
      extraEligibility: hasCapacity,
      bestEffort: true,
      conflicts,
    });
  }
  distributeUnqualified(unqualified, groups, hasCapacity);
  return {
    groups: finalize(groups),
    conflicts: conflictsMapToArray(
      conflicts,
      qualifierMode === 'match' ? 'split' : 'overlap',
    ),
  };
}
