import type { GeneratedGroup } from '../types';
import type { QualifierConflict } from '../utils/groups';
import { GroupCard } from './GroupCard';

interface GroupResultsProps {
  groups: GeneratedGroup[];
  title: string;
  presentMode: boolean;
  conflicts?: QualifierConflict[];
}

function formatConflictsMessage(conflicts: QualifierConflict[]): string {
  const total = conflicts.reduce((acc, c) => acc + c.count, 0);
  const parts = conflicts.map((c) => {
    const clause = `'${c.qualifier}' shares a group ${c.count} ${
      c.count === 1 ? 'time' : 'times'
    }`;
    if (c.groups.length === 0) return clause;
    return `${clause} (${c.groups.join(', ')})`;
  });
  return `Generated with ${total} conflict${total === 1 ? '' : 's'}: ${parts.join(
    ', ',
  )}.`;
}

export function GroupResults({
  groups,
  title,
  presentMode,
  conflicts,
}: GroupResultsProps) {
  const showConflicts =
    !presentMode && conflicts !== undefined && conflicts.length > 0;

  return (
    <div>
      {title && (
        <h2
          className={`mb-4 font-semibold ${
            presentMode ? 'text-2xl text-white' : 'text-lg text-gray-800'
          }`}
        >
          {title}
        </h2>
      )}
      {showConflicts && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 no-print">
          {formatConflictsMessage(conflicts!)}
        </div>
      )}
      <div
        className={`grid gap-4 ${
          presentMode
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {groups.map((group, i) => (
          <GroupCard key={i} group={group} presentMode={presentMode} />
        ))}
      </div>
    </div>
  );
}
