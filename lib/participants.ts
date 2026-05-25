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

export const PARTICIPANTS: Participant[] = NAMES.map((name) => ({
  id: toSlug(name),
  name,
}));

export function getParticipant(slug: string): Participant | undefined {
  return PARTICIPANTS.find((p) => p.id === slug.toLowerCase());
}
