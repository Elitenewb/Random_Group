import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle } from '../utils/shuffle';

describe('fisherYatesShuffle', () => {
  const input = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  it('returns an array of the same length', () => {
    const result = fisherYatesShuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('contains all original elements', () => {
    const result = fisherYatesShuffle(input);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input array', () => {
    const copy = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(fisherYatesShuffle(['X'])).toEqual(['X']);
  });
});
