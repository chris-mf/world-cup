'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppState } from '@/lib/types';
import { calculateScores } from '@/lib/scoring';
import { LeaderboardTable } from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((s: AppState) => setState(s));
  }, []);

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
        <h1 className="text-2xl font-bold text-gold mb-4">Leaderboard</h1>
        <div className="bg-surface-raised border border-border-subtle rounded-xl p-8">
          <p className="text-text-primary text-lg font-medium">
            Draw has not been executed yet
          </p>
          <p className="text-text-secondary text-sm mt-2">
            The leaderboard will be available after the draw is completed and
            matches begin.
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

  const scores = calculateScores(state.drawResults, state.matches);
  const hasAnyPoints = scores.some((s) => s.totalPoints > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          {hasAnyPoints
            ? 'Ranked by total points earned in the tournament'
            : 'Scores will update as match results are entered'}
        </p>
      </div>

      {/* Scoring Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs text-text-muted">
        <span>Group Win: 1pt</span>
        <span className="text-border-subtle">|</span>
        <span>R32 Win: 1pt</span>
        <span className="text-border-subtle">|</span>
        <span>R16 Win: 2pts</span>
        <span className="text-border-subtle">|</span>
        <span>QF Win: 4pts</span>
        <span className="text-border-subtle">|</span>
        <span>SF Win: 8pts</span>
        <span className="text-border-subtle">|</span>
        <span>3rd Place: 12pts</span>
        <span className="text-border-subtle">|</span>
        <span>Final Win: 16pts</span>
        <span className="text-border-subtle">|</span>
        <span>Champion Bonus: +16pts</span>
      </div>

      <div className="bg-surface-raised border border-border-subtle rounded-xl overflow-hidden">
        <LeaderboardTable scores={scores} />
      </div>
    </div>
  );
}
