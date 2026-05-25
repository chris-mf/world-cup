import { AppState, DrawResult, Match } from './types';
import { createInitialBracket } from './bracket';

const STORAGE_KEY = 'wc2026-sweepstake';

function getDefaultState(): AppState {
  return {
    drawComplete: false,
    drawResults: [],
    matches: createInitialBracket(),
    drawTimestamp: null,
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return JSON.parse(raw) as AppState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveDraw(results: DrawResult[]): AppState {
  const state = loadState();
  state.drawComplete = true;
  state.drawResults = results;
  state.drawTimestamp = new Date().toISOString();
  saveState(state);
  return state;
}

export function saveMatches(matches: Match[]): AppState {
  const state = loadState();
  state.matches = matches;
  saveState(state);
  return state;
}

export function resetDraw(): AppState {
  const state = getDefaultState();
  saveState(state);
  return state;
}

export function getTeamsForParticipant(
  participantId: string,
  results: DrawResult[],
): [string, string] | null {
  const result = results.find((r) => r.participantId === participantId);
  return result ? result.teams : null;
}

export function getParticipantForTeam(
  teamCode: string,
  results: DrawResult[],
): string | null {
  const result = results.find(
    (r) => r.teams[0] === teamCode || r.teams[1] === teamCode,
  );
  return result ? result.participantId : null;
}
