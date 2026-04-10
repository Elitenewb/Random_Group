import type { GroupMode } from '../types';

interface GroupSettingsProps {
  title: string;
  onChangeTitle: (title: string) => void;
  groupMode: GroupMode;
  onChangeGroupMode: (mode: GroupMode) => void;
  groupCount: number;
  onChangeGroupCount: (count: number) => void;
  studentCount: number;
  canGenerate: boolean;
  validationMessage: string | null;
  hasGroups: boolean;
  onGenerate: () => void;
}

export function GroupSettings({
  title,
  onChangeTitle,
  groupMode,
  onChangeGroupMode,
  groupCount,
  onChangeGroupCount,
  studentCount,
  canGenerate,
  validationMessage,
  hasGroups,
  onGenerate,
}: GroupSettingsProps) {
  const maxGroups = groupMode === 'byGroups' ? Math.min(studentCount, 10) : studentCount;
  const minGroups = groupMode === 'byGroups' ? 2 : 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Group Settings
      </h2>

      <div>
        <label
          htmlFor="group-title"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Group Title
        </label>
        <input
          id="group-title"
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="e.g. Period 3 - English"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Group by
        </label>
        <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
          <button
            onClick={() => onChangeGroupMode('byGroups')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              groupMode === 'byGroups'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Number of groups
          </button>
          <button
            onClick={() => onChangeGroupMode('bySize')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              groupMode === 'bySize'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Students per group
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="group-count"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          {groupMode === 'byGroups' ? 'Number of groups' : 'Students per group'}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onChangeGroupCount(Math.max(minGroups, groupCount - 1))
            }
            disabled={groupCount <= minGroups}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Decrease"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <input
            id="group-count"
            type="number"
            min={minGroups}
            max={maxGroups}
            value={groupCount}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onChangeGroupCount(val);
            }}
            className="w-16 rounded-lg border border-gray-300 px-3 py-1.5 text-center text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() =>
              onChangeGroupCount(Math.min(maxGroups, groupCount + 1))
            }
            disabled={groupCount >= maxGroups}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Increase"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {validationMessage && (
        <p className="text-sm text-amber-600">{validationMessage}</p>
      )}

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {hasGroups ? 'Regenerate Groups' : 'Generate Groups'}
      </button>
    </div>
  );
}
