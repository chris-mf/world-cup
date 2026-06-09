import { getState, saveState } from '@/lib/blob-store';
import { executeDraw } from '@/lib/draw';

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!process.env.DRAW_SECRET || code !== process.env.DRAW_SECRET) {
    return Response.json({ error: 'Invalid code' }, { status: 403 });
  }

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
