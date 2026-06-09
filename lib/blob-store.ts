import { put, list } from '@vercel/blob';
import { AppState } from './types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const BLOB_KEY = 'draw-state.json';
const LOCAL_FILE = join(process.cwd(), 'draw-state.json');

const DEFAULT_STATE: AppState = {
  drawComplete: false,
  drawResults: [],
  matches: [],
  drawTimestamp: null,
};

const useBlob = process.env.VERCEL === '1';

export async function getState(): Promise<AppState> {
  if (!useBlob) {
    try {
      if (existsSync(LOCAL_FILE)) {
        return JSON.parse(readFileSync(LOCAL_FILE, 'utf-8')) as AppState;
      }
    } catch {}
    return DEFAULT_STATE;
  }

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
  if (!useBlob) {
    writeFileSync(LOCAL_FILE, JSON.stringify(state, null, 2));
    return;
  }

  await put(BLOB_KEY, JSON.stringify(state), {
    access: 'public',
    addRandomSuffix: false,
  });
}
