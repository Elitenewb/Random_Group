import type { ToolMode } from '../types';

interface ModeSwitcherProps {
  mode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
}

export function ModeSwitcher({ mode, onChangeMode }: ModeSwitcherProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Tool
      </h2>
      <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
        <button
          onClick={() => onChangeMode('groups')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            mode === 'groups'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Make Groups
        </button>
        <button
          onClick={() => onChangeMode('picker')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            mode === 'picker'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pick Student
        </button>
      </div>
    </div>
  );
}
