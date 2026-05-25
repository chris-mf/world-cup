'use client';

import { Match, Round, ROUND_LABELS } from '@/lib/types';
import { getMatchesByRound } from '@/lib/bracket';
import { MatchCard } from './MatchCard';

interface BracketViewProps {
  matches: Match[];
  highlightTeams?: Set<string>;
  onMatchClick?: (match: Match) => void;
}

const BRACKET_ROUNDS: Round[] = ['r32', 'r16', 'qf', 'sf', 'final'];

export function BracketView({
  matches,
  highlightTeams,
  onMatchClick,
}: BracketViewProps) {
  const byRound = getMatchesByRound(matches);
  const thirdPlace = byRound['third']?.[0];

  return (
    <div className="space-y-8">
      {/* Main bracket - horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max px-2">
          {BRACKET_ROUNDS.map((round) => {
            const roundMatches = byRound[round] || [];
            return (
              <div key={round} className="flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3 text-center">
                  {ROUND_LABELS[round]}
                </h3>
                <div
                  className="flex flex-col justify-around flex-1 gap-2"
                  style={{
                    minHeight:
                      round === 'r32'
                        ? undefined
                        : `${(byRound['r32']?.length || 16) * 68}px`,
                  }}
                >
                  {roundMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      highlightTeams={highlightTeams}
                      compact
                      onClick={
                        onMatchClick ? () => onMatchClick(match) : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Third Place */}
      {thirdPlace && (
        <div className="border-t border-border-subtle pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
            {ROUND_LABELS.third}
          </h3>
          <MatchCard
            match={thirdPlace}
            highlightTeams={highlightTeams}
            onClick={onMatchClick ? () => onMatchClick(thirdPlace) : undefined}
          />
        </div>
      )}
    </div>
  );
}
