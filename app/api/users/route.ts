import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();

export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = auth.user.id;
    const interest = request.nextUrl.searchParams.get('interest');
    const search = request.nextUrl.searchParams.get('search')?.trim();
    const publicOnly = request.nextUrl.searchParams.get('publicOnly') === 'true';

    let query = supabase
      .from('users')
      .select(
        'id, username, full_name, bio, interests, avatar_url, city_uuid_id, profile_visibility, is_active',
      )
      .eq('is_active', true);

    if (publicOnly) {
      query = query.eq('profile_visibility', 'public');
    }

    query = query.neq('id', userId);

    // If interest provided, filter by interests (assuming interests is a JSON field)
    if (interest) {
      query = query.contains('interests', [interest]);
    }

    if (search) {
      const safeSearch = search.replace(/[%_,]/g, '');
      query = query.ilike('username', `%${safeSearch}%`);
    }

    const { data: users, error } = await query.limit(publicOnly ? 60 : 20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cityIds = Array.from(
      new Set((users ?? []).map((user) => user.city_uuid_id).filter(Boolean)),
    );
    const { data: cities } =
      cityIds.length > 0
        ? await supabase
            .from('cities')
            .select('uuid_id, city, country, admin_name')
            .in('uuid_id', cityIds)
        : { data: [] };

    const usersWithCities = (users ?? []).map((user) => ({
      ...user,
      city:
        cities?.find((city) => city.uuid_id === user.city_uuid_id) ?? null,
    }));

    const userIds = (users ?? []).map((user) => user.id);
    const [{ data: currentFollows }, { data: followerRows }, { data: followingRows }] =
      userIds.length > 0
        ? await Promise.all([
            userId
              ? supabase
                  .from('user_follows')
                  .select('following_id')
                  .eq('follower_id', userId)
                  .in('following_id', userIds)
              : Promise.resolve({ data: [] }),
            supabase
              .from('user_follows')
              .select('following_id')
              .in('following_id', userIds),
            supabase
              .from('user_follows')
              .select('follower_id')
              .in('follower_id', userIds),
          ])
        : [{ data: [] }, { data: [] }, { data: [] }];

    const followingSet = new Set(
      currentFollows?.map((follow) => follow.following_id) ?? [],
    );
    const followerCountByUser = new Map<string, number>();
    for (const row of followerRows ?? []) {
      followerCountByUser.set(
        row.following_id,
        (followerCountByUser.get(row.following_id) ?? 0) + 1,
      );
    }
    const followingCountByUser = new Map<string, number>();
    for (const row of followingRows ?? []) {
      followingCountByUser.set(
        row.follower_id,
        (followingCountByUser.get(row.follower_id) ?? 0) + 1,
      );
    }

    return NextResponse.json(
      {
        users: usersWithCities.map((user) => ({
          ...user,
          is_following: followingSet.has(user.id),
          follower_count: followerCountByUser.get(user.id) ?? 0,
          following_count: followingCountByUser.get(user.id) ?? 0,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
