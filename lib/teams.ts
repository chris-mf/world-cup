import { Team } from './types';

export const TEAMS: Team[] = [
  // CONCACAF
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', confederation: 'CONCACAF', fifaRanking: 16 },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', confederation: 'CONCACAF', fifaRanking: 33 },
  { code: 'MX', name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}', confederation: 'CONCACAF', fifaRanking: 17 },
  { code: 'PA', name: 'Panama', flag: '\u{1F1F5}\u{1F1E6}', confederation: 'CONCACAF', fifaRanking: 40 },
  { code: 'JM', name: 'Jamaica', flag: '\u{1F1EF}\u{1F1F2}', confederation: 'CONCACAF', fifaRanking: 43 },
  { code: 'HN', name: 'Honduras', flag: '\u{1F1ED}\u{1F1F3}', confederation: 'CONCACAF', fifaRanking: 48 },

  // CONMEBOL
  { code: 'AR', name: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}', confederation: 'CONMEBOL', fifaRanking: 1 },
  { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', confederation: 'CONMEBOL', fifaRanking: 5 },
  { code: 'UY', name: 'Uruguay', flag: '\u{1F1FA}\u{1F1FE}', confederation: 'CONMEBOL', fifaRanking: 14 },
  { code: 'CO', name: 'Colombia', flag: '\u{1F1E8}\u{1F1F4}', confederation: 'CONMEBOL', fifaRanking: 9 },
  { code: 'EC', name: 'Ecuador', flag: '\u{1F1EA}\u{1F1E8}', confederation: 'CONMEBOL', fifaRanking: 27 },
  { code: 'PY', name: 'Paraguay', flag: '\u{1F1F5}\u{1F1FE}', confederation: 'CONMEBOL', fifaRanking: 37 },
  { code: 'VE', name: 'Venezuela', flag: '\u{1F1FB}\u{1F1EA}', confederation: 'CONMEBOL', fifaRanking: 38 },

  // UEFA
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 11 },
  { code: 'ES', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', confederation: 'UEFA', fifaRanking: 3 },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 2 },
  { code: 'ENG', name: 'England', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', confederation: 'UEFA', fifaRanking: 4 },
  { code: 'PT', name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 8 },
  { code: 'NL', name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', confederation: 'UEFA', fifaRanking: 7 },
  { code: 'BE', name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 6 },
  { code: 'IT', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 10 },
  { code: 'HR', name: 'Croatia', flag: '\u{1F1ED}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 12 },
  { code: 'CH', name: 'Switzerland', flag: '\u{1F1E8}\u{1F1ED}', confederation: 'UEFA', fifaRanking: 18 },
  { code: 'DK', name: 'Denmark', flag: '\u{1F1E9}\u{1F1F0}', confederation: 'UEFA', fifaRanking: 19 },
  { code: 'AT', name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 22 },
  { code: 'RS', name: 'Serbia', flag: '\u{1F1F7}\u{1F1F8}', confederation: 'UEFA', fifaRanking: 24 },
  { code: 'TR', name: 'Turkey', flag: '\u{1F1F9}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 21 },
  { code: 'HU', name: 'Hungary', flag: '\u{1F1ED}\u{1F1FA}', confederation: 'UEFA', fifaRanking: 28 },
  { code: 'SCT', name: 'Scotland', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', confederation: 'UEFA', fifaRanking: 31 },

  // CAF
  { code: 'MA', name: 'Morocco', flag: '\u{1F1F2}\u{1F1E6}', confederation: 'CAF', fifaRanking: 13 },
  { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', confederation: 'CAF', fifaRanking: 23 },
  { code: 'NG', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', confederation: 'CAF', fifaRanking: 29 },
  { code: 'CM', name: 'Cameroon', flag: '\u{1F1E8}\u{1F1F2}', confederation: 'CAF', fifaRanking: 32 },
  { code: 'EG', name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}', confederation: 'CAF', fifaRanking: 30 },
  { code: 'CI', name: 'Ivory Coast', flag: '\u{1F1E8}\u{1F1EE}', confederation: 'CAF', fifaRanking: 39 },
  { code: 'ZA', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', confederation: 'CAF', fifaRanking: 36 },
  { code: 'ML', name: 'Mali', flag: '\u{1F1F2}\u{1F1F1}', confederation: 'CAF', fifaRanking: 42 },
  { code: 'TN', name: 'Tunisia', flag: '\u{1F1F9}\u{1F1F3}', confederation: 'CAF', fifaRanking: 35 },

  // AFC
  { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', confederation: 'AFC', fifaRanking: 15 },
  { code: 'KR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', confederation: 'AFC', fifaRanking: 20 },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', confederation: 'AFC', fifaRanking: 25 },
  { code: 'SA', name: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', confederation: 'AFC', fifaRanking: 34 },
  { code: 'IR', name: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', confederation: 'AFC', fifaRanking: 26 },
  { code: 'IQ', name: 'Iraq', flag: '\u{1F1EE}\u{1F1F6}', confederation: 'AFC', fifaRanking: 41 },
  { code: 'QA', name: 'Qatar', flag: '\u{1F1F6}\u{1F1E6}', confederation: 'AFC', fifaRanking: 44 },
  { code: 'UZ', name: 'Uzbekistan', flag: '\u{1F1FA}\u{1F1FF}', confederation: 'AFC', fifaRanking: 45 },
  { code: 'JO', name: 'Jordan', flag: '\u{1F1EF}\u{1F1F4}', confederation: 'AFC', fifaRanking: 47 },

  // OFC
  { code: 'NZ', name: 'New Zealand', flag: '\u{1F1F3}\u{1F1FF}', confederation: 'OFC', fifaRanking: 46 },
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
