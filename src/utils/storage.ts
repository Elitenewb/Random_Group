import type { SavedList, AppState } from '../types';

const LISTS_KEY = 'rgg-saved-lists';
const STATE_KEY = 'rgg-app-state';

export function getSavedLists(): SavedList[] {
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setSavedLists(lists: SavedList[]): void {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export function saveList(list: SavedList): void {
  const lists = getSavedLists();
  const idx = lists.findIndex((l) => l.id === list.id);
  if (idx >= 0) {
    lists[idx] = list;
  } else {
    lists.push(list);
  }
  setSavedLists(lists);
}

export function deleteList(id: string): void {
  setSavedLists(getSavedLists().filter((l) => l.id !== id));
}

export function getAppState(): AppState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAppState(state: AppState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
