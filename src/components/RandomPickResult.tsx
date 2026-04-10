interface RandomPickResultProps {
  name: string | null;
  title: string;
  presentMode: boolean;
  progress: { current: number; total: number } | null;
  onPickAgain: () => void;
  /** Hide when primary pick action lives in the Random Pick panel below (normal layout). */
  showInlinePickAgain?: boolean;
}

export function RandomPickResult({
  name,
  title,
  presentMode,
  progress,
  onPickAgain,
  showInlinePickAgain = true,
}: RandomPickResultProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {title && (
        <h2
          className={`font-semibold ${
            presentMode ? 'text-2xl text-white' : 'text-lg text-gray-800'
          }`}
        >
          {title}
        </h2>
      )}

      <div
        className={`w-full rounded-xl border shadow-sm px-8 py-12 text-center ${
          presentMode
            ? 'border-gray-600 bg-gray-800'
            : 'border-gray-200 bg-white'
        }`}
      >
        <p
          className={`text-sm font-medium uppercase tracking-wide mb-4 ${
            presentMode ? 'text-gray-400' : 'text-gray-400'
          }`}
        >
          Selected Student
        </p>
        {name && progress && (
          <p
            className={`text-sm font-medium tabular-nums mb-3 ${
              presentMode ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {progress.current} / {progress.total}
          </p>
        )}
        {name ? (
          <p
            className={`font-bold leading-tight ${
              presentMode ? 'text-6xl text-white' : 'text-4xl text-gray-900'
            }`}
          >
            {name}
          </p>
        ) : (
          <p
            className={`text-lg ${
              presentMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {presentMode
              ? 'Pick a student from the controls.'
              : 'Use Pick Random Student below.'}
          </p>
        )}
      </div>

      {showInlinePickAgain && name && (
        <button
          onClick={onPickAgain}
          className={`no-print inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            presentMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Pick Again
        </button>
      )}
    </div>
  );
}
