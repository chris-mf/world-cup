import { DrawResult, Match, POINTS_PER_ROUND, Round, WINNER_BONUS } from './types';
import { getMatchWinner } from './bracket';

export interface TeamMatchResult {
  round: Round;
  opponentCode: string;
  score: string;
  outcome: 'W' | 'D' | 'L';
  points: number;
  isLive: boolean;
}

export interface TeamScore {
  code: string;
  points: number;
  results: TeamMatchResult[];
  alive: boolean;
}

export interface ParticipantScore {
  participantId: string;
  teams: [string, string];
  teamScores: [TeamScore, TeamScore];
  teamPoints: [number, number];
  totalPoints: number;
  teamsAlive: number;
  rank: number;
}

function getTeamScore(teamCode: string, matches: Match[]): TeamScore {
  let points = 0;
  const results: TeamMatchResult[] = [];
  const roundOrder: Round[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

  for (const round of roundOrder) {
    const roundMatches = matches.filter((m) => m.round === round);
    for (const match of roundMatches) {
      if (match.team1Code !== teamCode && match.team2Code !== teamCode) continue;

      const isHome = match.team1Code === teamCode;
      const opponentCode = isHome ? match.team2Code : match.team1Code;
      if (!opponentCode) continue;

      const isLive = match.status === 'live';

      if (match.status === 'completed' && match.score1 !== null && match.score2 !== null) {
        const teamGoals = isHome ? match.score1 : match.score2;
        const oppGoals = isHome ? match.score2 : match.score1;
        const winner = getMatchWinner(match);
        const outcome: 'W' | 'D' | 'L' =
          winner === teamCode ? 'W' : winner === null ? 'D' : 'L';

        let matchPoints = 0;
        if (outcome === 'W') {
          matchPoints = POINTS_PER_ROUND[round];
          if (round === 'final') {
            matchPoints += WINNER_BONUS;
          }
        }
        points += matchPoints;

        results.push({
          round,
          opponentCode,
          score: `${teamGoals}-${oppGoals}`,
          outcome,
          points: matchPoints,
          isLive: false,
        });
      } else if (isLive && match.score1 !== null && match.score2 !== null) {
        const teamGoals = isHome ? match.score1 : match.score2;
        const oppGoals = isHome ? match.score2 : match.score1;
        results.push({
          round,
          opponentCode,
          score: `${teamGoals}-${oppGoals}`,
          outcome: teamGoals > oppGoals ? 'W' : teamGoals < oppGoals ? 'L' : 'D',
          points: 0,
          isLive: true,
        });
      }
    }
  }

  let alive = true;
  for (const match of matches) {
    if (match.status !== 'completed') continue;
    if (match.round === 'group') continue;
    if (match.team1Code !== teamCode && match.team2Code !== teamCode) continue;
    const winner = getMatchWinner(match);
    if (winner !== teamCode && match.round !== 'sf') {
      alive = false;
      break;
    }
  }

  return { code: teamCode, points, results, alive };
}

export function calculateScores(
  drawResults: DrawResult[],
  matches: Match[],
): ParticipantScore[] {
  const scores: ParticipantScore[] = drawResults.map((dr) => {
    const t1 = getTeamScore(dr.teams[0], matches);
    const t2 = getTeamScore(dr.teams[1], matches);

    return {
      participantId: dr.participantId,
      teams: dr.teams,
      teamScores: [t1, t2],
      teamPoints: [t1.points, t2.points],
      totalPoints: t1.points + t2.points,
      teamsAlive: (t1.alive ? 1 : 0) + (t2.alive ? 1 : 0),
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
