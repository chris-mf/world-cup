import { saveState } from '@/lib/blob-store';

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!process.env.DRAW_SECRET || code !== process.env.DRAW_SECRET) {
    return Response.json({ error: 'Invalid code' }, { status: 403 });
  }

  const state = {
    drawComplete: false,
    drawResults: [],
    matches: [],
    drawTimestamp: null,
  };

  await saveState(state);
  return Response.json(state);
}
