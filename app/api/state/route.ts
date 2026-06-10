import { DRAW_RESULTS, DRAW_TIMESTAMP } from '@/lib/draw-results';
import { AppState } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state: AppState = {
    drawComplete: true,
    drawResults: DRAW_RESULTS,
    matches: [],
    drawTimestamp: DRAW_TIMESTAMP,
  };
  return Response.json(state);
}
