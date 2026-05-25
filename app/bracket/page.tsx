'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppState, Match } from '@/lib/types';
import { loadState, getTeamsForParticipant } from '@/lib/store';
import { PARTICIPANTS } from '@/lib/participants';
import { BracketView } from '@/components/BracketView';
import { MatchCard } from '@/components/MatchCard';

export default function BracketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BracketPageInner />
    </Suspense>
  );
}

function BracketPageInner() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<AppState | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string>(
    searchParams.get('highlight') ?? '',
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const highlightTeams = new Set<string>();
  if (selectedParticipant && state.drawComplete) {
    const teams = getTeamsForParticipant(selectedParticipant, state.drawResults);
    if (teams) {
      highlightTeams.add(teams[0]);
      highlightTeams.add(teams[1]);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Tournament Bracket
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Round of 32 through to the Final
          </p>
        </div>

        {state.drawComplete && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted" htmlFor="participant-select">
              Highlight:
            </label>
            <select
              id="participant-select"
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="bg-surface-raised border border-border-subtle text-text-primary text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold/50"
            >
              <option value="">All Teams</option>
              {PARTICIPANTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-active/30 bg-active-bg" />
          Your teams
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gold/20" />
          Winner
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-live/50 bg-live-bg" />
          Live
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white/10" />
          Completed
        </span>
      </div>

      {/* Bracket */}
      <BracketView
        matches={state.matches}
        highlightTeams={highlightTeams}
        onMatchClick={setSelectedMatch}
      />

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-navy-light border border-border-subtle rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gold uppercase text-sm tracking-wider">
                Match Details
              </h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                &times;
              </button>
            </div>
            <MatchCard match={selectedMatch} highlightTeams={highlightTeams} />
            {selectedMatch.venue && (
              <p className="mt-3 text-xs text-text-muted">
                Venue: {selectedMatch.venue}
              </p>
            )}
            {selectedMatch.date && (
              <p className="mt-1 text-xs text-text-muted">
                {new Date(selectedMatch.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
