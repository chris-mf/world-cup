import { Team } from './types';

export const TEAMS: Team[] = [
  // CONCACAF
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', confederation: 'CONCACAF', fifaRanking: 16, winProbability: 1 },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', confederation: 'CONCACAF', fifaRanking: 29, winProbability: 0 },
  { code: 'MX', name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}', confederation: 'CONCACAF', fifaRanking: 15, winProbability: 1 },
  { code: 'PA', name: 'Panama', flag: '\u{1F1F5}\u{1F1E6}', confederation: 'CONCACAF', fifaRanking: 33, winProbability: 0 },
  { code: 'HT', name: 'Haiti', flag: '\u{1F1ED}\u{1F1F9}', confederation: 'CONCACAF', fifaRanking: 55, winProbability: 0 },
  { code: 'CW', name: 'Curacao', flag: '\u{1F1E8}\u{1F1FC}', confederation: 'CONCACAF', fifaRanking: 78, winProbability: 0 },

  // CONMEBOL
  { code: 'AR', name: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}', confederation: 'CONMEBOL', fifaRanking: 3, winProbability: 9 },
  { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', confederation: 'CONMEBOL', fifaRanking: 6, winProbability: 9 },
  { code: 'UY', name: 'Uruguay', flag: '\u{1F1FA}\u{1F1FE}', confederation: 'CONMEBOL', fifaRanking: 17, winProbability: 1 },
  { code: 'CO', name: 'Colombia', flag: '\u{1F1E8}\u{1F1F4}', confederation: 'CONMEBOL', fifaRanking: 13, winProbability: 2 },
  { code: 'EC', name: 'Ecuador', flag: '\u{1F1EA}\u{1F1E8}', confederation: 'CONMEBOL', fifaRanking: 23, winProbability: 1 },
  { code: 'PY', name: 'Paraguay', flag: '\u{1F1F5}\u{1F1FE}', confederation: 'CONMEBOL', fifaRanking: 40, winProbability: 0 },

  // UEFA
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 10, winProbability: 5 },
  { code: 'ES', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', confederation: 'UEFA', fifaRanking: 2, winProbability: 16 },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 1, winProbability: 16 },
  { code: 'ENG', name: 'England', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', confederation: 'UEFA', fifaRanking: 4, winProbability: 11 },
  { code: 'PT', name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 5, winProbability: 10 },
  { code: 'NL', name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', confederation: 'UEFA', fifaRanking: 7, winProbability: 4 },
  { code: 'BE', name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 9, winProbability: 2 },
  { code: 'HR', name: 'Croatia', flag: '\u{1F1ED}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 11, winProbability: 1 },
  { code: 'CH', name: 'Switzerland', flag: '\u{1F1E8}\u{1F1ED}', confederation: 'UEFA', fifaRanking: 19, winProbability: 1 },
  { code: 'AT', name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 24, winProbability: 1 },
  { code: 'TR', name: 'Türkiye', flag: '\u{1F1F9}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 25, winProbability: 1 },
  { code: 'SCT', name: 'Scotland', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', confederation: 'UEFA', fifaRanking: 38, winProbability: 0 },
  { code: 'CZ', name: 'Czechia', flag: '\u{1F1E8}\u{1F1FF}', confederation: 'UEFA', fifaRanking: 43, winProbability: 0 },
  { code: 'BA', name: 'Bosnia & Herzegovina', flag: '\u{1F1E7}\u{1F1E6}', confederation: 'UEFA', fifaRanking: 54, winProbability: 0 },
  { code: 'SE', name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 42, winProbability: 0 },
  { code: 'NO', name: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', confederation: 'UEFA', fifaRanking: 32, winProbability: 3 },

  // CAF
  { code: 'MA', name: 'Morocco', flag: '\u{1F1F2}\u{1F1E6}', confederation: 'CAF', fifaRanking: 8, winProbability: 2 },
  { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', confederation: 'CAF', fifaRanking: 14, winProbability: 1 },
  { code: 'EG', name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}', confederation: 'CAF', fifaRanking: 31, winProbability: 0 },
  { code: 'CI', name: 'Ivory Coast', flag: '\u{1F1E8}\u{1F1EE}', confederation: 'CAF', fifaRanking: 37, winProbability: 1 },
  { code: 'ZA', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', confederation: 'CAF', fifaRanking: 56, winProbability: 0 },
  { code: 'TN', name: 'Tunisia', flag: '\u{1F1F9}\u{1F1F3}', confederation: 'CAF', fifaRanking: 47, winProbability: 0 },
  { code: 'DZ', name: 'Algeria', flag: '\u{1F1E9}\u{1F1FF}', confederation: 'CAF', fifaRanking: 28, winProbability: 0 },
  { code: 'CV', name: 'Cape Verde', flag: '\u{1F1E8}\u{1F1FB}', confederation: 'CAF', fifaRanking: 60, winProbability: 0 },
  { code: 'CD', name: 'DR Congo', flag: '\u{1F1E8}\u{1F1E9}', confederation: 'CAF', fifaRanking: 48, winProbability: 0 },
  { code: 'GH', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', confederation: 'CAF', fifaRanking: 57, winProbability: 0 },

  // AFC
  { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', confederation: 'AFC', fifaRanking: 18, winProbability: 2 },
  { code: 'KR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', confederation: 'AFC', fifaRanking: 22, winProbability: 0 },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', confederation: 'AFC', fifaRanking: 27, winProbability: 0 },
  { code: 'SA', name: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', confederation: 'AFC', fifaRanking: 58, winProbability: 0 },
  { code: 'IR', name: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', confederation: 'AFC', fifaRanking: 21, winProbability: 0 },
  { code: 'IQ', name: 'Iraq', flag: '\u{1F1EE}\u{1F1F6}', confederation: 'AFC', fifaRanking: 59, winProbability: 0 },
  { code: 'QA', name: 'Qatar', flag: '\u{1F1F6}\u{1F1E6}', confederation: 'AFC', fifaRanking: 61, winProbability: 0 },
  { code: 'UZ', name: 'Uzbekistan', flag: '\u{1F1FA}\u{1F1FF}', confederation: 'AFC', fifaRanking: 52, winProbability: 0 },
  { code: 'JO', name: 'Jordan', flag: '\u{1F1EF}\u{1F1F4}', confederation: 'AFC', fifaRanking: 62, winProbability: 0 },

  // OFC
  { code: 'NZ', name: 'New Zealand', flag: '\u{1F1F3}\u{1F1FF}', confederation: 'OFC', fifaRanking: 63, winProbability: 0 },
];

export function getTeam(code: string): Team | undefined {
  return TEAMS.find((t) => t.code === code);
}

export function getTeamsByConfederation(): Record<string, Team[]> {
  const grouped: Record<string, Team[]> = {};
  for (const team of TEAMS) {
    if (!grouped[team.confederation]) {
      grouped[team.confederation] = [];
    }
    grouped[team.confederation].push(team);
  }
  return grouped;
}
