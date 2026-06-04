import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
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

    // If userId provided, exclude self
    if (userId) {
      query = query.neq('id', userId);
    }

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

    return NextResponse.json({ users: usersWithCities }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
