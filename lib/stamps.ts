export type StampRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type StampDefinition = {
  id: string;
  name: string;
  description: string;
  rarity: StampRarity;
  image: string;
  requirement: string;
};

export const STAMPS: StampDefinition[] = [
  {
    id: 'yuubin-common',
    name: 'First Post',
    description: 'A simple Yuubin stamp for everyday letters.',
    rarity: 'common',
    image: '/stamps/stamp-common.png',
    requirement: 'Available from the start',
  },
  {
    id: 'yuubin-rare',
    name: 'Golden Route',
    description: 'A brighter stamp for memorable exchanges.',
    rarity: 'rare',
    image: '/stamps/stamp-rare.png',
    requirement: 'Send 5 letters',
  },
  {
    id: 'yuubin-epic',
    name: 'Long Distance',
    description: 'An expressive stamp for letters travelling far.',
    rarity: 'epic',
    image: '/stamps/stamp-epic.png',
    requirement: 'Send a letter outside your country',
  },
  {
    id: 'yuubin-legendary',
    name: 'Yuubin Legend',
    description: 'A special stamp for devoted letter writers.',
    rarity: 'legendary',
    image: '/stamps/stamp-legendary.png',
    requirement: 'Send 25 letters including 3 international letters',
  },
];

export const DEFAULT_STAMP_ID = STAMPS[0].id;
export const STARTING_COMMON_STAMPS = 5;

export function getStampById(stampId?: string | null) {
  return STAMPS.find((stamp) => stamp.id === stampId) ?? STAMPS[0];
}
