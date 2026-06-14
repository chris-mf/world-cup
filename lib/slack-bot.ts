import { Match, ROUND_LABELS, POINTS_PER_ROUND, WINNER_BONUS, Round } from './types';
import { DRAW_RESULTS } from './draw-results';
import { getTeam } from './teams';
import { getMatchWinner, getMatchLoser } from './bracket';

interface SlackMatchUpdate {
  text: string;
  blocks: SlackBlock[];
}

type SlackBlock =
  | { type: 'header'; text: { type: 'plain_text'; text: string; emoji: boolean } }
  | { type: 'section'; text: { type: 'mrkdwn'; text: string } }
  | { type: 'divider' }
  | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> };

const SLACK_IDS: Record<string, string> = {
  'bella': 'U09TVJE2UMQ',
  'brendan': 'U0A463STFKN',
  'chris-bear': 'U09SPV778LU',
  'christopher-ellis': 'U09S5F1M2CF',
  'ed-corcoran': 'U0A108NDH8X',
  'emilie': 'U09T8M0C3AA',
  'emily-mundzic': 'U0A3VS9GM3M',
  'horacio-moran': 'U0A1H8ZDZ16',
  'james-kehoe': 'U0A108MK631',
  'johnny-rogers': 'U09TF85GSU8',
  'jon-christensen': 'U09S0A5AW6P',
  'kate': 'U09TSBFFZ6Z',
  'laura': 'U09SHFH2V0V',
  'liam': 'U09T4KYCAHZ',
  'luke': 'U09SQFT4204',
  'lyndal': 'U0A25CS23KR',
  'maddie': 'U0A4F84B82V',
  'nick-p': 'U09TTH5Q8ES',
  'nick-gower': 'U09SEH27BKM',
  'oliver': 'U0A3TM06HPU',
  'stephen': 'U09T4KZE5KM',
  'sarah-ashman-baird': 'U0A8HSPK2KY',
  'wendy': 'U09TZ5WPCQ4',
  'yasin-masukor': 'U09S5F2S1QF',
};

const ROAST_TARGETS = new Set([
  'johnny-rogers',
  'nick-p',
  'nick-gower',
  'yasin-masukor',
  'luke',
]);

const TARGET_LOSS_ROASTS: Record<string, string[]> = {
  'johnny-rogers': [
    `Johnny will blame the ref. He always blames the ref.`,
    `Johnny talked a big game. His team didn't.`,
    `Someone check on Johnny. Actually don't.`,
    `Johnny's "this is my year" energy aging like milk.`,
    `Classic Johnny. Big chat, shit team.`,
  ],
  'nick-p': [
    `Nick P in the mud. Nature is healing.`,
    `Nick P's expert analysis was, predictably, bollocks.`,
    `Couldn't have happened to a nicer bloke. Oh wait.`,
    `Nick P's strategy was "hope." Hope said no.`,
  ],
  'nick-gower': [
    `Nick G had "a good feeling" about them. His feelings are always wrong.`,
    `Another wrong horse from Nick G. Impressively consistent.`,
    `Nick G incoming with the bad luck excuses. Don't believe him.`,
  ],
  'yasin-masukor': [
    `Yasin's had something to say about every game. None of it correct.`,
    `The bank of Yasin is insolvent. Another cheque bounced.`,
    `Yasin can go back to pretending he follows the A-League.`,
    `Yasin fancied his chances. His chances didn't fancy him back.`,
  ],
  'luke': [
    `Luke Parry: the reverse oracle. Bet against everything he says.`,
    `Luke "never rated them anyway." We saw the messages, Luke.`,
    `Luke's bracket, mood, and credibility — all in tatters.`,
    `Luke will not handle this with grace. Brace yourselves.`,
  ],
};

const TARGET_WIN_ROASTS: Record<string, string[]> = {
  'johnny-rogers': [
    `Johnny acting like he managed the team. You drew a name from a hat mate.`,
    `Don't let Johnny enjoy this. Change the subject.`,
  ],
  'nick-p': [
    `Nick P gets a win. Will be unbearable for 48 hours minimum.`,
    `Credit to Nick P. Just kidding, it's a sweepstake. He did nothing.`,
  ],
  'nick-gower': [
    `Nick G taking personal credit for this. He was not involved.`,
  ],
  'yasin-masukor': [
    `Yasin suddenly thinks he's Pep Guardiola. Calm down son.`,
    `Don't let this go to Yasin's head. Too late.`,
  ],
  'luke': [
    `Luke Parry's team showed up for once. Mark the calendar.`,
    `A rare Luke Parry W. Like Halley's Comet but less impressive.`,
  ],
};

function mention(participantId: string): string {
  const slackId = SLACK_IDS[participantId];
  return slackId ? `<@${slackId}>` : `*${participantId}*`;
}

function teamLabel(code: string): string {
  const team = getTeam(code);
  return team ? `${team.flag} ${team.name}` : code;
}

function ownerOf(teamCode: string): string | null {
  const draw = DRAW_RESULTS.find(
    (d) => d.teams[0] === teamCode || d.teams[1] === teamCode,
  );
  return draw?.participantId ?? null;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── GROUP STAGE ─────────────────────────────────────────────────────────

const GROUP_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} done in the groups. No urgency, no quality, no fucking clue. ${oW} picks up a point. ${oL}, your lot need a word with themselves.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${w} take three points. ${l} were flat, lifeless, embarrassing. ${oW} benefits. ${oL}, long tournament ahead.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} lost in the groups. All you had to do was not be shit. And you were shit. ${oW} collects. ${oL}, not ideal.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${w} win. ${l} looked like they'd rather be on holiday. At this rate they will be soon. ${oW} takes the point. ${oL}, rocket needed.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} beaten. Manager will say "we go again." Translation: "we're fucked." ${oW} profits. ${oL}, early days but grim days.`,
];

const GROUP_DRAW = [
  (t1: string, t2: string, o1: string, o2: string) =>
    `${t1} and ${t2} share a draw. Nobody deserved to win. Nobody did. ${o1} and ${o2} share the disappointment.`,
  (t1: string, t2: string, o1: string, o2: string) =>
    `A boring, miserable draw. ${t1} and ${t2} cancelled each other out. ${o1} and ${o2} get fuck all from that.`,
  (t1: string, t2: string, o1: string, o2: string) =>
    `${t1} and ${t2} draw. Cowardly from both sides. ${o1} and ${o2}, your teams let you down equally.`,
];

const GROUP_DRAW_GOALS = [
  (t1: string, t2: string, o1: string, o2: string, score: string) =>
    `${score}! Goals but no winner. Both teams attacking like lunatics, defending like amateurs. No sweepstake points. ${o1} and ${o2}, a show but not a result.`,
  (t1: string, t2: string, o1: string, o2: string, score: string) =>
    `${score} draw. Neither defence covered themselves in glory. ${o1} and ${o2}, no points from this circus.`,
];

// ── ROUND OF 32 ─────────────────────────────────────────────────────────

const R32_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} are cooked. Midfield fucking non-existent, defence a polite suggestion. ${oW} collects. ${oL}, sorry about your lot.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${w} put ${l} to the sword. Back line was an open bloody invitation. Keeper was a spectator. ${oW} takes the points. Chin up ${oL}.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Bin them. ${l} couldn't pass water. Striker couldn't hit a cow's arse with a banjo. Keeper had the reflexes of a fucking sundial. ${oL}, condolences. ${oW}, enjoy.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} go home. Good bloody riddance. Campaign had all the ambition of a wet fart at a funeral. ${oL}, not your fault. ${oW}, get in.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Wheels off for ${l}. Couldn't organise a piss-up in a brewery. Pub league bollocks on the world stage. ${oW} profits. ${oL}, commiserations.`,
];

// ── ROUND OF 16 ─────────────────────────────────────────────────────────

const R16_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} sent home in a body bag. Midfield dead on arrival, attack flatlined, defence had rigor mortis by half time. ${oW} goes through. ${oL}, deep breaths.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Christ almighty, ${l}. Ninety minutes of absolute dross. Centre-backs playing like they'd bet against themselves. ${oW} takes the points. ${oL}, sympathy and nothing else.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} produced football that should be classified as a crime. Manager should be sacked on the tarmac. ${oW} advances. ${oL}, pour a large one.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} bottled it. Again. Big talk, fold under pressure. Spineless. Gutless. Absolutely fucking typical. ${oW} cashes in. ${oL}, we tried to warn you.`,
];

// ── QUARTER-FINALS ──────────────────────────────────────────────────────

const QF_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} OUT. An absolute fucking disgrace. Quarter-final performance you wouldn't accept from five-a-side on a Tuesday. ${oW} through. ${oL}, genuinely feel for you.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Quarter-final and ${l} shat the bed. ${w} toyed with them. Manager watching his legacy crumble in real time. ${oW} picks up the points. ${oL}, have a drink.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} had a nation behind them and produced THAT. Golden generation? Golden shower more like. ${oW} cruises through. ${oL}, blame the team.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} absolutely fucking bottled a quarter-final. No fight, no heart, no brain. ${oW} takes it. ${oL}, it's only a sweepstake. But also, wow.`,
];

// ── SEMI-FINALS ─────────────────────────────────────────────────────────

const SF_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `SEMI-FINAL and ${l} served up the most cowardly 90 minutes since records began. Every player should be ashamed. ${oW} goes to the final. ${oL}, thoughts and prayers.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} in a World Cup semi and THAT'S what they produce? Folded like a cheap tent. Manager will never work again. Rightly so. ${oW} through. ${oL}, this one stings.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Semi-final. Biggest game of their lives. ${l} bottled it spectacularly. Defenders panicked, midfield vanished, attackers tranquilised. Pathetic. ${oW} collects. ${oL}, there's always the third-place playoff. LOL.`,
];

// ── THRASHINGS (3+ goals) ───────────────────────────────────────────────

const THRASHING_QUIPS = [
  (w: string, l: string, oL: string, score: string) =>
    `${score}. A fucking crime scene. ${l} taken apart. No shape, no spine, no clue. ${oL}, avert your eyes.`,
  (w: string, l: string, oL: string, score: string) =>
    `${score}?! Christ alive. ${w} dismantled ${l} like flat-pack furniture with missing instructions. ${oL}, sorry you witnessed that.`,
  (w: string, l: string, oL: string, score: string) =>
    `${w} ${score} ${l}. They're already fucking dead. Back four like a sandcastle at high tide. Keeper needs therapy. ${oL}, look away.`,
  (w: string, l: string, oL: string, score: string) =>
    `${score}. Bloodbath. ${l} got their arses handed to them. Manager should be arrested. ${oL}, thoughts with you.`,
];

// ── CLOSE MATCHES (1 goal) ──────────────────────────────────────────────

const CLOSE_MATCH_QUIPS = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} were RIGHT THERE then bottled it at the death. A masterclass in nearly. ${oW} gets the points by a whisker. ${oL}, condolences.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Razor thin. ${l} lost by a gnat's bollock. So close, so devastatingly far. ${oW} survives. ${oL}, commiserations.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Could've gone either way. The footballing gods told ${l} to piss off. Unlucky ${oL}. Lucky ${oW}.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Decided on the finest of margins. Football is a cold, heartless bastard. ${oW} takes it. ${oL}, chin up.`,
];

// ── FINAL ───────────────────────────────────────────────────────────────

const FINAL_QUIPS = [
  (w: string, oW: string) =>
    `🏆 ${w} ARE WORLD BLOODY CHAMPIONS 🏆\n\n${oW} TAKES THE SWEEPSTAKE. The money. The glory. The bragging rights until the heat death of the universe.\n\nThe rest of you lost to someone who picked teams out of a hat.`,
  (w: string, oW: string) =>
    `🏆 IT'S DONE. ${w} WIN THE WHOLE THING. 🏆\n\n${oW} is sweepstake champion. Owe them money. Owe them respect. In that order.\n\nSee you in 2030.`,
];

// ── BOTH TEAMS SAME OWNER ───────────────────────────────────────────────

const BOTH_TEAMS_SAME_OWNER_QUIPS = [
  (owner: string, w: string, l: string) =>
    `${owner} had BOTH ${w} and ${l}. Literally impossible to lose. Disgusting. Iconic. Disgusting.`,
  (owner: string, w: string, l: string) =>
    `Are you taking the piss? ${owner} owned BOTH teams. The rest of the sweepstake formally registers its disgust.`,
];

// ── ELIMINATION ─────────────────────────────────────────────────────────

const ELIMINATION_QUIPS = [
  (oL: string) => `That's one of ${oL}'s teams gone. One left. No pressure.`,
  (oL: string) => `${oL} down to one team. Everything riding on the other lot now.`,
  (oL: string) => `One down for ${oL}. Surviving team better have more fight than that shower.`,
];

const DOUBLE_ELIMINATION_QUIPS = [
  (oL: string) => `\n\n💀 BOTH of ${oL}'s teams out. Sweepstake officially over.`,
  (oL: string) => `\n\n💀 ${oL} has zero teams left. Welcome to the void.`,
  (oL: string) => `\n\n💀 ${oL} wiped out. Both teams gone. Remarkable.`,
];

// ── LOGIC ───────────────────────────────────────────────────────────────

function getWinQuips(round: Round) {
  switch (round) {
    case 'group': return GROUP_WIN;
    case 'r32': return R32_WIN;
    case 'r16': return R16_WIN;
    case 'qf': return QF_WIN;
    case 'sf': return SF_WIN;
    default: return R16_WIN;
  }
}

function isTeamEliminated(teamCode: string, matches: Match[]): boolean {
  for (const match of matches) {
    if (match.status !== 'completed') continue;
    const loser = getMatchLoser(match);
    if (loser === teamCode && match.round !== 'sf') return true;
  }
  return false;
}

function countTeamsAlive(participantId: string, matches: Match[]): number {
  const draw = DRAW_RESULTS.find((d) => d.participantId === participantId);
  if (!draw) return 0;
  return draw.teams.filter((t) => !isTeamEliminated(t, matches)).length;
}

function getTargetRoast(participantId: string, type: 'win' | 'loss'): string {
  if (!ROAST_TARGETS.has(participantId)) return '';
  const roasts = type === 'loss'
    ? TARGET_LOSS_ROASTS[participantId]
    : TARGET_WIN_ROASTS[participantId];
  if (!roasts || roasts.length === 0) return '';
  return `\n${pickRandom(roasts)}`;
}

export function buildMatchMessage(
  match: Match,
  allMatches: Match[],
): SlackMatchUpdate | null {
  if (match.status !== 'completed') return null;
  if (!match.team1Code || !match.team2Code) return null;
  if (match.score1 === null || match.score2 === null) return null;

  const roundLabel = ROUND_LABELS[match.round];
  const points = POINTS_PER_ROUND[match.round];
  const scoreline = `${match.score1}-${match.score2}`;
  const goalDiff = Math.abs(match.score1 - match.score2);
  const team1Label = teamLabel(match.team1Code);
  const team2Label = teamLabel(match.team2Code);
  const headerText = `${roundLabel}: ${team1Label} ${match.score1} - ${match.score2} ${team2Label}`;

  const owner1Id = ownerOf(match.team1Code);
  const owner2Id = ownerOf(match.team2Code);
  const owner1 = owner1Id ? mention(owner1Id) : 'Some soul';
  const owner2 = owner2Id ? mention(owner2Id) : 'Some soul';

  const winnerCode = getMatchWinner(match);
  const loserCode = getMatchLoser(match);
  const isDraw = !winnerCode;

  let commentary: string;

  if (isDraw && match.round === 'group') {
    if (match.score1 === 0) {
      commentary = pickRandom(GROUP_DRAW)(team1Label, team2Label, owner1, owner2);
    } else {
      commentary = pickRandom(GROUP_DRAW_GOALS)(team1Label, team2Label, owner1, owner2, scoreline);
    }
    commentary += `\n\n📊 No sweepstake points. Nobody wins.`;
    if (owner1Id) commentary += getTargetRoast(owner1Id, 'loss');
    if (owner2Id) commentary += getTargetRoast(owner2Id, 'loss');
  } else if (winnerCode && loserCode) {
    const winner = teamLabel(winnerCode);
    const loser = teamLabel(loserCode);
    const ownerWId = ownerOf(winnerCode);
    const ownerLId = ownerOf(loserCode);
    const ownerW = ownerWId ? mention(ownerWId) : 'Some lucky soul';
    const ownerL = ownerLId ? mention(ownerLId) : 'Some poor soul';
    const isFinal = match.round === 'final';
    const sameOwner = ownerWId && ownerLId && ownerWId === ownerLId;

    if (isFinal) {
      const totalPoints = points + WINNER_BONUS;
      commentary = pickRandom(FINAL_QUIPS)(winner, ownerW);
      commentary += `\n\n💰 *+${totalPoints} points* to ${ownerW}!`;
    } else if (sameOwner) {
      commentary = pickRandom(BOTH_TEAMS_SAME_OWNER_QUIPS)(ownerW, winner, loser);
      commentary += `\n\n📊 *+${points} points* to ${ownerW} either way.`;
    } else if (goalDiff >= 3) {
      commentary = pickRandom(THRASHING_QUIPS)(winner, loser, ownerL, scoreline);
      commentary += `\n\n📊 *+${points} points* to ${ownerW} 🎉`;
    } else if (goalDiff <= 1) {
      commentary = pickRandom(CLOSE_MATCH_QUIPS)(winner, loser, ownerW, ownerL);
      commentary += `\n\n📊 *+${points} points* to ${ownerW}`;
    } else {
      commentary = pickRandom(getWinQuips(match.round))(winner, loser, ownerW, ownerL);
      commentary += `\n\n📊 *+${points} points* to ${ownerW}`;
    }

    if (ownerLId) commentary += getTargetRoast(ownerLId, 'loss');
    if (ownerWId) commentary += getTargetRoast(ownerWId, 'win');

    if (ownerLId && !sameOwner && match.round !== 'group') {
      const teamsLeft = countTeamsAlive(ownerLId, allMatches);
      if (teamsLeft === 0) {
        commentary += pickRandom(DOUBLE_ELIMINATION_QUIPS)(ownerL);
      } else {
        commentary += `\n${pickRandom(ELIMINATION_QUIPS)(ownerL)}`;
      }
    }
  } else {
    return null;
  }

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `⚽ ${headerText}`, emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: commentary },
    },
  ];

  return {
    text: headerText,
    blocks,
  };
}

export async function postToSlack(message: SlackMatchUpdate): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL not set');
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message.text,
        blocks: message.blocks,
      }),
    });

    if (!res.ok) {
      console.error(`Slack webhook error: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to post to Slack:', err);
    return false;
  }
}
