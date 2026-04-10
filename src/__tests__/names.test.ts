import { describe, it, expect } from 'vitest';
import { parseNames, dedupeNames } from '../utils/names';

describe('parseNames', () => {
  it('parses newline-separated names', () => {
    expect(parseNames('Alice\nBob\nCharlie')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('parses comma-separated names', () => {
    expect(parseNames('Alice, Bob, Charlie')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('handles mixed separators', () => {
    expect(parseNames('Alice, Bob\nCharlie, Dave')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'Dave',
    ]);
  });

  it('trims whitespace', () => {
    expect(parseNames('  Alice  \n  Bob  ')).toEqual(['Alice', 'Bob']);
  });

  it('removes blank lines', () => {
    expect(parseNames('Alice\n\n\nBob\n')).toEqual(['Alice', 'Bob']);
  });

  it('returns empty array for empty input', () => {
    expect(parseNames('')).toEqual([]);
    expect(parseNames('   \n  \n  ')).toEqual([]);
  });
});

describe('dedupeNames', () => {
  it('removes case-insensitive duplicates', () => {
    expect(dedupeNames(['Alice', 'alice', 'ALICE', 'Bob'])).toEqual([
      'Alice',
      'Bob',
    ]);
  });

  it('preserves first occurrence', () => {
    const result = dedupeNames(['bob', 'Bob', 'BOB']);
    expect(result).toEqual(['bob']);
  });

  it('returns empty array for empty input', () => {
    expect(dedupeNames([])).toEqual([]);
  });
});
