import { Match, Round } from './types';

export interface BracketProgression {
  matchId: string;
  slot: 'team1' | 'team2';
  sourceMatchId: string;
  sourceResult: 'winner' | 'loser';
}

interface MatchMeta {
  date: string;
  venue: string;
}

const SCHEDULE: Record<string, MatchMeta> = {
  'r32-1':  { date: '2026-06-29T18:00:00Z', venue: 'AT&T Stadium, Arlington' },
  'r32-2':  { date: '2026-06-29T21:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  'r32-3':  { date: '2026-06-29T22:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  'r32-4':  { date: '2026-06-30T00:00:00Z', venue: 'Lumen Field, Seattle' },
  'r32-5':  { date: '2026-06-30T18:00:00Z', venue: 'MetLife Stadium, New Jersey' },
  'r32-6':  { date: '2026-06-30T21:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  'r32-7':  { date: '2026-06-30T22:00:00Z', venue: 'Lincoln Financial Field, Philadelphia' },
  'r32-8':  { date: '2026-07-01T00:00:00Z', venue: 'Levi\'s Stadium, San Francisco' },
  'r32-9':  { date: '2026-07-01T18:00:00Z', venue: 'BC Place, Vancouver' },
  'r32-10': { date: '2026-07-01T21:00:00Z', venue: 'BMO Field, Toronto' },
  'r32-11': { date: '2026-07-01T22:00:00Z', venue: 'Estadio Azteca, Mexico City' },
  'r32-12': { date: '2026-07-02T00:00:00Z', venue: 'Estadio BBVA, Monterrey' },
  'r32-13': { date: '2026-07-02T18:00:00Z', venue: 'AT&T Stadium, Arlington' },
  'r32-14': { date: '2026-07-02T21:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  'r32-15': { date: '2026-07-02T22:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  'r32-16': { date: '2026-07-03T00:00:00Z', venue: 'MetLife Stadium, New Jersey' },

  'r16-1': { date: '2026-07-05T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  'r16-2': { date: '2026-07-05T00:00:00Z', venue: 'AT&T Stadium, Arlington' },
  'r16-3': { date: '2026-07-06T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  'r16-4': { date: '2026-07-06T00:00:00Z', venue: 'MetLife Stadium, New Jersey' },
  'r16-5': { date: '2026-07-07T20:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  'r16-6': { date: '2026-07-07T00:00:00Z', venue: 'Levi\'s Stadium, San Francisco' },
  'r16-7': { date: '2026-07-08T20:00:00Z', venue: 'Estadio Azteca, Mexico City' },
  'r16-8': { date: '2026-07-08T00:00:00Z', venue: 'Lumen Field, Seattle' },

  'qf-1': { date: '2026-07-09T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  'qf-2': { date: '2026-07-10T00:00:00Z', venue: 'AT&T Stadium, Arlington' },
  'qf-3': { date: '2026-07-10T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  'qf-4': { date: '2026-07-11T00:00:00Z', venue: 'MetLife Stadium, New Jersey' },

  'sf-1':  { date: '2026-07-13T20:00:00Z', venue: 'AT&T Stadium, Arlington' },
  'sf-2':  { date: '2026-07-14T20:00:00Z', venue: 'MetLife Stadium, New Jersey' },

  'third': { date: '2026-07-18T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  'final': { date: '2026-07-19T20:00:00Z', venue: 'MetLife Stadium, New Jersey' },
};

function createMatch(round: Round, num: number): Match {
  const id = round === 'final' || round === 'third' ? round : `${round}-${num}`;
  const meta = SCHEDULE[id];
  return {
    id,
    round,
    matchNumber: num,
    team1Code: null,
    team2Code: null,
    score1: null,
    score2: null,
    status: 'scheduled',
    date: meta?.date ?? null,
    venue: meta?.venue ?? null,
  };
}

export function createInitialBracket(): Match[] {
  const matches: Match[] = [];

  for (let i = 1; i <= 16; i++) matches.push(createMatch('r32', i));
  for (let i = 1; i <= 8; i++) matches.push(createMatch('r16', i));
  for (let i = 1; i <= 4; i++) matches.push(createMatch('qf', i));
  matches.push(createMatch('sf', 1));
  matches.push(createMatch('sf', 2));
  matches.push(createMatch('final', 1));
  matches.push(createMatch('third', 1));

  return matches;
}

export const PROGRESSIONS: BracketProgression[] = [
  // R32 winners → R16
  { matchId: 'r16-1', slot: 'team1', sourceMatchId: 'r32-1', sourceResult: 'winner' },
  { matchId: 'r16-1', slot: 'team2', sourceMatchId: 'r32-2', sourceResult: 'winner' },
  { matchId: 'r16-2', slot: 'team1', sourceMatchId: 'r32-3', sourceResult: 'winner' },
  { matchId: 'r16-2', slot: 'team2', sourceMatchId: 'r32-4', sourceResult: 'winner' },
  { matchId: 'r16-3', slot: 'team1', sourceMatchId: 'r32-5', sourceResult: 'winner' },
  { matchId: 'r16-3', slot: 'team2', sourceMatchId: 'r32-6', sourceResult: 'winner' },
  { matchId: 'r16-4', slot: 'team1', sourceMatchId: 'r32-7', sourceResult: 'winner' },
  { matchId: 'r16-4', slot: 'team2', sourceMatchId: 'r32-8', sourceResult: 'winner' },
  { matchId: 'r16-5', slot: 'team1', sourceMatchId: 'r32-9', sourceResult: 'winner' },
  { matchId: 'r16-5', slot: 'team2', sourceMatchId: 'r32-10', sourceResult: 'winner' },
  { matchId: 'r16-6', slot: 'team1', sourceMatchId: 'r32-11', sourceResult: 'winner' },
  { matchId: 'r16-6', slot: 'team2', sourceMatchId: 'r32-12', sourceResult: 'winner' },
  { matchId: 'r16-7', slot: 'team1', sourceMatchId: 'r32-13', sourceResult: 'winner' },
  { matchId: 'r16-7', slot: 'team2', sourceMatchId: 'r32-14', sourceResult: 'winner' },
  { matchId: 'r16-8', slot: 'team1', sourceMatchId: 'r32-15', sourceResult: 'winner' },
  { matchId: 'r16-8', slot: 'team2', sourceMatchId: 'r32-16', sourceResult: 'winner' },

  // R16 winners → QF
  { matchId: 'qf-1', slot: 'team1', sourceMatchId: 'r16-1', sourceResult: 'winner' },
  { matchId: 'qf-1', slot: 'team2', sourceMatchId: 'r16-2', sourceResult: 'winner' },
  { matchId: 'qf-2', slot: 'team1', sourceMatchId: 'r16-3', sourceResult: 'winner' },
  { matchId: 'qf-2', slot: 'team2', sourceMatchId: 'r16-4', sourceResult: 'winner' },
  { matchId: 'qf-3', slot: 'team1', sourceMatchId: 'r16-5', sourceResult: 'winner' },
  { matchId: 'qf-3', slot: 'team2', sourceMatchId: 'r16-6', sourceResult: 'winner' },
  { matchId: 'qf-4', slot: 'team1', sourceMatchId: 'r16-7', sourceResult: 'winner' },
  { matchId: 'qf-4', slot: 'team2', sourceMatchId: 'r16-8', sourceResult: 'winner' },

  // QF winners → SF
  { matchId: 'sf-1', slot: 'team1', sourceMatchId: 'qf-1', sourceResult: 'winner' },
  { matchId: 'sf-1', slot: 'team2', sourceMatchId: 'qf-2', sourceResult: 'winner' },
  { matchId: 'sf-2', slot: 'team1', sourceMatchId: 'qf-3', sourceResult: 'winner' },
  { matchId: 'sf-2', slot: 'team2', sourceMatchId: 'qf-4', sourceResult: 'winner' },

  // SF winners → Final
  { matchId: 'final', slot: 'team1', sourceMatchId: 'sf-1', sourceResult: 'winner' },
  { matchId: 'final', slot: 'team2', sourceMatchId: 'sf-2', sourceResult: 'winner' },

  // SF losers → Third Place
  { matchId: 'third', slot: 'team1', sourceMatchId: 'sf-1', sourceResult: 'loser' },
  { matchId: 'third', slot: 'team2', sourceMatchId: 'sf-2', sourceResult: 'loser' },
];

export function getMatchWinner(match: Match): string | null {
  if (match.status !== 'completed' || match.score1 === null || match.score2 === null) {
    return null;
  }
  if (match.score1 > match.score2) return match.team1Code;
  if (match.score2 > match.score1) return match.team2Code;
  return null;
}

export function getMatchLoser(match: Match): string | null {
  if (match.status !== 'completed' || match.score1 === null || match.score2 === null) {
    return null;
  }
  if (match.score1 > match.score2) return match.team2Code;
  if (match.score2 > match.score1) return match.team1Code;
  return null;
}

export function propagateResults(matches: Match[]): Match[] {
  const updated = matches.map((m) => ({ ...m }));
  const matchMap = new Map(updated.map((m) => [m.id, m]));

  for (const prog of PROGRESSIONS) {
    const source = matchMap.get(prog.sourceMatchId);
    const target = matchMap.get(prog.matchId);
    if (!source || !target) continue;

    const result =
      prog.sourceResult === 'winner' ? getMatchWinner(source) : getMatchLoser(source);

    if (result) {
      if (prog.slot === 'team1') {
        target.team1Code = result;
      } else {
        target.team2Code = result;
      }
    }
  }

  return updated;
}

export function getMatchesByRound(matches: Match[]): Record<Round, Match[]> {
  const grouped: Record<string, Match[]> = {};
  for (const match of matches) {
    if (!grouped[match.round]) {
      grouped[match.round] = [];
    }
    grouped[match.round].push(match);
  }
  return grouped as Record<Round, Match[]>;
}

export function isTeamEliminated(teamCode: string, matches: Match[]): boolean {
  for (const match of matches) {
    if (match.status !== 'completed') continue;
    if (match.round === 'group') continue;
    const loser = getMatchLoser(match);
    if (loser === teamCode) {
      if (match.round !== 'sf') return true;
      const thirdPlace = matches.find((m) => m.round === 'third');
      if (thirdPlace && thirdPlace.status === 'completed') {
        const thirdLoser = getMatchLoser(thirdPlace);
        if (thirdLoser === teamCode) return true;
      }
    }
  }
  return false;
}

export function getTeamCurrentRound(teamCode: string, matches: Match[]): Round | null {
  const rounds: Round[] = ['final', 'third', 'sf', 'qf', 'r16', 'r32', 'group'];
  for (const round of rounds) {
    const roundMatches = matches.filter((m) => m.round === round);
    for (const match of roundMatches) {
      if (match.team1Code === teamCode || match.team2Code === teamCode) {
        return round;
      }
    }
  }
  return null;
}
