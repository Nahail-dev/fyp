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
];

export function isKnownAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return true;
  return AVATARS.some((avatar) => avatar.image === avatarUrl);
}
