import type { ParsedName } from '../types';

const QUALIFIER_REGEX = /^(.*?)\s*\(([^()]+)\)\s*$/;

export function parseNames(raw: string): ParsedName[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((line) => {
      const match = QUALIFIER_REGEX.exec(line);
      if (match) {
        const display = match[1].trim();
        const qualifier = match[2].trim();
        if (display.length > 0 && qualifier.length > 0) {
          return { display, qualifier };
        }
      }
      return { display: line, qualifier: null };
    });
}

export function dedupeNames(names: ParsedName[]): ParsedName[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.display.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
