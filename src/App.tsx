import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { parseNames, dedupeNames } from './utils/names';
import { splitIntoGroups, splitBySize } from './utils/groups';
import { pickRandom } from './utils/shuffle';
import {
  pickAndRemoveOne,
  eliminationProgress,
} from './utils/pickerElimination';
import type { GeneratedGroup, SavedList, ToolMode, PickMode } from './types';
import { Header } from './components/Header';
import { StudentListInput } from './components/StudentListInput';
import { GroupSettings } from './components/GroupSettings';
import { SavedListsPanel } from './components/SavedListsPanel';
import { GroupResults } from './components/GroupResults';
import { Toolbar } from './components/Toolbar';
import { ModeSwitcher } from './components/ModeSwitcher';
import { RandomPickResult } from './components/RandomPickResult';

export default function App() {
  const { state, updateState } = useAppState();
  const [groups, setGroups] = useState<GeneratedGroup[]>([]);
  const [presentMode, setPresentMode] = useState(false);
  const [savedLists, setSavedLists] = useLocalStorage<SavedList[]>(
    'rgg-saved-lists',
    [],
  );
  const [loadedListId, setLoadedListId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('groups');
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState<PickMode>('pure');
  const [eliminationRemaining, setEliminationRemaining] = useState<string[]>(
    [],
  );

  const parsedNames = useMemo(() => {
    const names = parseNames(state.rawText);
    return state.dedupeEnabled ? dedupeNames(names) : names;
  }, [state.rawText, state.dedupeEnabled]);

  const parsedNamesKey = useMemo(
    () => JSON.stringify(parsedNames),
    [parsedNames],
  );

  useEffect(() => {
    setEliminationRemaining([]);
    setPickedStudent(null);
  }, [parsedNamesKey]);

  const studentCount = parsedNames.length;

  const canGenerate = useMemo(() => {
    if (studentCount < 2) return false;
    if (state.groupMode === 'byGroups') {
      return state.groupCount >= 2 && state.groupCount <= studentCount;
    }
    return state.groupCount >= 1 && state.groupCount <= studentCount;
  }, [studentCount, state.groupCount, state.groupMode]);

  const validationMessage = useMemo(() => {
    if (studentCount < 2) return 'Add at least 2 students to generate groups.';
    if (state.groupMode === 'byGroups') {
      if (state.groupCount > studentCount)
        return 'Number of groups cannot exceed number of students.';
      if (state.groupCount < 2) return 'Need at least 2 groups.';
    } else {
      if (state.groupCount < 1) return 'Group size must be at least 1.';
      if (state.groupCount > studentCount)
        return 'Group size cannot exceed number of students.';
    }
    return null;
  }, [studentCount, state.groupCount, state.groupMode]);

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    const result =
      state.groupMode === 'byGroups'
        ? splitIntoGroups(parsedNames, state.groupCount)
        : splitBySize(parsedNames, state.groupCount);
    setGroups(result);
  }, [canGenerate, parsedNames, state.groupCount, state.groupMode]);

  const handlePickModeChange = useCallback((mode: PickMode) => {
    setPickMode(mode);
    setEliminationRemaining([]);
    setPickedStudent(null);
  }, []);

  const handlePickStudent = useCallback(() => {
    if (studentCount < 1) return;
    if (pickMode === 'pure') {
      setPickedStudent(pickRandom(parsedNames));
      return;
    }
    const pool =
      eliminationRemaining.length > 0 ? eliminationRemaining : [...parsedNames];
    const { picked, nextRemaining } = pickAndRemoveOne(pool);
    setEliminationRemaining(nextRemaining);
    setPickedStudent(picked);
  }, [
    studentCount,
    pickMode,
    parsedNames,
    eliminationRemaining,
  ]);

  const pickProgress = useMemo(() => {
    if (
      pickMode !== 'eliminate' ||
      pickedStudent === null ||
      studentCount < 1
    ) {
      return null;
    }
    return eliminationProgress(studentCount, eliminationRemaining);
  }, [
    pickMode,
    pickedStudent,
    studentCount,
    eliminationRemaining,
  ]);

  const handleSaveList = useCallback(
    (name: string) => {
      const existing = savedLists.find(
        (l) => l.name.toLowerCase() === name.toLowerCase(),
      );
      const now = Date.now();
      if (existing) {
        const updated: SavedList = {
          ...existing,
          names: parsedNames,
          updatedAt: now,
        };
        setSavedLists((prev) =>
          prev.map((l) => (l.id === existing.id ? updated : l)),
        );
        setLoadedListId(existing.id);
      } else {
        const id = crypto.randomUUID();
        const newList: SavedList = {
          id,
          name,
          names: parsedNames,
          createdAt: now,
          updatedAt: now,
        };
        setSavedLists((prev) => [...prev, newList]);
        setLoadedListId(id);
      }
    },
    [parsedNames, savedLists, setSavedLists],
  );

  const handleLoadList = useCallback(
    (list: SavedList) => {
      updateState({ rawText: list.names.join('\n') });
      setLoadedListId(list.id);
    },
    [updateState],
  );

  const handleDeleteList = useCallback(
    (id: string) => {
      setSavedLists((prev) => prev.filter((l) => l.id !== id));
      if (loadedListId === id) setLoadedListId(null);
    },
    [setSavedLists, loadedListId],
  );

  const hasGroupResults = toolMode === 'groups' && groups.length > 0;
  const hasPickResult = toolMode === 'picker' && pickedStudent !== null;
  const hasAnyResult = hasGroupResults || hasPickResult;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        presentMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <Header
        presentMode={presentMode}
        onTogglePresentMode={() => setPresentMode((p) => !p)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={`grid gap-6 ${
            presentMode
              ? ''
              : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]'
          }`}
        >
          {!presentMode && (
            <div className="space-y-6 no-print">
              <StudentListInput
                rawText={state.rawText}
                onChangeRawText={(t) => updateState({ rawText: t })}
                studentCount={studentCount}
                dedupeEnabled={state.dedupeEnabled}
                onToggleDedupe={(v) => updateState({ dedupeEnabled: v })}
              />

              <SavedListsPanel
                savedLists={savedLists}
                loadedListId={loadedListId}
                defaultName={state.title || 'Untitled'}
                onSave={handleSaveList}
                onLoad={handleLoadList}
                onDelete={handleDeleteList}
              />

              <ModeSwitcher mode={toolMode} onChangeMode={setToolMode} />

              {toolMode === 'groups' && (
                <GroupSettings
                  title={state.title}
                  onChangeTitle={(t) => updateState({ title: t })}
                  groupMode={state.groupMode}
                  onChangeGroupMode={(m) => updateState({ groupMode: m })}
                  groupCount={state.groupCount}
                  onChangeGroupCount={(n) => updateState({ groupCount: n })}
                  studentCount={studentCount}
                  canGenerate={canGenerate}
                  validationMessage={validationMessage}
                  hasGroups={groups.length > 0}
                  onGenerate={handleGenerate}
                />
              )}

              {toolMode === 'picker' && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Random Pick
                  </h2>

                  <div>
                    <label
                      htmlFor="pick-title"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Title
                    </label>
                    <input
                      id="pick-title"
                      type="text"
                      value={state.title}
                      onChange={(e) => updateState({ title: e.target.value })}
                      placeholder="e.g. Period 3 - English"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Pick style
                    </label>
                    <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => handlePickModeChange('pure')}
                        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          pickMode === 'pure'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Pure random
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePickModeChange('eliminate')}
                        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          pickMode === 'eliminate'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Eliminate
                      </button>
                    </div>
                    {pickMode === 'eliminate' && (
                      <p className="mt-2 text-xs text-gray-500">
                        Each student is picked once per round; progress shows
                        how many have been chosen. A new round starts after
                        everyone has been picked.
                      </p>
                    )}
                  </div>

                  {studentCount < 1 && (
                    <p className="text-sm text-amber-600">
                      Add at least 1 student to pick.
                    </p>
                  )}

                  <button
                    onClick={handlePickStudent}
                    disabled={studentCount < 1}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {pickedStudent !== null
                      ? 'Pick Again'
                      : 'Pick Random Student'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {hasGroupResults && (
              <>
                <GroupResults
                  groups={groups}
                  title={state.title}
                  presentMode={presentMode}
                />
                <Toolbar
                  groups={groups}
                  title={state.title}
                  presentMode={presentMode}
                  onRegenerate={handleGenerate}
                />
              </>
            )}

            {hasPickResult && (
              <RandomPickResult
                name={pickedStudent}
                title={state.title}
                presentMode={presentMode}
                progress={pickProgress}
                onPickAgain={handlePickStudent}
              />
            )}

            {!hasAnyResult && !presentMode && (
              <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                <p className="text-center text-sm">
                  {toolMode === 'groups' ? (
                    <>
                      Configure your settings and click
                      <br />
                      <span className="font-medium text-gray-500">
                        Generate Groups
                      </span>{' '}
                      to get started.
                    </>
                  ) : (
                    <>
                      Add students and click
                      <br />
                      <span className="font-medium text-gray-500">
                        Pick Random Student
                      </span>{' '}
                      to select one.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
