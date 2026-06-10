import { getTeam } from '@/lib/teams';

interface TeamBadgeProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  eliminated?: boolean;
}

const SIZE_MAP = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function TeamBadge({
  code,
  size = 'md',
  showName = true,
  eliminated = false,
}: TeamBadgeProps) {
  const team = getTeam(code);
  if (!team) return null;

  return (
    <div
      className={`flex items-center gap-2 ${eliminated ? 'opacity-40' : ''}`}
    >
      <span className={SIZE_MAP[size]} role="img" aria-label={team.name}>
        {team.flag}
      </span>
      {showName && (
        <span
          className={`font-medium ${
            size === 'sm'
              ? 'text-xs'
              : size === 'lg'
                ? 'text-lg'
                : 'text-sm'
          } ${eliminated ? 'line-through text-text-muted' : ''}`}
        >
          {team.name}
          <span className="ml-1 font-normal text-text-muted">
            {team.winProbability}%
          </span>
        </span>
      )}
    </div>
  );
}

export function TeamBadgePlaceholder({
  label = 'TBD',
  size = 'md',
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex items-center gap-2 opacity-30">
      <span className={`${SIZE_MAP[size]} grayscale`}>🏳️</span>
      <span
        className={`font-medium italic text-text-muted ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
