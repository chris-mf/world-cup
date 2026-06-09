export interface ScheduleMatch {
  matchNumber: number;
  stage: string;
  match: string;
  date: string;
  day: string;
  kickoff: string;
  venue: string;
  team1: string | null;
  team2: string | null;
}

function parseTeams(match: string): [string | null, string | null] {
  if (!match.includes(' vs ')) return [null, null];
  const [t1, t2] = match.split(' vs ').map(t => t.trim());
  const isPlaceholder = (t: string) =>
    /^(Match|W\d|L\d|\d|R|[A-L][\/ ])/.test(t);
  return [
    isPlaceholder(t1) ? null : t1,
    isPlaceholder(t2) ? null : t2,
  ];
}

import rawSchedule from './schedule-raw.json';

export const SCHEDULE: ScheduleMatch[] = (rawSchedule as Array<{
  matchNumber: number;
  stage: string;
  match: string;
  date: string;
  day: string;
  kickoff: string;
  venue: string;
}>).map(r => {
  const [team1, team2] = parseTeams(r.match);
  return { ...r, team1, team2 };
});

export function getMatchDates(): string[] {
  const dates = [...new Set(SCHEDULE.map(m => m.date))];
  return dates;
}
