import { Team } from './types';

export const TEAMS: Team[] = [
  // CONCACAF
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', confederation: 'CONCACAF', fifaRanking: 16 },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', confederation: 'CONCACAF', fifaRanking: 29 },
  { code: 'MX', name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}', confederation: 'CONCACAF', fifaRanking: 15 },
  { code: 'PA', name: 'Panama', flag: '\u{1F1F5}\u{1F1E6}', confederation: 'CONCACAF', fifaRanking: 33 },
  { code: 'HT', name: 'Haiti', flag: '\u{1F1ED}\u{1F1F9}', confederation: 'CONCACAF', fifaRanking: 55 },
  { code: 'CW', name: 'Curacao', flag: '\u{1F1E8}\u{1F1FC}', confederation: 'CONCACAF', fifaRanking: 78 },

  // CONMEBOL
  { code: 'AR', name: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}', confederation: 'CONMEBOL', fifaRanking: 3 },
  { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', confederation: 'CONMEBOL', fifaRanking: 6 },
  { code: 'UY', name: 'Uruguay', flag: '\u{1F1FA}\u{1F1FE}', confederation: 'CONMEBOL', fifaRanking: 17 },
  { code: 'CO', name: 'Colombia', flag: '\u{1F1E8}\u{1F1F4}', confederation: 'CONMEBOL', fifaRanking: 13 },
  { code: 'EC', name: 'Ecuador', flag: '\u{1F1EA}\u{1F1E8}', confederation: 'CONMEBOL', fifaRanking: 23 },
  { code: 'PY', name: 'Paraguay', flag: '\u{1F1F5}\u{1F1FE}', confederation: 'CONMEBOL', fifaRanking: 40 },

  // UEFA
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 10 },
  { code: 'ES', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', confederation: 'UEFA', fifaRanking: 2 },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 1 },
  { code: 'ENG', name: 'England', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', confederation: 'UEFA', fifaRanking: 4 },
  { code: 'PT', name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 5 },
  { code: 'NL', name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', confederation: 'UEFA', fifaRanking: 7 },
  { code: 'BE', name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 9 },
  { code: 'HR', name: 'Croatia', flag: '\u{1F1ED}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 11 },
  { code: 'CH', name: 'Switzerland', flag: '\u{1F1E8}\u{1F1ED}', confederation: 'UEFA', fifaRanking: 19 },
  { code: 'AT', name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}', confederation: 'UEFA', fifaRanking: 24 },
  { code: 'TR', name: 'Türkiye', flag: '\u{1F1F9}\u{1F1F7}', confederation: 'UEFA', fifaRanking: 25 },
  { code: 'SCT', name: 'Scotland', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', confederation: 'UEFA', fifaRanking: 38 },
  { code: 'CZ', name: 'Czechia', flag: '\u{1F1E8}\u{1F1FF}', confederation: 'UEFA', fifaRanking: 43 },
  { code: 'BA', name: 'Bosnia & Herzegovina', flag: '\u{1F1E7}\u{1F1E6}', confederation: 'UEFA', fifaRanking: 54 },
  { code: 'SE', name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}', confederation: 'UEFA', fifaRanking: 42 },
  { code: 'NO', name: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', confederation: 'UEFA', fifaRanking: 32 },

  // CAF
  { code: 'MA', name: 'Morocco', flag: '\u{1F1F2}\u{1F1E6}', confederation: 'CAF', fifaRanking: 8 },
  { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', confederation: 'CAF', fifaRanking: 14 },
  { code: 'EG', name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}', confederation: 'CAF', fifaRanking: 31 },
  { code: 'CI', name: 'Ivory Coast', flag: '\u{1F1E8}\u{1F1EE}', confederation: 'CAF', fifaRanking: 37 },
  { code: 'ZA', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', confederation: 'CAF', fifaRanking: 56 },
  { code: 'TN', name: 'Tunisia', flag: '\u{1F1F9}\u{1F1F3}', confederation: 'CAF', fifaRanking: 47 },
  { code: 'DZ', name: 'Algeria', flag: '\u{1F1E9}\u{1F1FF}', confederation: 'CAF', fifaRanking: 28 },
  { code: 'CV', name: 'Cape Verde', flag: '\u{1F1E8}\u{1F1FB}', confederation: 'CAF', fifaRanking: 60 },
  { code: 'CD', name: 'DR Congo', flag: '\u{1F1E8}\u{1F1E9}', confederation: 'CAF', fifaRanking: 48 },
  { code: 'GH', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', confederation: 'CAF', fifaRanking: 57 },

  // AFC
  { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', confederation: 'AFC', fifaRanking: 18 },
  { code: 'KR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', confederation: 'AFC', fifaRanking: 22 },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', confederation: 'AFC', fifaRanking: 27 },
  { code: 'SA', name: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', confederation: 'AFC', fifaRanking: 58 },
  { code: 'IR', name: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', confederation: 'AFC', fifaRanking: 21 },
  { code: 'IQ', name: 'Iraq', flag: '\u{1F1EE}\u{1F1F6}', confederation: 'AFC', fifaRanking: 59 },
  { code: 'QA', name: 'Qatar', flag: '\u{1F1F6}\u{1F1E6}', confederation: 'AFC', fifaRanking: 61 },
  { code: 'UZ', name: 'Uzbekistan', flag: '\u{1F1FA}\u{1F1FF}', confederation: 'AFC', fifaRanking: 52 },
  { code: 'JO', name: 'Jordan', flag: '\u{1F1EF}\u{1F1F4}', confederation: 'AFC', fifaRanking: 62 },

  // OFC
  { code: 'NZ', name: 'New Zealand', flag: '\u{1F1F3}\u{1F1FF}', confederation: 'OFC', fifaRanking: 63 },
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
