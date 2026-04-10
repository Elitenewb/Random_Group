import { useState } from 'react';
import type { SavedList } from '../types';

interface SavedListsPanelProps {
  savedLists: SavedList[];
  loadedListId: string | null;
  defaultName: string;
  onSave: (name: string) => void;
  onLoad: (list: SavedList) => void;
  onDelete: (id: string) => void;
}

export function SavedListsPanel({
  savedLists,
  loadedListId,
  defaultName,
  onSave,
  onLoad,
  onDelete,
}: SavedListsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    const name = saveName.trim() || defaultName;
    onSave(name);
    setSaveName('');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
      >
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Saved Lists
          {savedLists.length > 0 && (
            <span className="ml-2 text-gray-400 font-normal normal-case">
              ({savedLists.length})
            </span>
          )}
        </h2>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={defaultName}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <button
              onClick={handleSave}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Save list
            </button>
          </div>

          {savedLists.length === 0 && (
            <p className="text-xs text-gray-400 py-2 text-center">
              No saved lists yet.
            </p>
          )}

          {savedLists.length > 0 && (
            <ul className="space-y-1">
              {savedLists.map((list) => (
                <li
                  key={list.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    loadedListId === list.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-800 truncate block">
                      {list.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {list.names.length} students
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => onLoad(list)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Load
                    </button>
                    {confirmDeleteId === list.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDelete(list.id);
                            setConfirmDeleteId(null);
                          }}
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(list.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
