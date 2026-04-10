import { describe, it, expect } from 'vitest';
import { splitIntoGroups, splitBySize } from '../utils/groups';

function allStudents(groups: { students: string[] }[]): string[] {
  return groups.flatMap((g) => g.students);
}

describe('splitIntoGroups', () => {
  const students = Array.from({ length: 10 }, (_, i) => `Student ${i + 1}`);

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
    expect(all).toEqual([...students].sort());
  });

  it('handles 23 students into 5 groups', () => {
    const big = Array.from({ length: 23 }, (_, i) => `S${i}`);
    const groups = splitIntoGroups(big, 5);
    expect(groups).toHaveLength(5);
    const sizes = groups.map((g) => g.students.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(allStudents(groups).sort()).toEqual([...big].sort());
  });

  it('handles 2 students into 2 groups', () => {
    const groups = splitIntoGroups(['A', 'B'], 2);
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
  it('creates groups of the specified size', () => {
    const students = Array.from({ length: 10 }, (_, i) => `S${i}`);
    const groups = splitBySize(students, 3);
    expect(groups.length).toBe(4);
    expect(groups[0].students.length).toBe(3);
    expect(groups[1].students.length).toBe(3);
    expect(groups[2].students.length).toBe(3);
    expect(groups[3].students.length).toBe(1);
  });

  it('includes every student exactly once', () => {
    const students = Array.from({ length: 7 }, (_, i) => `S${i}`);
    const groups = splitBySize(students, 2);
    expect(allStudents(groups).sort()).toEqual([...students].sort());
  });
});
