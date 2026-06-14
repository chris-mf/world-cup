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

// Extra lines appended when a roast target loses a team
const TARGET_LOSS_ROASTS: Record<string, string[]> = {
  'johnny-rogers': [
    `Johnny's football knowledge has always been purely theoretical and today fucking proved it.`,
    `Johnny talked a big game in the group chat. His team played like they'd never heard of the sport. Classic Johnny.`,
    `Someone check on Johnny. Actually don't. Let the miserable sod stew in it.`,
    `Johnny's pre-tournament "this is my year" energy has aged like milk in the sun. Beautiful.`,
    `Johnny will somehow blame this on the referee, VAR, the pitch, the weather, the alignment of the stars. Never the shit team. Never himself. Incredible lack of self-awareness as always.`,
  ],
  'nick-p': [
    `Nick P in the mud. Nature is healing. The world is correct again.`,
    `Nick P's expert analysis of his team's chances was, predictably, complete and utter bollocks. Shocking from a man who thinks he knows football.`,
    `Couldn't have happened to a nicer bloke. Oh wait — yes it could. It happened to Nick P. Perfection.`,
    `Nick P's sweepstake strategy was just "hope" and hope just told him to fuck off.`,
  ],
  'nick-gower': [
    `Nick G's team just folded like a cheap suit. Shocking from a man who confidently told everyone he "had a good feeling" about them. Your feelings are wrong, Nick. They're always wrong.`,
    `Another masterclass in backing the wrong horse from Nick G. The man is consistently, reliably, almost impressively shit at this.`,
    `Nick G will be in the group chat shortly to explain how this was actually bad luck and not a completely shit team. Don't believe a word of it.`,
  ],
  'yasin-masukor': [
    `Yasin's team selection was always dodgy and now we have the fucking receipts. Print them. Frame them.`,
    `Yasin will have something to say about this. He always has something to say. None of it has ever been correct and today is no different.`,
    `Yasin's confidence has been writing cheques his teams can't cash all tournament. Another one bounced. The bank of Yasin is insolvent.`,
    `At least Yasin can go back to pretending he follows the A-League now. Nobody believes that either but at least it's lower stakes.`,
    `Yasin told everyone who'd listen that he fancied his chances. Cornered people at lunch. Sent unsolicited voice notes. His chances did not fancy him back. Poetic justice.`,
  ],
  'luke': [
    `Luke Parry's World Cup punditry has been proven catastrophically wrong yet again. The man's a reverse oracle. Bet against everything he says and you'll retire early.`,
    `Luke will claim he "never rated them anyway." Luke rated them. We all saw the messages. We screenshotted them. They're being circulated.`,
    `Thoughts and prayers to Luke Parry, who will absolutely not handle this with grace, dignity, or anything resembling adult behaviour.`,
    `Luke's going to be unbearable about this. More unbearable than usual, which is genuinely saying something. Brace yourselves.`,
    `Luke's bracket is in tatters. His mood is in tatters. His teams are in tatters. His credibility — already in tatters — has somehow found new depths of tatter. Beautiful stuff.`,
  ],
};

// Extra lines when a roast target WINS
const TARGET_WIN_ROASTS: Record<string, string[]> = {
  'johnny-rogers': [
    `Johnny's already acting like he personally managed the team from his phone. Mate, you drew a name out of a hat. Settle the fuck down.`,
    `Don't let Johnny enjoy this. Someone change the subject immediately before he starts a victory lap in the group chat.`,
    `Johnny getting a result is like a broken clock being right twice a day. Don't get used to it.`,
  ],
  'nick-p': [
    `Nick P gets a win and will be absolutely unbearable about it for the next 48 hours minimum. God help us all.`,
    `Credit where it's due to Nick P. Just kidding. It's a sweepstake. He did absolutely fuck all.`,
  ],
  'nick-gower': [
    `Nick G will somehow take personal credit for this. He was not involved in any way, shape, or form. But that won't stop him.`,
    `Nick G's team won IN SPITE of Nick G backing them, not because of it. Important distinction.`,
  ],
  'yasin-masukor': [
    `Yasin gets a result and suddenly he's Pep Guardiola in the group chat. Calm down son, you picked a name out of a hat and got lucky for once in your life.`,
    `Don't let this go to Yasin's head. It already has. You can see it inflating from here.`,
  ],
  'luke': [
    `Luke Parry's team actually showed up for once. Mark the calendar. Screenshot it. It won't happen again.`,
    `Luke will be dining out on this for weeks. Months. The man feeds off scraps like a seagull at a chip shop.`,
    `A rare Luke Parry W. Enjoy it mate, they don't come around often. Like Halley's Comet but less impressive.`,
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

// ── GROUP STAGE: Setting the tone ───────────────────────────────────────

const GROUP_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} just got done in the group stage. It's early days but bloody hell that was grim. No urgency, no quality, no fucking idea what they were doing out there. ${oW} picks up a point. ${oL}, your lot need to have a word with themselves.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${w} take all three points and ${l} trudge off looking like they've just been told Christmas is cancelled. Flat, lifeless, embarrassing. It's only the group stage and ${l} are already making excuses. ${oW} benefits. ${oL}, long tournament ahead for you.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} lost. In the groups. When all you need to do is not be shit. And they were shit. Properly shit. The kind of shit that makes you wonder how they qualified. ${oW} collects. ${oL}, it's early but the signs are not good mate.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${w} win it. ${l} looked like they'd rather be on holiday — which is handy because at this rate they will be soon. Toothless going forward, brainless at the back. ${oW} takes the point. ${oL}, your team needs a rocket up its arse.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} beaten in the group stage. Not ideal is it. Their manager will say "we go again" in the press conference but we all know that's code for "we're fucked and I'm updating my CV." ${oW} profits. ${oL}, early days but not great days.`,
];

const GROUP_DRAW = [
  (t1: string, t2: string, o1: string, o2: string) =>
    `${t1} ${t2} and nobody wins. Nobody deserved to win. That was 90 minutes of two teams cancelling each other out like a footballing black hole. Everyone involved should apologise. ${o1} and ${o2} share the disappointment equally.`,
  (t1: string, t2: string, o1: string, o2: string) =>
    `A draw. A boring, miserable, nothing draw. ${t1} and ${t2} played out the kind of match that makes people switch to watching paint dry for entertainment. Zero points for anyone in the sweepstake. ${o1} and ${o2}, your teams let you down equally.`,
  (t1: string, t2: string, o1: string, o2: string) =>
    `${t1} and ${t2} share the spoils. "Spoils" being generous — there was nothing worth sharing in that match. Two teams refusing to take a risk. Cowardly from both sides. ${o1} and ${o2} get precisely fuck all from that.`,
  (t1: string, t2: string, o1: string, o2: string) =>
    `Nil-all energy from ${t1} and ${t2} even if the score says otherwise. What a waste of everyone's time. Neither team deserved to win and neither team did. Poetry. ${o1} and ${o2}, commiserations on owning teams that play like this.`,
];

const GROUP_DRAW_GOALS = [
  (t1: string, t2: string, o1: string, o2: string, score: string) =>
    `${score}! At least there were goals in this one. ${t1} and ${t2} couldn't be separated — both teams attacking like lunatics and defending like they'd never heard of the concept. Entertaining as fuck but no sweepstake points for anyone. ${o1} and ${o2}, your teams gave you a show but not a result.`,
  (t1: string, t2: string, o1: string, o2: string, score: string) =>
    `${score} draw. Neither defence covered themselves in glory there. Both teams scored, both teams conceded, both teams are probably claiming "we showed character." No you didn't, you showed you can't defend. ${o1} and ${o2}, no points from this circus.`,
];

// ── ROUND OF 32: Warm-up banter, setting the scene ─────────────────────

const R32_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} are finished. Cooked. That squad had the tactical awareness of a roomba bumping into furniture. Their midfield was fucking non-existent, their attack was theoretical, and their defence was a polite suggestion at best. ${oW} collects. ${oL}, sorry about your lot.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${w} put ${l} to the sword. And fair play, ${l} made it piss easy for them — that back line was an open bloody invitation, the keeper was a spectator, and the manager looked like he'd already booked his flight home at half time. ${oW} takes the points. Chin up ${oL}.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Get in the bin, ${l}. That midfield couldn't pass water. Their striker couldn't hit a cow's arse with a banjo. Their keeper had the reflexes of a fucking sundial. A fitting end to a shit campaign that peaked in the group stages. ${oL}, condolences. ${oW}, enjoy.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} played like they'd never met each other. No chemistry, no movement, no bollocks whatsoever. Just eleven useless bastards jogging around in the heat waiting for the final whistle so they can fuck off home. Pathetic. ${oW} benefits. ${oL}, you deserved better. Your team didn't.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} go home. Good bloody riddance. That team peaked in qualifying and have been living off the fumes ever since. Their entire World Cup campaign had all the ambition of a wet fart at a funeral. ${oL}, not your fault. ${oW}, get in.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Wheels clean off for ${l}. Couldn't trap a bag of cement. Couldn't organise a piss-up in a brewery. Couldn't string three passes together without one of them dribbling into touch. Pub league bollocks on the world stage. ${oW} profits. ${oL}, commiserations.`,
];

// ── ROUND OF 16: Getting spicier ────────────────────────────────────────

const R16_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} have been sent home in a body bag. That wasn't a knockout game, that was an autopsy. Their midfield was dead on arrival, their attack flatlined after ten minutes, and their defence had rigor mortis before half time. Get them off the pitch, get them off my screen, get them out of the tournament. ${oW} goes through. ${oL}, deep breaths.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Christ almighty, ${l}. What was THAT. Ninety minutes of absolute dross. No pressing, no movement off the ball, no desire. Their centre-backs were playing like they'd placed bets against themselves. That team should be investigated. ${oW} takes the points. ${oL}, you have my sympathy and nothing else.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} produced the kind of football that should be classified as a crime against humanity. Sideways passing for 90 minutes while ${w} ran rings around them. Their manager should be sacked on the tarmac. Should never be allowed near a dugout again. ${oW} advances. ${oL}, pour yourself a large one.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} bottled it. Again. We've seen this movie before — they talk a big game, strut about in the group stages, then fold like a deck chair the moment the pressure's on. Spineless. Gutless. Absolutely fucking typical of ${l}. ${oW} cashes in. ${oL}, we tried to warn you.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Goodnight ${l}. A team with all the spine of a jellyfish and half the intelligence. Their striker had one touch in 90 minutes and it was shit. Their winger ran down three blind alleys and found nothing in any of them. Tactically bankrupt. Morally defeated. ${oW} progresses. ${oL}, it's not you, it's them. It's definitely them.`,
];

// ── QUARTER-FINALS: Properly nasty now ──────────────────────────────────

const QF_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} are OUT of the World Cup and frankly they should be out of international football entirely. That was an absolute fucking disgrace. A quarter-final and they turned up with a performance you wouldn't accept from a five-a-side team on a Tuesday night. Every single player should hand back their cap. Embarrassing. ${oW} through. ${oL}, genuinely feel for you.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Quarter-final and ${l} shat the bed. Completely. No other way to describe it. ${w} toyed with them like a cat with a half-dead mouse. ${l}'s manager sat there with his clipboard watching his legacy crumble in real time. You could see the exact moment the life left his eyes. ${oW} picks up the points. ${oL}, have a drink and don't think about it.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} had the whole country behind them and produced THAT. An entire nation's hopes resting on a squad that collectively couldn't beat an egg. Their golden generation? Their golden shower more like. An absolute embarrassment at the worst possible time. ${oW} cruises through. ${oL}, blame the team, not the draw.`,
  (w: string, l: string, oW: string, oL: string) =>
    `The stage was set for ${l} and they absolutely fucking bottled it. A quarter-final. A QUARTER-FINAL. And they turned up looking like they'd rather be at a car boot sale. No fight. No heart. No brain. A masterclass in how to waste everyone's time, money, and emotional energy. ${oW} takes it. ${oL}, chin up, it's only a sweepstake. But also, wow.`,
];

// ── SEMI-FINALS: Vicious ────────────────────────────────────────────────

const SF_WIN = [
  (w: string, l: string, oW: string, oL: string) =>
    `SEMI-FINAL and ${l} turned up with a performance that makes you question whether football should even exist as a sport. The whole country watching — kids, grandparents, people in pubs — and ${l} served up the most cowardly, passive, soul-destroying 90 minutes of anti-football since records began. Every player. Every coach. Every kit man. All of them should be ashamed. ${oW} goes to the final. ${oL}, thoughts are with you in this difficult time.`,
  (w: string, l: string, oW: string, oL: string) =>
    `${l} in a World Cup semi-final and THAT'S what they produce? Absolutely unforgivable. A once-in-a-generation chance and they folded like a cheap tent in a hurricane. ${w} weren't even that good — ${l} just decided to self-destruct. Their manager will never work again after this and rightly so. ${oW} through to the big one. ${oL}, this one's going to sting for a while.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Semi-final. The biggest game most of these players will ever play. And ${l} bottled it so spectacularly that scientists should study it. Peak choking. Their defenders panicked. Their midfield vanished. Their attackers looked like they'd been tranquilised. A World Cup semi-final and they played like they had a reservation somewhere. Pathetic. ${oW} collects. ${oL}, at least there's the third-place playoff. LOL.`,
];

// ── THRASHINGS (any round, 3+ goal diff) ────────────────────────────────

const THRASHING_QUIPS = [
  (w: string, l: string, oL: string, score: string) =>
    `${score}. That's not a football match, that's a fucking crime scene. ${l} got absolutely taken apart. No shape. No spine. No clue. Just eleven useless pricks in matching shirts watching the ball sail past them into the net, over and over, like some kind of Kafkaesque nightmare. ${oL}, avert your eyes.`,
  (w: string, l: string, oL: string, score: string) =>
    `${score}?! Christ alive. ${w} didn't beat ${l}, they dismantled them like flat-pack furniture. ${l} looked like they'd been assembled from spare parts by someone who'd lost the instructions. Their defending was so open you could've driven a bus through it pissed. And ${w} drove about six. ${oL}, sorry you had to witness that.`,
  (w: string, l: string, oL: string, score: string) =>
    `${w} ${score} ${l}. Stop. They're already fucking dead. ${l}'s back four had the structural integrity of a sandcastle at high tide. Their keeper will need therapy. Their manager will need a career change. The whole squad should be done for fraud. ${oL}, look away.`,
  (w: string, l: string, oL: string, score: string) =>
    `${score}. Absolute bloodbath. ${l} rolled up, got their arses handed to them on a silver platter, and fucked off into the night. Their manager should be arrested. That performance belongs in a museum — in the section marked "never again." ${oL}, thoughts with you.`,
];

// ── CLOSE MATCHES (any round, 1 goal diff) ──────────────────────────────

const CLOSE_MATCH_QUIPS = [
  (w: string, l: string, oW: string, oL: string) =>
    `${l} were RIGHT THERE. Had chances. Had momentum. Then bottled it at the death like only they bloody can. ${l} specialise in giving you hope then ripping your still-beating heart out of your chest and stamping on it. A masterclass in nearly. ${oW} gets the points by a whisker. ${oL}, condolences.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Razor thin. ${l} lost by a gnat's bollock. They'll be replaying that last chance on the team bus, in the hotel, in the shower, in therapy, for the rest of their miserable fucking careers. So close. So absolutely, devastatingly far. ${oW} survives. ${oL}, commiserations.`,
  (w: string, l: string, oW: string, oL: string) =>
    `That was FILTHY. Could've gone either way. ${l} threw every last thing at it and came up just short — the crossbar, the last-ditch tackle, the footballing gods all conspiring against them. Sometimes the universe just tells you to piss off. And ${l} got told. Unlucky ${oL}. Lucky ${oW}.`,
  (w: string, l: string, oW: string, oL: string) =>
    `Decided on margins so fine they'd make a Swiss watchmaker weep. ${l} didn't deserve to go out like that but football is a cold, heartless, vindictive bastard of a sport and ${l} just found that out the hard way. Cruel as fuck. ${oW} takes it. ${oL}, chin up.`,
];

// ── FINAL ───────────────────────────────────────────────────────────────

const FINAL_QUIPS = [
  (w: string, oW: string) =>
    `🏆 ${w} ARE WORLD BLOODY CHAMPIONS 🏆\n\n${oW} TAKES THE SWEEPSTAKE. The money. The glory. The bragging rights that will poison every Slack channel, every pub conversation, every Christmas dinner until the heat death of the universe.\n\nThe rest of you lost to someone who picked teams out of a hat. Let that sink in.`,
  (w: string, oW: string) =>
    `🏆 IT'S DONE. ${w} WIN THE WHOLE THING. 🏆\n\n${oW} is sweepstake champion. Owe them money. Owe them respect. In that order.\n\nSee you all in 2030 for another round of emotional damage and bad takes.`,
];

// ── BOTH TEAMS SAME OWNER ───────────────────────────────────────────────

const BOTH_TEAMS_SAME_OWNER_QUIPS = [
  (owner: string, w: string, l: string) =>
    `You absolute pisstaker. ${owner} had BOTH ${w} and ${l} in this match. Literally impossible to lose. While the rest of you are sweating bullets, ${owner} is watching their own private derby with their feet up. Disgusting. Iconic. Disgusting.`,
  (owner: string, w: string, l: string) =>
    `Are you taking the piss? ${owner} owned BOTH teams. BOTH. Like playing FIFA against yourself — utterly pointless but you still win. The rest of the sweepstake formally registers its disgust.`,
];

// ── ELIMINATION TRACKING ────────────────────────────────────────────────

const ELIMINATION_QUIPS = [
  (oL: string) =>
    `That's one of ${oL}'s teams gone. One left. No pressure.`,
  (oL: string) =>
    `${oL} down to one team. Everything riding on the other lot now.`,
  (oL: string) =>
    `One down for ${oL}. The surviving team better have more fight than that shower.`,
];

const DOUBLE_ELIMINATION_QUIPS = [
  (oL: string) =>
    `\n\n💀 BOTH of ${oL}'s teams are out. Two squads, zero fight between them. ${oL}'s sweepstake is officially over.`,
  (oL: string) =>
    `\n\n💀 ${oL} has zero teams left. Neither could be arsed. ${oL} is now a neutral. Welcome to the void.`,
  (oL: string) =>
    `\n\n💀 And that's ${oL} wiped out. Both teams gone. Two lots of overpaid professionals couldn't string a tournament together between them. Remarkable.`,
];

// ── ROUND-BASED QUIP SELECTION ──────────────────────────────────────────

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
  return `\n\n${pickRandom(roasts)}`;
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
    // Group stage draw
    if (match.score1 === 0) {
      commentary = pickRandom(GROUP_DRAW)(team1Label, team2Label, owner1, owner2);
    } else {
      commentary = pickRandom(GROUP_DRAW_GOALS)(team1Label, team2Label, owner1, owner2, scoreline);
    }
    commentary += `\n\n📊 No sweepstake points. Nobody wins. Everybody suffers.`;

    // Targeted roasts for draws
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
      commentary += `\n\n📊 *+${points} points* to ${ownerW} either way. Life's not fair.`;
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

    // Targeted roasts
    if (ownerLId) commentary += getTargetRoast(ownerLId, 'loss');
    if (ownerWId) commentary += getTargetRoast(ownerWId, 'win');

    // Elimination tracking (knockout only)
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
