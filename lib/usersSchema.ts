/** `public.users` columns (must match Supabase schema). */
export const USERS_PROFILE_SELECT =
  'id, email, username, full_name, avatar_url, bio, interests, theme, is_active, city_uuid_id, created_at, updated_at' as const;

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

/** Required unique `username` when inserting into `users`. */
export function defaultUsernameFromAuthUser(user: AuthUserLike): string {
  const meta = user.user_metadata ?? undefined;
  const fromMeta =
    (typeof meta?.preferred_username === 'string' && meta.preferred_username) ||
    (typeof meta?.user_name === 'string' && meta.user_name) ||
    (typeof meta?.full_name === 'string' &&
      String(meta.full_name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24));
  const emailLocal =
    user.email
      ?.split('@')[0]
      ?.replace(/[^a-zA-Z0-9_]/g, '_')
      .slice(0, 20) || 'user';
  const base = String(fromMeta || emailLocal).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24) || 'user';
  return `${base}_${user.id.slice(0, 8)}`;
}

/** Row for `insert` into `public.users` (matches your Supabase columns). */
export function buildUsersInsertRow(user: AuthUserLike) {
  const emailLocal = user.email?.split('@')[0] || 'user';
  const cityUuidId =
    typeof user.user_metadata?.city_uuid_id === 'string'
      ? user.user_metadata.city_uuid_id
      : null;

  return {
    id: user.id,
    email: user.email as string,
    username: defaultUsernameFromAuthUser(user),
    full_name:
      (user.user_metadata?.full_name as string | undefined) ||
      emailLocal ||
      'User',
    avatar_url: (user.user_metadata?.avatar_url as string | null) ?? null,
    bio: '',
    interests: [] as string[],
    theme: 'modern',
    city_uuid_id: cityUuidId,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
