export interface ParsedName {
  display: string;
  qualifier: string | null;
}

export interface SavedList {
  id: string;
  name: string;
  names: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GeneratedGroup {
  label: string;
  students: string[];
}

export type GroupMode = 'byGroups' | 'bySize';

/** How parenthetical qualifiers affect grouping. */
export type QualifierMode = 'separate' | 'match';

export type ToolMode = 'groups' | 'picker';

export type PickMode = 'pure' | 'eliminate';

export interface AppState {
  title: string;
  rawText: string;
  groupCount: number;
  groupMode: GroupMode;
  qualifierMode: QualifierMode;
  dedupeEnabled: boolean;
}
