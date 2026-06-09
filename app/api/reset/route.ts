import { saveState } from '@/lib/blob-store';

export async function POST() {
  const state = {
    drawComplete: false,
    drawResults: [],
    matches: [],
    drawTimestamp: null,
  };

  await saveState(state);
  return Response.json(state);
}
