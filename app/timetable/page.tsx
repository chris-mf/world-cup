'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SCHEDULE, ScheduleMatch } from '@/lib/schedule';
import { TEAMS } from '@/lib/teams';
import { PARTICIPANTS } from '@/lib/participants';
import { getParticipantForTeam } from '@/lib/store';
import { AppState } from '@/lib/types';

const TEAM_NAME_TO_CODE: Record<string, string> = {};
for (const team of TEAMS) {
  TEAM_NAME_TO_CODE[team.name] = team.code;
}
TEAM_NAME_TO_CODE['USA'] = 'US';
TEAM_NAME_TO_CODE['Turkey'] = 'TR';
TEAM_NAME_TO_CODE['Czech Republic'] = 'CZ';

function getTeamCode(name: string): string | null {
  return TEAM_NAME_TO_CODE[name] ?? null;
}

function getTeamInfo(name: string) {
  const code = getTeamCode(name);
  if (!code) return null;
  return TEAMS.find(t => t.code === code) ?? null;
}

interface Watcher {
  participantShortName: string;
  participantId: string;
  teamName: string;
  teamFlag: string;
}

function getWatchers(match: ScheduleMatch, state: AppState): Watcher[] {
  const watchers: Watcher[] = [];
  for (const teamName of [match.team1, match.team2]) {
    if (!teamName) continue;
    const code = getTeamCode(teamName);
    if (!code) continue;
    const participantId = getParticipantForTeam(code, state.drawResults);
    if (!participantId) continue;
    const participant = PARTICIPANTS.find(p => p.id === participantId);
    const teamInfo = TEAMS.find(t => t.code === code);
    if (participant && teamInfo) {
      watchers.push({
        participantShortName: participant.shortName,
        participantId: participant.id,
        teamName: teamInfo.name,
        teamFlag: teamInfo.flag,
      });
    }
  }
  return watchers;
}

function getParticipantTeamIds(state: AppState): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const result of state.drawResults) {
    const codes: string[] = [];
    for (const code of result.teams) {
      const team = TEAMS.find(t => t.code === code);
      if (team) codes.push(team.name);
    }
    map.set(result.participantId, codes);
  }
  return map;
}

function matchInvolvesParticipant(
  match: ScheduleMatch,
  participantId: string,
  participantTeams: Map<string, string[]>,
): boolean {
  const teamNames = participantTeams.get(participantId);
  if (!teamNames) return false;
  return teamNames.some(t => t === match.team1 || t === match.team2);
}

function FilterDropdown({
  filter,
  onFilterChange,
}: {
  filter: string | null;
  onFilterChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sorted = [...PARTICIPANTS].sort((a, b) =>
    a.shortName.localeCompare(b.shortName)
  );

  const filtered = search
    ? sorted.filter(p =>
        p.shortName.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : sorted;

  const selected = filter
    ? PARTICIPANTS.find(p => p.id === filter)
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-surface-raised text-sm transition-colors hover:bg-white/5"
      >
        <span className={selected ? 'text-gold' : 'text-text-secondary'}>
          {selected ? selected.shortName : 'All matches'}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-surface border border-border-subtle rounded-xl shadow-xl shadow-black/40 z-50 overflow-hidden">
          <div className="p-2 border-b border-border-subtle">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/30"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            <button
              onClick={() => { onFilterChange(null); setOpen(false); setSearch(''); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                !filter
                  ? 'text-white bg-white/5'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              All matches
            </button>
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onFilterChange(p.id); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  filter === p.id
                    ? 'text-gold bg-gold/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {p.shortName}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-text-muted">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimetablePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const participantTeams = getParticipantTeamIds(state);

  const filteredSchedule = filter
    ? SCHEDULE.filter(m => matchInvolvesParticipant(m, filter, participantTeams))
    : SCHEDULE;

  const dates = [...new Set(filteredSchedule.map(m => m.date))];
  const matchesByDate: Record<string, ScheduleMatch[]> = {};
  for (const m of filteredSchedule) {
    if (!matchesByDate[m.date]) matchesByDate[m.date] = [];
    matchesByDate[m.date].push(m);
  }

  const selectedParticipant = filter ? PARTICIPANTS.find(p => p.id === filter) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gold">
              Timetable
            </h1>
            <p className="mt-2 text-text-muted text-lg">
              {selectedParticipant
                ? `${selectedParticipant.shortName}'s matches`
                : 'All matches in Sydney time'}
            </p>
          </div>
          {state.drawComplete && (
            <FilterDropdown filter={filter} onFilterChange={setFilter} />
          )}
        </div>
      </motion.div>

      {/* Matches */}
      <div className="space-y-0">
        {dates.map(date => {
          const d = new Date(date);
          const dayLabel = d.toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          const matches = matchesByDate[date];

          return (
            <div
              key={date}
              ref={el => { dateRefs.current[date] = el; }}
              className="scroll-mt-20"
            >
              <div className="sticky top-16 z-10 bg-bg/90 backdrop-blur-sm py-3 border-b border-border-subtle mb-3">
                <h2 className="text-lg text-text-primary font-light">{dayLabel}</h2>
                <span className="text-xs text-text-muted">
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <div className="space-y-2 mb-10">
                {matches.map(match => (
                  <MatchRow key={match.matchNumber} match={match} state={state} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchedule.length === 0 && (
        <div className="text-center py-20 text-text-muted">
          No matches found.
        </div>
      )}
    </div>
  );
}

function MatchRow({ match, state }: { match: ScheduleMatch; state: AppState }) {
  const team1Info = match.team1 ? getTeamInfo(match.team1) : null;
  const team2Info = match.team2 ? getTeamInfo(match.team2) : null;
  const watchers = state.drawComplete ? getWatchers(match, state) : [];

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="sm:w-20 shrink-0">
        <span className="text-sm text-text-secondary">{match.kickoff}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <TeamLabel info={team1Info} name={match.team1} />
          <span className="text-text-muted text-xs">vs</span>
          <TeamLabel info={team2Info} name={match.team2} />
        </div>
        <div className="mt-1 text-xs text-text-muted flex items-center gap-2">
          <span>{match.stage}</span>
          <span>&middot;</span>
          <span>{match.venue}</span>
        </div>
      </div>

      {watchers.length > 0 && (
        <div className="sm:w-56 shrink-0 flex flex-col gap-1">
          {watchers.map((w, i) => (
            <span
              key={`${w.participantId}-${i}`}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gold/10 text-gold text-xs"
            >
              <span>{w.participantShortName}</span>
              <span className="text-gold/40">&middot;</span>
              <span className="text-gold/60">{w.teamFlag} {w.teamName}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamLabel({ info, name }: { info: ReturnType<typeof getTeamInfo>; name: string | null }) {
  if (!name) {
    return <span className="text-text-muted text-sm italic">TBD</span>;
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-text-primary">
      {info && <span>{info.flag}</span>}
      <span>{name}</span>
    </span>
  );
}
