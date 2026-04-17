interface StudentListInputProps {
  rawText: string;
  onChangeRawText: (text: string) => void;
  studentCount: number;
  dedupeEnabled: boolean;
  onToggleDedupe: (enabled: boolean) => void;
}

export function StudentListInput({
  rawText,
  onChangeRawText,
  studentCount,
  dedupeEnabled,
  onToggleDedupe,
}: StudentListInputProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Student Names
        </h2>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {studentCount} {studentCount === 1 ? 'student' : 'students'}
        </span>
      </div>

      <textarea
        value={rawText}
        onChange={(e) => onChangeRawText(e.target.value)}
        placeholder={
          'Enter one name per line, or paste comma-separated names.\nAdd a qualifier in parentheses to keep those students apart.\n\nExample:\nAlice (RedTeam)\nBob (RedTeam)\nCharlie'
        }
        rows={10}
        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        spellCheck={false}
      />

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={dedupeEnabled}
            onChange={(e) => onToggleDedupe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Remove duplicates
        </label>

        <button
          onClick={() => onChangeRawText('')}
          disabled={rawText.length === 0}
          className="text-sm font-medium text-gray-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
        >
          Clear list
        </button>
      </div>
    </div>
  );
}
