import { put, list } from '@vercel/blob';
import { AppState } from './types';

const BLOB_KEY = 'draw-state.json';

const DEFAULT_STATE: AppState = {
  drawComplete: false,
  drawResults: [],
  matches: [],
  drawTimestamp: null,
};

export async function getState(): Promise<AppState> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    if (blobs.length === 0) return DEFAULT_STATE;
    const response = await fetch(blobs[0].url, { cache: 'no-store' });
    return (await response.json()) as AppState;
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(state), {
    access: 'public',
    addRandomSuffix: false,
  });
}
