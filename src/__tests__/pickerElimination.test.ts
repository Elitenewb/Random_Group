import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  pickAndRemoveOne,
  eliminationProgress,
} from '../utils/pickerElimination';

describe('pickAndRemoveOne', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reduces length by one and returns a picked element from the array', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const remaining = ['a', 'b', 'c'];
    const { picked, nextRemaining } = pickAndRemoveOne(remaining);
    expect(picked).toBe('a');
    expect(nextRemaining).toEqual(['b', 'c']);
    expect(remaining).toEqual(['a', 'b', 'c']);
  });

  it('picks last element when random returns just below 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const { picked, nextRemaining } = pickAndRemoveOne(['x', 'y', 'z']);
    expect(picked).toBe('z');
    expect(nextRemaining).toHaveLength(2);
    expect(nextRemaining).not.toContain('z');
  });

  it('removes only one occurrence when names are duplicated', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { picked, nextRemaining } = pickAndRemoveOne(['Sam', 'Sam', 'Pat']);
    expect(picked).toBe('Sam');
    expect(nextRemaining).toEqual(['Sam', 'Pat']);
  });

  it('throws on empty array', () => {
    expect(() => pickAndRemoveOne([])).toThrow(/empty/);
  });
});

describe('eliminationProgress', () => {
  it('returns current as total minus remaining length', () => {
    expect(eliminationProgress(20, [])).toEqual({ current: 20, total: 20 });
    expect(eliminationProgress(20, new Array(19))).toEqual({
      current: 1,
      total: 20,
    });
    expect(eliminationProgress(5, ['a', 'b', 'c'])).toEqual({
      current: 2,
      total: 5,
    });
  });
});
