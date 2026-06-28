'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppState, Match, Round, ROUND_LABELS } from '@/lib/types';
import { getTeamsForParticipant, getParticipantForTeam } from '@/lib/store';
import { getTeam } from '@/lib/teams';
import { getMatchesByRound, getMatchWinner } from '@/lib/bracket';
import { PARTICIPANTS, getParticipant } from '@/lib/participants';
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

interface GroupStanding {
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

function computeGroupStandings(matches: Match[]): Record<string, GroupStanding[]> {
  const groupMatches = matches.filter(m => m.round === 'group' && m.status === 'completed');

  const standings: Record<string, Record<string, GroupStanding>> = {};

  for (const m of groupMatches) {
    if (!m.team1Code || !m.team2Code || m.score1 === null || m.score2 === null) continue;

    const team1 = getTeam(m.team1Code);
    const team2 = getTeam(m.team2Code);
    if (!team1 || !team2) continue;

    for (const code of [m.team1Code, m.team2Code]) {
      const t = getTeam(code);
      if (!t) continue;
      const conf = t.confederation;
      if (!standings[conf]) standings[conf] = {};
      if (!standings[conf][code]) {
        standings[conf][code] = { code, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }
    }

    const s1 = standings[team1.confederation][m.team1Code];
    const s2 = standings[team2.confederation][m.team2Code];

    s1.played++; s2.played++;
    s1.gf += m.score1; s1.ga += m.score2;
    s2.gf += m.score2; s2.ga += m.score1;
    s1.gd = s1.gf - s1.ga;
    s2.gd = s2.gf - s2.ga;

    if (m.score1 > m.score2) {
      s1.won++; s1.pts += 3; s2.lost++;
    } else if (m.score2 > m.score1) {
      s2.won++; s2.pts += 3; s1.lost++;
    } else {
      s1.drawn++; s1.pts += 1; s2.drawn++; s2.pts += 1;
    }
  }

  const result: Record<string, GroupStanding[]> = {};
  for (const [group, teams] of Object.entries(standings)) {
    result[group] = Object.values(teams).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    );
  }
  return result;
}

function BracketPageInner() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<AppState | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string>(
    searchParams.get('highlight') ?? '',
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((loaded: AppState) => setState(loaded));
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

  const byRound = getMatchesByRound(state.matches);
  const r32Matches = byRound['r32'] || [];
  const hasR32Teams = r32Matches.some(m => m.team1Code || m.team2Code);

  const groupMatches = state.matches.filter(m => m.round === 'group');
  const completedGroupMatches = groupMatches.filter(m => m.status === 'completed');
  const totalGroupMatches = groupMatches.length;
  const groupProgress = totalGroupMatches > 0 ? Math.round((completedGroupMatches.length / totalGroupMatches) * 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Tournament Bracket
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {hasR32Teams
              ? 'Round of 32 through to the Final'
              : `Group stage: ${completedGroupMatches.length}/${totalGroupMatches} matches played`}
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

      {/* Group Stage Progress */}
      {!hasR32Teams && totalGroupMatches > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${groupProgress}%` }}
              />
            </div>
            <span className="text-xs text-text-muted font-mono">{groupProgress}%</span>
          </div>
          <p className="text-xs text-text-muted">
            R32 matchups will appear once group stage is complete
          </p>
        </div>
      )}

      {/* Knockout Bracket */}
      {hasR32Teams && (
        <>
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
          </div>

          <BracketView
            matches={state.matches}
            highlightTeams={highlightTeams}
            drawResults={state.drawResults}
            onMatchClick={setSelectedMatch}
          />
        </>
      )}

      {/* R32 Matchups List (when teams are known but shown in a simpler format too) */}
      {hasR32Teams && (
        <div className="mt-12 border-t border-border-subtle pt-8">
          <h2 className="text-sm font-normal uppercase tracking-wider text-text-muted mb-4">
            Round of 32 Matchups
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {r32Matches.map((match) => {
              const team1 = match.team1Code ? getTeam(match.team1Code) : null;
              const team2 = match.team2Code ? getTeam(match.team2Code) : null;
              const winner = getMatchWinner(match);
              const owner1 = match.team1Code ? getParticipantForTeam(match.team1Code, state.drawResults) : null;
              const owner2 = match.team2Code ? getParticipantForTeam(match.team2Code, state.drawResults) : null;
              const p1 = owner1 ? getParticipant(owner1) : null;
              const p2 = owner2 ? getParticipant(owner2) : null;
              return (
                <div
                  key={match.id}
                  className={`bg-surface-raised border rounded-lg p-3 cursor-pointer hover:border-gold/40 transition-colors ${
                    match.status === 'live'
                      ? 'border-live/50 animate-pulse-gold'
                      : 'border-border-subtle'
                  }`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {match.date
                        ? new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : 'TBD'}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      match.status === 'completed'
                        ? 'bg-white/10 text-text-secondary'
                        : match.status === 'live'
                          ? 'bg-live/20 text-live'
                          : 'bg-white/5 text-text-muted'
                    }`}>
                      {match.status === 'completed' ? 'FT' : match.status === 'live' ? 'LIVE' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className={`flex items-center justify-between ${winner === match.team1Code ? 'text-gold font-bold' : ''}`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm">{team1?.flag ?? '🏳️'}</span>
                        <div className="min-w-0">
                          <span className={`text-sm block truncate ${highlightTeams.has(match.team1Code ?? '') ? 'text-active' : ''}`}>{team1?.name ?? 'TBD'}</span>
                          {p1 && <span className="text-[10px] text-text-muted block truncate">{p1.shortName}</span>}
                        </div>
                      </div>
                      {match.score1 !== null && <span className="font-mono text-sm">{match.score1}</span>}
                    </div>
                    <div className="border-t border-border-subtle" />
                    <div className={`flex items-center justify-between ${winner === match.team2Code ? 'text-gold font-bold' : ''}`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm">{team2?.flag ?? '🏳️'}</span>
                        <div className="min-w-0">
                          <span className={`text-sm block truncate ${highlightTeams.has(match.team2Code ?? '') ? 'text-active' : ''}`}>{team2?.name ?? 'TBD'}</span>
                          {p2 && <span className="text-[10px] text-text-muted block truncate">{p2.shortName}</span>}
                        </div>
                      </div>
                      {match.score2 !== null && <span className="font-mono text-sm">{match.score2}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teams Still in Tournament */}
      <TeamsInTournament state={state} highlightTeams={highlightTeams} />

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-surface border border-border-subtle rounded-xl p-6 max-w-sm w-full"
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
            <MatchCard match={selectedMatch} highlightTeams={highlightTeams} drawResults={state.drawResults} />
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

function TeamsInTournament({ state, highlightTeams }: { state: AppState; highlightTeams: Set<string> }) {
  const knockoutMatches = state.matches.filter(m => m.round !== 'group');
  const eliminatedInKnockout = new Set<string>();

  for (const m of knockoutMatches) {
    if (m.status !== 'completed') continue;
    if (m.score1 === null || m.score2 === null) continue;
    const loserCode = m.score1 > m.score2 ? m.team2Code : m.team1Code;
    if (loserCode && m.round !== 'sf') {
      eliminatedInKnockout.add(loserCode);
    }
  }

  const byRound = getMatchesByRound(state.matches);
  const r32Matches = byRound['r32'] || [];
  const hasR32Teams = r32Matches.some(m => m.team1Code || m.team2Code);

  const teamsInR32 = new Set<string>();
  for (const m of r32Matches) {
    if (m.team1Code) teamsInR32.add(m.team1Code);
    if (m.team2Code) teamsInR32.add(m.team2Code);
  }

  const allTeamsInTournament = new Set<string>();
  if (hasR32Teams) {
    for (const code of teamsInR32) {
      if (!eliminatedInKnockout.has(code)) {
        allTeamsInTournament.add(code);
      }
    }
  } else {
    for (const m of state.matches) {
      if (m.team1Code) allTeamsInTournament.add(m.team1Code);
      if (m.team2Code) allTeamsInTournament.add(m.team2Code);
    }
  }

  const teamsArray = Array.from(allTeamsInTournament)
    .map(code => getTeam(code))
    .filter(Boolean)
    .sort((a, b) => a!.fifaRanking - b!.fifaRanking);

  const participantForTeam = (code: string) => {
    const dr = state.drawResults.find(r => r.teams[0] === code || r.teams[1] === code);
    if (!dr) return null;
    return PARTICIPANTS.find(p => p.id === dr.participantId) ?? null;
  };

  return (
    <div className="mt-12 border-t border-border-subtle pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-normal uppercase tracking-wider text-text-muted">
          {hasR32Teams ? 'Teams Still in the Tournament' : 'All 48 Teams'}
        </h2>
        <span className="text-xs text-text-muted font-mono">
          {teamsArray.length} teams
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {teamsArray.map((team) => {
          if (!team) return null;
          const participant = participantForTeam(team.code);
          const isHighlighted = highlightTeams.has(team.code);
          return (
            <div
              key={team.code}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                isHighlighted
                  ? 'border-active/30 bg-active-bg'
                  : 'border-border-subtle bg-surface-raised'
              }`}
            >
              <span className="text-lg">{team.flag}</span>
              <div className="min-w-0">
                <p className={`text-sm truncate ${isHighlighted ? 'text-active font-medium' : 'text-text-primary'}`}>
                  {team.name}
                </p>
                {participant && (
                  <p className="text-[10px] text-text-muted truncate">{participant.shortName}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
