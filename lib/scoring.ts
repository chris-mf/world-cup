import { DrawResult, Match, POINTS_PER_ROUND, Round, WINNER_BONUS } from './types';
import { getMatchWinner } from './bracket';

export interface ParticipantScore {
  participantId: string;
  teams: [string, string];
  teamPoints: [number, number];
  totalPoints: number;
  teamsAlive: number;
  rank: number;
}

function getTeamPoints(teamCode: string, matches: Match[]): number {
  let points = 0;
  const roundOrder: Round[] = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];

  for (const round of roundOrder) {
    const roundMatches = matches.filter((m) => m.round === round);
    for (const match of roundMatches) {
      if (match.status !== 'completed') continue;
      if (match.team1Code !== teamCode && match.team2Code !== teamCode) continue;

      const winner = getMatchWinner(match);
      if (winner === teamCode) {
        points += POINTS_PER_ROUND[round];
        if (round === 'final') {
          points += WINNER_BONUS;
        }
      }
    }
  }

  return points;
}

function isTeamStillPlaying(teamCode: string, matches: Match[]): boolean {
  for (const match of matches) {
    if (match.status !== 'completed') continue;
    if (match.round === 'group') continue;
    if (match.team1Code !== teamCode && match.team2Code !== teamCode) continue;
    const winner = getMatchWinner(match);
    if (winner !== teamCode && match.round !== 'sf') return false;
  }
  return true;
}

export function calculateScores(
  drawResults: DrawResult[],
  matches: Match[],
): ParticipantScore[] {
  const scores: ParticipantScore[] = drawResults.map((dr) => {
    const t1Points = getTeamPoints(dr.teams[0], matches);
    const t2Points = getTeamPoints(dr.teams[1], matches);
    const t1Alive = isTeamStillPlaying(dr.teams[0], matches) ? 1 : 0;
    const t2Alive = isTeamStillPlaying(dr.teams[1], matches) ? 1 : 0;

    return {
      participantId: dr.participantId,
      teams: dr.teams,
      teamPoints: [t1Points, t2Points],
      totalPoints: t1Points + t2Points,
      teamsAlive: t1Alive + t2Alive as number,
      rank: 0,
    };
  });

  scores.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.teamsAlive !== a.teamsAlive) return b.teamsAlive - a.teamsAlive;
    return a.participantId.localeCompare(b.participantId);
  });

  let currentRank = 1;
  for (let i = 0; i < scores.length; i++) {
    if (i > 0 && scores[i].totalPoints === scores[i - 1].totalPoints) {
      scores[i].rank = scores[i - 1].rank;
    } else {
      scores[i].rank = currentRank;
    }
    currentRank = i + 2;
  }

  return scores;
}
