'use client';

import Link from 'next/link';
import { ParticipantScore } from '@/lib/scoring';
import { getParticipant } from '@/lib/participants';
import { getTeam } from '@/lib/teams';

interface LeaderboardTableProps {
  scores: ParticipantScore[];
  highlightParticipant?: string;
}

export function LeaderboardTable({
  scores,
  highlightParticipant,
}: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle text-left">
            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-muted w-12">
              #
            </th>
            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
              Participant
            </th>
            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
              Teams
            </th>
            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-muted text-center w-20">
              Alive
            </th>
            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-muted text-right w-20">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, i) => {
            const participant = getParticipant(score.participantId);
            const team1 = getTeam(score.teams[0]);
            const team2 = getTeam(score.teams[1]);
            const isHighlighted = score.participantId === highlightParticipant;
            const isTied = i > 0 && scores[i - 1].rank === score.rank;

            return (
              <tr
                key={score.participantId}
                className={`border-b border-border-subtle transition-colors hover:bg-white/[0.03] ${
                  isHighlighted ? 'bg-gold/5 border-gold/20' : ''
                }`}
              >
                <td className="px-3 py-3">
                  <span
                    className={`font-mono font-bold text-sm ${
                      score.rank === 1
                        ? 'text-gold'
                        : score.rank <= 3
                          ? 'text-text-primary'
                          : 'text-text-muted'
                    }`}
                  >
                    {isTied ? `T${score.rank}` : score.rank}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/participant/${score.participantId}`}
                    className="font-medium text-sm hover:text-gold transition-colors"
                  >
                    {participant?.name ?? score.participantId}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {team1 && (
                      <span className="flex items-center gap-1 text-xs">
                        <span>{team1.flag}</span>
                        <span className="hidden sm:inline text-text-secondary">
                          {team1.name}
                        </span>
                        <span className="text-text-muted font-mono">
                          ({score.teamPoints[0]})
                        </span>
                      </span>
                    )}
                    {team2 && (
                      <span className="flex items-center gap-1 text-xs">
                        <span>{team2.flag}</span>
                        <span className="hidden sm:inline text-text-secondary">
                          {team2.name}
                        </span>
                        <span className="text-text-muted font-mono">
                          ({score.teamPoints[1]})
                        </span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      score.teamsAlive === 2
                        ? 'bg-active-bg text-active'
                        : score.teamsAlive === 1
                          ? 'bg-live-bg text-live'
                          : 'bg-eliminated-bg text-eliminated'
                    }`}
                  >
                    {score.teamsAlive === 2
                      ? 'Both'
                      : score.teamsAlive === 1
                        ? '1 Left'
                        : 'Out'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono font-bold text-sm">
                    {score.totalPoints}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
