import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fetchLiveMatches } from '@/lib/football-api';
import { buildMatchMessage, postToSlack } from '@/lib/slack-bot';

const BLOB_KEY = 'slack-posted-matches.json';
const LOCAL_FILE = join(process.cwd(), 'slack-posted-matches.json');
const useBlob = process.env.VERCEL === '1';

async function getPostedMatches(): Promise<string[]> {
  if (!useBlob) {
    try {
      if (existsSync(LOCAL_FILE)) {
        return JSON.parse(readFileSync(LOCAL_FILE, 'utf-8')) as string[];
      }
    } catch {}
    return [];
  }

  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url, { cache: 'no-store' });
    return (await response.json()) as string[];
  } catch {
    return [];
  }
}

async function savePostedMatches(ids: string[]): Promise<void> {
  if (!useBlob) {
    writeFileSync(LOCAL_FILE, JSON.stringify(ids, null, 2));
    return;
  }

  await put(BLOB_KEY, JSON.stringify(ids), {
    access: 'public',
    addRandomSuffix: false,
  });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.SLACK_WEBHOOK_URL) {
    return NextResponse.json(
      { error: 'SLACK_WEBHOOK_URL not configured' },
      { status: 500 },
    );
  }

  const matches = await fetchLiveMatches();
  const completedMatches = matches.filter((m) => m.status === 'completed');

  if (completedMatches.length === 0) {
    return NextResponse.json({ message: 'No completed matches yet', posted: 0 });
  }

  const alreadyPosted = await getPostedMatches();
  const newMatches = completedMatches.filter(
    (m) => !alreadyPosted.includes(m.id),
  );

  if (newMatches.length === 0) {
    return NextResponse.json({
      message: 'All completed matches already posted',
      posted: 0,
      total: completedMatches.length,
    });
  }

  const posted: string[] = [];

  for (const match of newMatches) {
    const message = buildMatchMessage(match, matches);
    if (!message) continue;

    const success = await postToSlack(message);
    if (success) {
      posted.push(match.id);
    }
  }

  if (posted.length > 0) {
    await savePostedMatches([...alreadyPosted, ...posted]);
  }

  return NextResponse.json({
    message: `Posted ${posted.length} match update(s) to Slack`,
    posted: posted.length,
    matchIds: posted,
    total: completedMatches.length,
  });
}
