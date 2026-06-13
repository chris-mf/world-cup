'use client';

import Link from 'next/link';
import { ParticipantScore, TeamScore } from '@/lib/scoring';
import { getParticipant } from '@/lib/participants';
import { getTeam } from '@/lib/teams';

interface LeaderboardTableProps {
  scores: ParticipantScore[];
  highlightParticipant?: string;
}

const OUTCOME_COLORS = {
  W: 'text-active',
  D: 'text-text-muted',
  L: 'text-eliminated',
};

function TeamResults({ teamScore }: { teamScore: TeamScore }) {
  const team = getTeam(teamScore.code);
  if (!team) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{team.flag}</span>
        <span className="text-xs text-text-secondary font-medium">{team.name}</span>
        <span className="text-xs font-mono text-gold font-bold ml-auto">{teamScore.points}pts</span>
      </div>
      {teamScore.results.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {teamScore.results.map((r, i) => {
            const opp = getTeam(r.opponentCode);
            return (
              <span key={i} className="text-[11px] font-mono whitespace-nowrap">
                <span className={OUTCOME_COLORS[r.outcome]}>
                  {r.outcome}
                </span>
                <span className="text-text-muted"> {r.score}</span>
                {opp && <span className="text-text-muted"> {opp.flag}</span>}
                {r.isLive && <span className="text-live ml-0.5 animate-pulse">●</span>}
              </span>
            );
          })}
        </div>
      )}
      {teamScore.results.length === 0 && (
        <span className="text-[11px] text-text-muted italic">No matches yet</span>
      )}
    </div>
  );
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
              Teams &amp; Results
            </th>
            <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-muted text-right w-20">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, i) => {
            const participant = getParticipant(score.participantId);
            const isHighlighted = score.participantId === highlightParticipant;
            const isTied =
              (i > 0 && scores[i - 1].rank === score.rank) ||
              (i < scores.length - 1 && scores[i + 1].rank === score.rank);

            const ordinal = (n: number) => {
              const s = ['th', 'st', 'nd', 'rd'];
              const v = n % 100;
              return n + (s[(v - 20) % 10] || s[v] || s[0]);
            };

            return (
              <tr
                key={score.participantId}
                className={`border-b border-border-subtle transition-colors hover:bg-white/[0.03] ${
                  isHighlighted ? 'bg-gold/5 border-gold/20' : ''
                }`}
              >
                <td className="px-3 py-3 align-top">
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-sm ${
                        score.rank === 1
                          ? 'text-gold'
                          : score.rank <= 3
                            ? 'text-text-primary'
                            : 'text-text-muted'
                      }`}
                    >
                      {ordinal(score.rank)}
                    </span>
                    {isTied && (
                      <span className="text-[10px] text-text-muted">Tied</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <Link
                    href={`/participant/${score.participantId}`}
                    className="font-medium text-sm hover:text-gold transition-colors"
                  >
                    {participant?.name ?? score.participantId}
                  </Link>
                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        score.teamsAlive === 2
                          ? 'bg-active-bg text-active'
                          : score.teamsAlive === 1
                            ? 'bg-live-bg text-live'
                            : 'bg-eliminated-bg text-eliminated'
                      }`}
                    >
                      {score.teamsAlive === 2
                        ? 'Both alive'
                        : score.teamsAlive === 1
                          ? '1 left'
                          : 'Eliminated'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-2">
                    <TeamResults teamScore={score.teamScores[0]} />
                    <TeamResults teamScore={score.teamScores[1]} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right align-top">
                  <span className="font-mono font-bold text-lg">
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
