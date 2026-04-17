import { describe, it, expect } from 'vitest';
import { parseNames, dedupeNames } from '../utils/names';

describe('parseNames', () => {
  it('parses newline-separated names', () => {
    expect(parseNames('Alice\nBob\nCharlie')).toEqual([
      { display: 'Alice', qualifier: null },
      { display: 'Bob', qualifier: null },
      { display: 'Charlie', qualifier: null },
    ]);
  });

  it('parses comma-separated names', () => {
    expect(parseNames('Alice, Bob, Charlie')).toEqual([
      { display: 'Alice', qualifier: null },
      { display: 'Bob', qualifier: null },
      { display: 'Charlie', qualifier: null },
    ]);
  });

  it('handles mixed separators', () => {
    expect(parseNames('Alice, Bob\nCharlie, Dave')).toEqual([
      { display: 'Alice', qualifier: null },
      { display: 'Bob', qualifier: null },
      { display: 'Charlie', qualifier: null },
      { display: 'Dave', qualifier: null },
    ]);
  });

  it('trims whitespace', () => {
    expect(parseNames('  Alice  \n  Bob  ')).toEqual([
      { display: 'Alice', qualifier: null },
      { display: 'Bob', qualifier: null },
    ]);
  });

  it('removes blank lines', () => {
    expect(parseNames('Alice\n\n\nBob\n')).toEqual([
      { display: 'Alice', qualifier: null },
      { display: 'Bob', qualifier: null },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(parseNames('')).toEqual([]);
    expect(parseNames('   \n  \n  ')).toEqual([]);
  });

  it('extracts a trailing parenthetical qualifier', () => {
    expect(parseNames('Alice (RedTeam)')).toEqual([
      { display: 'Alice', qualifier: 'RedTeam' },
    ]);
  });

  it('tolerates extra whitespace around the qualifier', () => {
    expect(parseNames('  Alice   (  RedTeam  )  ')).toEqual([
      { display: 'Alice', qualifier: 'RedTeam' },
    ]);
  });

  it('treats an empty qualifier as no qualifier', () => {
    expect(parseNames('Alice ()')).toEqual([
      { display: 'Alice ()', qualifier: null },
    ]);
  });

  it('only matches parentheses at the end of the line', () => {
    expect(parseNames('Alice (RedTeam) Smith')).toEqual([
      { display: 'Alice (RedTeam) Smith', qualifier: null },
    ]);
  });

  it('parses a mix of qualified and unqualified names', () => {
    expect(parseNames('Alice (Red)\nBob\nCharlie (Blue)')).toEqual([
      { display: 'Alice', qualifier: 'Red' },
      { display: 'Bob', qualifier: null },
      { display: 'Charlie', qualifier: 'Blue' },
    ]);
  });
});

describe('dedupeNames', () => {
  it('removes case-insensitive duplicates by display name', () => {
    expect(
      dedupeNames([
        { display: 'Alice', qualifier: null },
        { display: 'alice', qualifier: null },
        { display: 'ALICE', qualifier: null },
        { display: 'Bob', qualifier: null },
      ]),
    ).toEqual([
      { display: 'Alice', qualifier: null },
      { display: 'Bob', qualifier: null },
    ]);
  });

  it('preserves first occurrence including its qualifier', () => {
    const result = dedupeNames([
      { display: 'Alice', qualifier: 'Red' },
      { display: 'alice', qualifier: 'Blue' },
      { display: 'ALICE', qualifier: null },
    ]);
    expect(result).toEqual([{ display: 'Alice', qualifier: 'Red' }]);
  });

  it('returns empty array for empty input', () => {
    expect(dedupeNames([])).toEqual([]);
  });
});
