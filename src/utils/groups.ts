import type { GeneratedGroup } from '../types';
import { fisherYatesShuffle } from './shuffle';

export function splitIntoGroups(
  students: string[],
  count: number,
): GeneratedGroup[] {
  const shuffled = fisherYatesShuffle(students);
  const groups: GeneratedGroup[] = Array.from({ length: count }, (_, i) => ({
    label: `Group ${i + 1}`,
    students: [],
  }));

  for (let i = 0; i < shuffled.length; i++) {
    groups[i % count].students.push(shuffled[i]);
  }

  return groups;
}

export function splitBySize(
  students: string[],
  size: number,
): GeneratedGroup[] {
  const shuffled = fisherYatesShuffle(students);
  const groups: GeneratedGroup[] = [];
  for (let i = 0; i < shuffled.length; i += size) {
    groups.push({
      label: `Group ${groups.length + 1}`,
      students: shuffled.slice(i, i + size),
    });
  }
  return groups;
}
