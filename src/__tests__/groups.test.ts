import { describe, it, expect } from 'vitest';
import {
  splitIntoGroups,
  splitBySize,
  splitIntoGroupsBestEffort,
  splitBySizeBestEffort,
  analyzeQualifierFeasibility,
  QualifierConflictError,
} from '../utils/groups';
import type { ParsedName } from '../types';

function plain(names: string[]): ParsedName[] {
  return names.map((display) => ({ display, qualifier: null }));
}

function allStudents(groups: { students: string[] }[]): string[] {
  return groups.flatMap((g) => g.students);
}

describe('splitIntoGroups', () => {
  const students = plain(
    Array.from({ length: 10 }, (_, i) => `Student ${i + 1}`),
  );

  it('creates the requested number of groups', () => {
    const groups = splitIntoGroups(students, 3);
    expect(groups).toHaveLength(3);
  });

  it('distributes students with sizes differing by at most 1', () => {
    const groups = splitIntoGroups(students, 3);
    const sizes = groups.map((g) => g.students.length);
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it('includes every student exactly once', () => {
    const groups = splitIntoGroups(students, 3);
    const all = allStudents(groups).sort();
    const expected = students.map((s) => s.display).sort();
    expect(all).toEqual(expected);
  });

  it('handles 23 students into 5 groups', () => {
    const big = plain(Array.from({ length: 23 }, (_, i) => `S${i}`));
    const groups = splitIntoGroups(big, 5);
    expect(groups).toHaveLength(5);
    const sizes = groups.map((g) => g.students.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(allStudents(groups).sort()).toEqual(
      big.map((s) => s.display).sort(),
    );
  });

  it('handles 2 students into 2 groups', () => {
    const groups = splitIntoGroups(plain(['A', 'B']), 2);
    expect(groups).toHaveLength(2);
    expect(groups[0].students).toHaveLength(1);
    expect(groups[1].students).toHaveLength(1);
  });

  it('labels groups correctly', () => {
    const groups = splitIntoGroups(students, 4);
    expect(groups.map((g) => g.label)).toEqual([
      'Group 1',
      'Group 2',
      'Group 3',
      'Group 4',
    ]);
  });
});

describe('splitBySize', () => {
  it('creates ceil(N/size) groups and no group exceeds size', () => {
    const students = plain(Array.from({ length: 10 }, (_, i) => `S${i}`));
    const groups = splitBySize(students, 3);
    expect(groups.length).toBe(4);
    for (const g of groups) {
      expect(g.students.length).toBeLessThanOrEqual(3);
    }
    const totalSize = groups.reduce((acc, g) => acc + g.students.length, 0);
    expect(totalSize).toBe(10);
  });

  it('balances sizes within 1 when the last group would otherwise be small', () => {
    const students = plain(Array.from({ length: 10 }, (_, i) => `S${i}`));
    const groups = splitBySize(students, 3);
    const sizes = groups.map((g) => g.students.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('includes every student exactly once', () => {
    const students = plain(Array.from({ length: 7 }, (_, i) => `S${i}`));
    const groups = splitBySize(students, 2);
    expect(allStudents(groups).sort()).toEqual(
      students.map((s) => s.display).sort(),
    );
  });
});

describe('qualifier-aware splitIntoGroups', () => {
  function groupHasDuplicateQualifier(
    group: { students: string[] },
    qualifierByDisplay: Map<string, string | null>,
  ): boolean {
    const seen = new Set<string>();
    for (const s of group.students) {
      const q = qualifierByDisplay.get(s);
      if (q == null) continue;
      if (seen.has(q)) return true;
      seen.add(q);
    }
    return false;
  }

  it('keeps members with the same qualifier in different groups', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'B1', qualifier: 'B' },
      { display: 'B2', qualifier: 'B' },
      { display: 'C', qualifier: null },
    ];
    const qualByDisplay = new Map(students.map((s) => [s.display, s.qualifier]));
    for (let trial = 0; trial < 50; trial++) {
      const groups = splitIntoGroups(students, 3);
      for (const g of groups) {
        expect(groupHasDuplicateQualifier(g, qualByDisplay)).toBe(false);
      }
      expect(allStudents(groups).sort()).toEqual(
        students.map((s) => s.display).sort(),
      );
    }
  });

  it('distributes unqualified members with size diff of at most 1', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'B1', qualifier: 'B' },
      { display: 'C', qualifier: null },
      { display: 'D', qualifier: null },
      { display: 'E', qualifier: null },
      { display: 'F', qualifier: null },
    ];
    for (let trial = 0; trial < 20; trial++) {
      const groups = splitIntoGroups(students, 3);
      const sizes = groups.map((g) => g.students.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    }
  });

  it('returns only the display name (qualifier stripped) in group output', () => {
    const students: ParsedName[] = [
      { display: 'Alice', qualifier: 'Red' },
      { display: 'Bob', qualifier: 'Red' },
      { display: 'Charlie', qualifier: null },
    ];
    const groups = splitIntoGroups(students, 2);
    const all = allStudents(groups);
    for (const s of all) {
      expect(s).not.toMatch(/\(/);
    }
    expect(all.sort()).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('throws QualifierConflictError when a qualifier has more members than groups', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'B', qualifier: null },
    ];
    expect(() => splitIntoGroups(students, 2)).toThrow(QualifierConflictError);
  });
});

describe('qualifier-aware splitBySize', () => {
  it('never puts two same-qualifier members in one group', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'B1', qualifier: 'B' },
      { display: 'B2', qualifier: 'B' },
      { display: 'C', qualifier: null },
      { display: 'D', qualifier: null },
    ];
    const qualByDisplay = new Map(students.map((s) => [s.display, s.qualifier]));
    for (let trial = 0; trial < 50; trial++) {
      const groups = splitBySize(students, 3);
      for (const g of groups) {
        const seen = new Set<string>();
        for (const s of g.students) {
          const q = qualByDisplay.get(s);
          if (q == null) continue;
          expect(seen.has(q)).toBe(false);
          seen.add(q);
        }
      }
      expect(allStudents(groups).sort()).toEqual(
        students.map((s) => s.display).sort(),
      );
    }
  });

  it('throws when a qualifier bucket exceeds the resulting group count', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'B', qualifier: null },
    ];
    expect(() => splitBySize(students, 2)).toThrow(QualifierConflictError);
  });
});

describe('analyzeQualifierFeasibility', () => {
  it('returns ok when all qualifier buckets fit', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'B', qualifier: null },
    ];
    expect(analyzeQualifierFeasibility(students, 'byGroups', 2)).toEqual({
      ok: true,
    });
  });

  it('flags byGroups conflict with the offending qualifier', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
    ];
    expect(analyzeQualifierFeasibility(students, 'byGroups', 2)).toEqual({
      ok: false,
      qualifier: 'A',
      count: 3,
      maxAllowed: 2,
    });
  });

  it('flags bySize conflict using the computed number of groups', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'B', qualifier: null },
    ];
    expect(analyzeQualifierFeasibility(students, 'bySize', 2)).toEqual({
      ok: false,
      qualifier: 'A',
      count: 3,
      maxAllowed: 2,
    });
  });
});

describe('splitIntoGroupsBestEffort', () => {
  it('returns the requested number of groups even when a bucket overflows', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
    ];
    const { groups, conflicts } = splitIntoGroupsBestEffort(students, 2);
    expect(groups).toHaveLength(2);
    expect(allStudents(groups).sort()).toEqual(['A1', 'A2', 'A3']);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].qualifier).toBe('A');
    expect(conflicts[0].count).toBe(1);
    expect(conflicts[0].groups).toHaveLength(1);
    expect(['Group 1', 'Group 2']).toContain(conflicts[0].groups[0]);
  });

  it('reports only qualifiers that actually overflow', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'A4', qualifier: 'A' },
      { display: 'A5', qualifier: 'A' },
      { display: 'B1', qualifier: 'B' },
      { display: 'B2', qualifier: 'B' },
      { display: 'B3', qualifier: 'B' },
    ];
    for (let trial = 0; trial < 20; trial++) {
      const { groups, conflicts } = splitIntoGroupsBestEffort(students, 3);
      expect(groups).toHaveLength(3);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].qualifier).toBe('A');
      expect(conflicts[0].count).toBe(2);
      expect(conflicts[0].groups.length).toBeGreaterThanOrEqual(1);
      expect(conflicts[0].groups.length).toBeLessThanOrEqual(2);
      const sizes = groups.map((g) => g.students.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    }
  });

  it('returns only display names (qualifier stripped)', () => {
    const students: ParsedName[] = [
      { display: 'Alice', qualifier: 'A' },
      { display: 'Bob', qualifier: 'A' },
      { display: 'Charlie', qualifier: 'A' },
    ];
    const { groups } = splitIntoGroupsBestEffort(students, 2);
    for (const s of allStudents(groups)) {
      expect(s).not.toMatch(/\(/);
    }
  });

  it('returns no conflicts when the arrangement is feasible', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'B', qualifier: null },
    ];
    const { conflicts } = splitIntoGroupsBestEffort(students, 2);
    expect(conflicts).toEqual([]);
  });
});

describe('splitBySizeBestEffort', () => {
  it('produces ceil(N/size) groups within capacity even with overflow', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'A4', qualifier: 'A' },
    ];
    const { groups, conflicts } = splitBySizeBestEffort(students, 2);
    expect(groups).toHaveLength(2);
    for (const g of groups) {
      expect(g.students.length).toBeLessThanOrEqual(2);
    }
    expect(allStudents(groups).sort()).toEqual(['A1', 'A2', 'A3', 'A4']);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].qualifier).toBe('A');
    expect(conflicts[0].count).toBe(2);
    expect(conflicts[0].groups.length).toBeGreaterThanOrEqual(1);
    expect(conflicts[0].groups.length).toBeLessThanOrEqual(2);
  });
});

describe('strict functions still throw with the same inputs', () => {
  it('splitIntoGroups throws when best-effort would be needed', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
    ];
    expect(() => splitIntoGroups(students, 2)).toThrow(QualifierConflictError);
  });

  it('splitBySize throws when best-effort would be needed', () => {
    const students: ParsedName[] = [
      { display: 'A1', qualifier: 'A' },
      { display: 'A2', qualifier: 'A' },
      { display: 'A3', qualifier: 'A' },
      { display: 'A4', qualifier: 'A' },
    ];
    expect(() => splitBySize(students, 2)).toThrow(QualifierConflictError);
  });
});
