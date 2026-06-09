import { Participant } from './types';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const NAMES = [
  'Bella',
  'Brendan',
  'Chris Bear',
  'Christopher Ellis',
  'Ed Corcoran',
  'Emilie',
  'Emily Mundzic',
  'Horacio Moran',
  'James Kehoe',
  'Johnny Rogers',
  'Jon Christensen',
  'Kate',
  'Laura',
  'Liam',
  'Luke',
  'Lyndal',
  'Maddie',
  'Nick P',
  'Nick Gower',
  'Oliver',
  'Stephen',
  'Sarah Ashman-Baird',
  'Wendy',
  'Yasin Masukor',
];

const KEEP_FULL_NAME = new Set(['Chris Bear', 'Christopher Ellis', 'Nick P', 'Nick Gower']);

function shortName(name: string): string {
  if (KEEP_FULL_NAME.has(name)) {
    if (name === 'Christopher Ellis') return 'Chris Ellis';
    if (name === 'Nick Gower') return 'Nick G';
    return name;
  }
  return name.split(' ')[0];
}

export const PARTICIPANTS: Participant[] = NAMES.map((name) => ({
  id: toSlug(name),
  name,
  shortName: shortName(name),
}));

export function getParticipant(slug: string): Participant | undefined {
  return PARTICIPANTS.find((p) => p.id === slug.toLowerCase());
}
