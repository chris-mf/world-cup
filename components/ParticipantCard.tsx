'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Participant } from '@/lib/types';
import { TeamBadge } from './TeamBadge';

interface ParticipantCardProps {
  participant: Participant;
  teams: [string, string] | null;
  index: number;
  revealed: boolean;
  eliminatedTeams?: Set<string>;
}

export function ParticipantCard({
  participant,
  teams,
  index,
  revealed,
  eliminatedTeams,
}: ParticipantCardProps) {
  const hasTeams = teams !== null && revealed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: revealed ? index * 0.08 : 0, duration: 0.4 }}
    >
      <Link
        href={`/participant/${participant.id}`}
        className="block group"
      >
        <div className="bg-surface-raised border border-border-subtle rounded-xl p-4 transition-all duration-200 hover:border-gold/30 hover:bg-navy-lighter hover:scale-[1.02]">
          <p className="font-semibold text-sm mb-3 text-text-primary group-hover:text-gold transition-colors truncate">
            {participant.name}
          </p>

          {hasTeams ? (
            <div className="space-y-2">
              {teams.map((code) => (
                <TeamBadge
                  key={code}
                  code={code}
                  size="sm"
                  eliminated={eliminatedTeams?.has(code)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-6 rounded bg-white/5 shimmer" />
              <div className="h-6 rounded bg-white/5 shimmer" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
