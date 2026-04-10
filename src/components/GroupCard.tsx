import type { GeneratedGroup } from '../types';

interface GroupCardProps {
  group: GeneratedGroup;
  presentMode: boolean;
}

export function GroupCard({ group, presentMode }: GroupCardProps) {
  return (
    <div
      className={`group-card rounded-xl border shadow-sm transition-colors ${
        presentMode
          ? 'border-gray-600 bg-gray-800'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          presentMode ? 'border-gray-600' : 'border-gray-100'
        }`}
      >
        <h3
          className={`font-semibold ${
            presentMode ? 'text-xl text-white' : 'text-sm text-gray-800'
          }`}
        >
          {group.label}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            presentMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {group.students.length}
        </span>
      </div>
      <ul className="px-4 py-3 space-y-1">
        {group.students.map((student, i) => (
          <li
            key={i}
            className={`${
              presentMode
                ? 'text-lg text-gray-100'
                : 'text-sm text-gray-700'
            }`}
          >
            {student}
          </li>
        ))}
      </ul>
    </div>
  );
}
