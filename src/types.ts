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

export type ToolMode = 'groups' | 'picker';

export type PickMode = 'pure' | 'eliminate';

export interface AppState {
  title: string;
  rawText: string;
  groupCount: number;
  groupMode: GroupMode;
  dedupeEnabled: boolean;
}
