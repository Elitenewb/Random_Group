/**
 * True for phones/tablets where touch is the primary input (not hover-capable
 * mouse desktops). Used for first-load UI defaults only.
 */
export function isTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}
