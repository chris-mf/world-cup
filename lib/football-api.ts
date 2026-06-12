import { Match, Round } from './types';

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? '';

// Map Football-Data.org TLA codes to our internal team codes
const TLA_TO_CODE: Record<string, string> = {
  ARG: 'AR',
  BRA: 'BR',
  URY: 'UY',
  COL: 'CO',
  ECU: 'EC',
  PAR: 'PY',
  USA: 'US',
  CAN: 'CA',
  MEX: 'MX',
  PAN: 'PA',
  HAI: 'HT',
  CUW: 'CW',
  GER: 'DE',
  ESP: 'ES',
  FRA: 'FR',
  ENG: 'ENG',
  POR: 'PT',
  NED: 'NL',
  BEL: 'BE',
  CRO: 'HR',
  SUI: 'CH',
  AUT: 'AT',
  TUR: 'TR',
  SCO: 'SCT',
  CZE: 'CZ',
  BIH: 'BA',
  SWE: 'SE',
  NOR: 'NO',
  MAR: 'MA',
  SEN: 'SN',
  EGY: 'EG',
  CIV: 'CI',
  RSA: 'ZA',
  TUN: 'TN',
  ALG: 'DZ',
  CPV: 'CV',
  COD: 'CD',
  GHA: 'GH',
  JPN: 'JP',
  KOR: 'KR',
  AUS: 'AU',
  KSA: 'SA',
  IRN: 'IR',
  IRQ: 'IQ',
  QAT: 'QA',
  UZB: 'UZ',
  JOR: 'JO',
  NZL: 'NZ',
};

// Map Football-Data.org stage names to our Round type
const STAGE_TO_ROUND: Record<string, Round> = {
  GROUP_STAGE: 'group',
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  THIRD_PLACE: 'third',
  FINAL: 'final',
};

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number;
  homeTeam: { tla: string | null; name: string };
  awayTeam: { tla: string | null; name: string };
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
    regularTime?: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
  };
}

function mapStatus(apiStatus: string): 'scheduled' | 'live' | 'completed' {
  switch (apiStatus) {
    case 'FINISHED':
      return 'completed';
    case 'IN_PLAY':
    case 'PAUSED':
    case 'EXTRA_TIME':
    case 'PENALTY_SHOOTOUT':
      return 'live';
    default:
      return 'scheduled';
  }
}

function getWinnerCode(match: ApiMatch): string | null {
  if (match.score.winner === 'HOME_TEAM' && match.homeTeam.tla) {
    return TLA_TO_CODE[match.homeTeam.tla] ?? null;
  }
  if (match.score.winner === 'AWAY_TEAM' && match.awayTeam.tla) {
    return TLA_TO_CODE[match.awayTeam.tla] ?? null;
  }
  return null;
}

// In-memory cache (survives within a single serverless invocation)
let cachedMatches: Match[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

export async function fetchLiveMatches(): Promise<Match[]> {
  const now = Date.now();
  if (cachedMatches && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedMatches;
  }

  if (!API_KEY) {
    return [];
  }

  try {
    const res = await fetch(
      `${API_BASE}/competitions/WC/matches?season=2026`,
      {
        headers: { 'X-Auth-Token': API_KEY },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      console.error(`Football API error: ${res.status}`);
      return cachedMatches ?? [];
    }

    const data = await res.json();
    const apiMatches: ApiMatch[] = data.matches ?? [];

    const matches: Match[] = [];
    let matchNumber = 1;

    for (const m of apiMatches) {
      const round = STAGE_TO_ROUND[m.stage] ?? null;
      if (!round) continue;

      const homeCode = m.homeTeam.tla ? (TLA_TO_CODE[m.homeTeam.tla] ?? null) : null;
      const awayCode = m.awayTeam.tla ? (TLA_TO_CODE[m.awayTeam.tla] ?? null) : null;
      const status = mapStatus(m.status);

      let homeScore = m.score.fullTime.home;
      let awayScore = m.score.fullTime.away;

      // In knockout rounds, if it went to penalties the fullTime score is a
      // draw. Bump the winner by +1 so our getMatchWinner logic works.
      if (
        status === 'completed' &&
        round !== 'group' &&
        homeScore !== null &&
        awayScore !== null &&
        homeScore === awayScore &&
        m.score.winner
      ) {
        if (m.score.winner === 'HOME_TEAM') {
          homeScore += 1;
        } else if (m.score.winner === 'AWAY_TEAM') {
          awayScore += 1;
        }
      }

      matches.push({
        id: `api-${m.id}`,
        round,
        matchNumber: matchNumber++,
        team1Code: homeCode,
        team2Code: awayCode,
        score1: homeScore,
        score2: awayScore,
        status,
        date: m.utcDate,
        venue: null,
      });
    }

    cachedMatches = matches;
    cacheTimestamp = now;
    return matches;
  } catch (err) {
    console.error('Failed to fetch live matches:', err);
    return cachedMatches ?? [];
  }
}
