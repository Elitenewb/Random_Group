export function pickAndRemoveOne(remaining: string[]): {
  picked: string;
  nextRemaining: string[];
} {
  if (remaining.length === 0) {
    throw new Error('pickAndRemoveOne: remaining array is empty');
  }
  const i = Math.floor(Math.random() * remaining.length);
  const picked = remaining[i];
  const nextRemaining = remaining.filter((_, j) => j !== i);
  return { picked, nextRemaining };
}

export function eliminationProgress(
  total: number,
  nextRemaining: string[],
): { current: number; total: number } {
  return { current: total - nextRemaining.length, total };
}
