'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppState } from '@/lib/types';
import { PARTICIPANTS } from '@/lib/participants';
import { getTeamsForParticipant } from '@/lib/store';
import { isTeamEliminated } from '@/lib/bracket';
import { ParticipantCard } from '@/components/ParticipantCard';

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((loaded: AppState) => setState(loaded));
  }, []);

  const eliminatedTeams = new Set<string>();
  if (state) {
    for (const match of state.matches) {
      if (match.status === 'completed' && match.team1Code && match.team2Code) {
        if (match.score1 !== null && match.score2 !== null) {
          const loserCode =
            match.score1 > match.score2 ? match.team2Code : match.team1Code;
          if (isTeamEliminated(loserCode, state.matches)) {
            eliminatedTeams.add(loserCode);
          }
        }
      }
    }
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          World Cup 2026 Sweepstake
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Draw completed{' '}
          {state.drawTimestamp &&
            new Date(state.drawTimestamp).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/bracket"
            className="px-4 py-2 bg-white/[0.04] text-text-secondary border border-border-subtle rounded-lg text-sm font-medium hover:bg-white/[0.07] hover:text-text-primary transition-colors"
          >
            Bracket
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {PARTICIPANTS.map((participant, index) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            teams={getTeamsForParticipant(participant.id, state.drawResults)}
            index={index}
            revealed={true}
            eliminatedTeams={eliminatedTeams}
          />
        ))}
      </div>

      {/* Scoring Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-14 border-t border-border-subtle pt-8"
      >
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
          Scoring System
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { round: 'Group Win', pts: 1 },
            { round: 'R32 Win', pts: 1 },
            { round: 'R16 Win', pts: 2 },
            { round: 'QF Win', pts: 4 },
            { round: 'SF Win', pts: 8 },
            { round: 'Final Win', pts: 16 },
            { round: 'Champion Bonus', pts: 16 },
          ].map(({ round, pts }) => (
            <div
              key={round}
              className="bg-surface-raised border border-border-subtle rounded-lg p-3 text-center"
            >
              <p className="text-gold font-mono font-medium text-lg">{pts} pts</p>
              <p className="text-text-muted text-xs mt-1">{round}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
