'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppState } from '@/lib/types';
import { loadState, getTeamsForParticipant } from '@/lib/store';
import { getParticipant } from '@/lib/participants';
import { getTeam } from '@/lib/teams';
import { isTeamEliminated, getTeamCurrentRound } from '@/lib/bracket';
import { ROUND_LABELS } from '@/lib/types';
import { TeamBadge } from '@/components/TeamBadge';

export default function ParticipantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const participant = getParticipant(slug);

  if (!participant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Participant Not Found
        </h1>
        <p className="text-text-secondary mb-6">
          No participant with the ID &ldquo;{slug}&rdquo; was found.
        </p>
        <Link
          href="/"
          className="text-gold hover:text-gold-light transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.drawComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gold mb-2">{participant.name}</h1>
        <div className="mt-8 bg-surface-raised border border-border-subtle rounded-xl p-8">
          <p className="text-4xl mb-4">🎱</p>
          <p className="text-text-primary font-medium text-lg">
            Draw has not been executed yet
          </p>
          <p className="text-text-secondary text-sm mt-2">
            Check back once the draw has been completed to see your teams.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-gold hover:text-gold-light transition-colors text-sm"
          >
            Go to Draw Page
          </Link>
        </div>
      </div>
    );
  }

  const teams = getTeamsForParticipant(participant.id, state.drawResults);

  if (!teams) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-text-secondary">No teams assigned to this participant.</p>
      </div>
    );
  }

  const team1 = getTeam(teams[0]);
  const team2 = getTeam(teams[1]);
  const team1Eliminated = isTeamEliminated(teams[0], state.matches);
  const team2Eliminated = isTeamEliminated(teams[1], state.matches);
  const team1Round = getTeamCurrentRound(teams[0], state.matches);
  const team2Round = getTeamCurrentRound(teams[1], state.matches);
  const aliveCount = (team1Eliminated ? 0 : 1) + (team2Eliminated ? 0 : 1);

  const statusText =
    aliveCount === 2
      ? 'Both teams alive'
      : aliveCount === 1
        ? '1 team remaining'
        : 'Both teams eliminated';

  const statusColor =
    aliveCount === 2
      ? 'text-active'
      : aliveCount === 1
        ? 'text-live'
        : 'text-eliminated';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gold">
            {participant.name}
          </h1>
          <p className={`mt-2 font-medium ${statusColor}`}>{statusText}</p>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { team: team1, code: teams[0], eliminated: team1Eliminated, round: team1Round },
            { team: team2, code: teams[1], eliminated: team2Eliminated, round: team2Round },
          ].map(({ team, code, eliminated, round }) =>
            team ? (
              <motion.div
                key={code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`relative overflow-hidden rounded-xl border p-6 ${
                  eliminated
                    ? 'bg-surface border-eliminated/20 opacity-60'
                    : 'bg-surface-raised border-active/20'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <TeamBadge code={code} size="lg" showName={false} />
                  <div>
                    <p className={`font-bold text-lg ${eliminated ? 'line-through text-text-muted' : ''}`}>
                      {team.name}
                    </p>
                    <p className="text-text-muted text-xs">{team.confederation}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      eliminated
                        ? 'bg-eliminated-bg text-eliminated'
                        : 'bg-active-bg text-active'
                    }`}
                  >
                    {eliminated ? 'Eliminated' : 'Active'}
                  </span>
                  {round && (
                    <span className="text-xs text-text-muted">
                      {ROUND_LABELS[round]}
                    </span>
                  )}
                </div>

                {!eliminated && (
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <span className="text-[80px]">{team.flag}</span>
                  </div>
                )}
              </motion.div>
            ) : null,
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/bracket?highlight=${participant.id}`}
            className="px-5 py-2.5 bg-gold/10 text-gold border border-gold/20 rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            View Bracket
          </Link>
          <Link
            href="/leaderboard"
            className="px-5 py-2.5 bg-white/5 text-text-secondary border border-border-subtle rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            View Leaderboard
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }}
            className="px-5 py-2.5 bg-white/5 text-text-secondary border border-border-subtle rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Share Link
          </button>
        </div>
      </motion.div>
    </div>
  );
}
