'use client';

import { Match, DrawResult, ROUND_LABELS } from '@/lib/types';
import { getTeam } from '@/lib/teams';
import { getMatchWinner } from '@/lib/bracket';
import { getParticipantForTeam } from '@/lib/store';
import { getParticipant } from '@/lib/participants';

interface MatchCardProps {
  match: Match;
  highlightTeams?: Set<string>;
  drawResults?: DrawResult[];
  compact?: boolean;
  onClick?: () => void;
}

function TeamRow({
  code,
  score,
  isWinner,
  isHighlighted,
  compact,
  ownerName,
}: {
  code: string | null;
  score: number | null;
  isWinner: boolean;
  isHighlighted: boolean;
  compact: boolean;
  ownerName: string | null;
}) {
  const team = code ? getTeam(code) : null;

  return (
    <div
      className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded ${
        isHighlighted
          ? 'bg-active-bg border border-active/30'
          : isWinner
            ? 'bg-gold/5'
            : ''
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={compact ? 'text-sm' : 'text-base'}>
          {team ? team.flag : '🏳️'}
        </span>
        <div className="min-w-0">
          <span
            className={`truncate block ${compact ? 'text-xs' : 'text-sm'} ${
              isWinner ? 'font-bold text-gold' : team ? '' : 'text-text-muted italic'
            }`}
          >
            {team ? team.name : 'TBD'}
          </span>
          {ownerName && (
            <span className="block text-[9px] text-text-muted truncate leading-tight">
              {ownerName}
            </span>
          )}
        </div>
      </div>
      {score !== null && (
        <span
          className={`font-mono font-bold ${compact ? 'text-xs' : 'text-sm'} ${
            isWinner ? 'text-gold' : 'text-text-secondary'
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function getOwnerName(code: string | null, drawResults?: DrawResult[]): string | null {
  if (!code || !drawResults) return null;
  const participantId = getParticipantForTeam(code, drawResults);
  if (!participantId) return null;
  const p = getParticipant(participantId);
  return p?.shortName ?? null;
}

export function MatchCard({
  match,
  highlightTeams,
  drawResults,
  compact = false,
  onClick,
}: MatchCardProps) {
  const winner = getMatchWinner(match);
  const isHighlight1 = highlightTeams?.has(match.team1Code ?? '') ?? false;
  const isHighlight2 = highlightTeams?.has(match.team2Code ?? '') ?? false;
  const hasHighlight = isHighlight1 || isHighlight2;

  const roundLabel = ROUND_LABELS[match.round] ?? match.round;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border transition-all ${
        match.status === 'live'
          ? 'border-live/50 bg-live-bg animate-pulse-gold'
          : hasHighlight
            ? 'border-active/30 bg-surface-raised'
            : 'border-border-subtle bg-surface-raised'
      } ${onClick ? 'cursor-pointer hover:border-gold/40' : ''} ${
        compact ? 'w-[200px]' : 'w-[240px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border-subtle">
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
          {roundLabel}
        </span>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            match.status === 'completed'
              ? 'bg-white/10 text-text-secondary'
              : match.status === 'live'
                ? 'bg-live/20 text-live'
                : 'bg-white/5 text-text-muted'
          }`}
        >
          {match.status === 'completed'
            ? 'FT'
            : match.status === 'live'
              ? 'LIVE'
              : match.date
                ? new Date(match.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })
                : '—'}
        </span>
      </div>

      {/* Teams */}
      <div className="p-1 space-y-0.5">
        <TeamRow
          code={match.team1Code}
          score={match.score1}
          isWinner={winner === match.team1Code}
          isHighlighted={isHighlight1}
          compact={compact}
          ownerName={getOwnerName(match.team1Code, drawResults)}
        />
        <TeamRow
          code={match.team2Code}
          score={match.score2}
          isWinner={winner === match.team2Code}
          isHighlighted={isHighlight2}
          compact={compact}
          ownerName={getOwnerName(match.team2Code, drawResults)}
        />
      </div>
    </div>
  );
}
