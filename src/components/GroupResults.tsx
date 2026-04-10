import type { GeneratedGroup } from '../types';
import { GroupCard } from './GroupCard';

interface GroupResultsProps {
  groups: GeneratedGroup[];
  title: string;
  presentMode: boolean;
}

export function GroupResults({ groups, title, presentMode }: GroupResultsProps) {
  return (
    <div>
      {title && (
        <h2
          className={`mb-4 font-semibold ${
            presentMode
              ? 'text-2xl text-white'
              : 'text-lg text-gray-800'
          }`}
        >
          {title}
        </h2>
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
