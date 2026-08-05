import { useEffect, useCallback } from 'react';
import { useState } from 'react';
import type { AppState } from '../types';
import { getAppState, setAppState } from '../utils/storage';

const DEMO_NAMES = [
  'Emma Thompson',
  'Liam Johnson',
  'Olivia Martinez',
  'Noah Williams',
  'Ava Brown',
  'Ethan Davis',
  'Sophia Garcia',
  'Mason Wilson',
  'Isabella Anderson',
  'Lucas Taylor',
  'Mia Thomas',
  'James Jackson',
].join('\n');

const DEFAULT_STATE: AppState = {
  title: 'My Class',
  rawText: DEMO_NAMES,
  groupCount: 4,
  groupMode: 'byGroups',
  qualifierMode: 'separate',
  dedupeEnabled: false,
};

function normalizeAppState(saved: AppState | null): AppState {
  if (!saved) return DEFAULT_STATE;
  return {
    ...DEFAULT_STATE,
    ...saved,
    qualifierMode:
      saved.qualifierMode === 'match' || saved.qualifierMode === 'separate'
        ? saved.qualifierMode
        : 'separate',
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    return normalizeAppState(getAppState());
  });

  useEffect(() => {
    setAppState(state);
  }, [state]);

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  return { state, updateState };
}
