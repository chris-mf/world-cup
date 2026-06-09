import { getState, saveState } from '@/lib/blob-store';
import { executeDraw } from '@/lib/draw';

export async function POST() {
  const existing = await getState();
  if (existing.drawComplete) {
    return Response.json({ error: 'Draw already completed. Reset first.' }, { status: 400 });
  }

  const results = executeDraw();
  const state = {
    drawComplete: true,
    drawResults: results,
    matches: existing.matches,
    drawTimestamp: new Date().toISOString(),
  };

  await saveState(state);
  return Response.json(state);
}
