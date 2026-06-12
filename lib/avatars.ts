export type AvatarDefinition = {
  id: string;
  name: string;
  image: string;
};

export const AVATARS: AvatarDefinition[] = [
  { id: 'sunrise', name: 'Sunrise Writer', image: '/avatars/yuubin-sunrise.svg' },
  { id: 'sage', name: 'Sage Reader', image: '/avatars/yuubin-sage.svg' },
  { id: 'indigo', name: 'Indigo Courier', image: '/avatars/yuubin-indigo.svg' },
  { id: 'rose', name: 'Rose Poet', image: '/avatars/yuubin-rose.svg' },
  { id: 'copper', name: 'Copper Penpal', image: '/avatars/yuubin-copper.svg' },
  { id: 'sky', name: 'Sky Messenger', image: '/avatars/yuubin-sky.svg' },
  { id: 'moon', name: 'Moon Scribe', image: '/avatars/yuubin-moon.svg' },
  { id: 'emerald', name: 'Emerald Postkeeper', image: '/avatars/yuubin-emerald.svg' },
  { id: 'amber', name: 'Amber Archivist', image: '/avatars/yuubin-amber.svg' },
  { id: 'violet', name: 'Violet Dreamer', image: '/avatars/yuubin-violet.svg' },
  { id: 'teal', name: 'Teal Traveller', image: '/avatars/yuubin-teal.svg' },
  { id: 'maroon', name: 'Maroon Memoirist', image: '/avatars/yuubin-maroon.svg' },
];

export function isKnownAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return true;
  return AVATARS.some((avatar) => avatar.image === avatarUrl);
}
