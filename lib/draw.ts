import { DrawResult } from './types';
import { TEAMS } from './teams';
import { PARTICIPANTS } from './participants';

function secureShuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  const randomValues = new Uint32Array(shuffled.length);
  crypto.getRandomValues(randomValues);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

const TOP_N = 10;

export function executeDraw(): DrawResult[] {
  if (TEAMS.length !== 48) {
    throw new Error(`Expected 48 teams, got ${TEAMS.length}`);
  }
  if (PARTICIPANTS.length !== 24) {
    throw new Error(`Expected 24 participants, got ${PARTICIPANTS.length}`);
  }

  const sorted = [...TEAMS].sort((a, b) => a.fifaRanking - b.fifaRanking);
  const potA = sorted.slice(0, TOP_N).map((t) => t.code);
  const potB = sorted.slice(TOP_N).map((t) => t.code);

  const shuffledPotA = secureShuffleArray(potA);
  const shuffledPotB = secureShuffleArray(potB);

  // Randomly choose which 10 of 24 participants get a top-10 team
  const indices = Array.from({ length: PARTICIPANTS.length }, (_, i) => i);
  const shuffledIndices = secureShuffleArray(indices);
  const luckySet = new Set(shuffledIndices.slice(0, shuffledPotA.length));

  const results: DrawResult[] = [];
  let potAIdx = 0;
  let potBIdx = 0;

  for (let i = 0; i < PARTICIPANTS.length; i++) {
    let team1: string;
    let team2: string;

    if (luckySet.has(i)) {
      team1 = shuffledPotA[potAIdx++];
      team2 = shuffledPotB[potBIdx++];
    } else {
      team1 = shuffledPotB[potBIdx++];
      team2 = shuffledPotB[potBIdx++];
    }

    // Show higher-ranked team first
    const r1 = TEAMS.find((t) => t.code === team1)!.fifaRanking;
    const r2 = TEAMS.find((t) => t.code === team2)!.fifaRanking;

    results.push({
      participantId: PARTICIPANTS[i].id,
      teams: r1 < r2 ? [team1, team2] : [team2, team1],
    });
  }

  return results;
}
