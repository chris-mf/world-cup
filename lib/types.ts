export interface Team {
  code: string;
  name: string;
  flag: string;
  confederation: string;
  fifaRanking: number;
  winProbability: number;
}

export interface Participant {
  id: string;
  name: string;
  shortName: string;
}

export interface DrawResult {
  participantId: string;
  teams: [string, string];
}

export type Round = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'third';

export interface Match {
  id: string;
  round: Round;
  matchNumber: number;
  team1Code: string | null;
  team2Code: string | null;
  score1: number | null;
  score2: number | null;
  status: 'scheduled' | 'live' | 'completed';
  date: string | null;
  venue: string | null;
}

export interface AppState {
  drawComplete: boolean;
  drawResults: DrawResult[];
  matches: Match[];
  drawTimestamp: string | null;
}

export const ROUND_LABELS: Record<Round, string> = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-Finals',
  sf: 'Semi-Finals',
  final: 'Final',
  third: 'Third Place',
};

export const ROUND_ORDER: Round[] = ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'third'];

export const POINTS_PER_ROUND: Record<Round, number> = {
  group: 1,
  r32: 1,
  r16: 2,
  qf: 4,
  sf: 8,
  third: 12,
  final: 16,
};

export const WINNER_BONUS = 16;
