import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { CityRowSchema, CitySearchQuerySchema } from '@/lib/citiesSchema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const CITY_SUGGESTION_SELECT =
  'uuid_id, id, city, city_ascii, country, admin_name, population';

export async function GET(request: NextRequest) {
  try {
    const cityId = request.nextUrl.searchParams.get('id');
    if (cityId) {
      const { data, error } = await supabase
        .from('cities')
        .select(
          'uuid_id, id, city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, continent, timezone',
        )
        .eq('uuid_id', cityId)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const parsed = CityRowSchema.safeParse(data);
      return NextResponse.json(
        { city: parsed.success ? parsed.data : null },
        { status: 200 },
      );
    }

    const parsed = CitySearchQuerySchema.safeParse({
      search: request.nextUrl.searchParams.get('search') ?? '',
    });

    if (!parsed.success) {
      return NextResponse.json({ cities: [] }, { status: 200 });
    }

    const search = parsed.data.search.replace(/[%_,()]/g, '').trim();
    const pattern = `${search}%`;

    const [cityResult, asciiResult] = await Promise.all([
      supabase
        .from('cities')
        .select(CITY_SUGGESTION_SELECT)
        .ilike('city', pattern)
        .order('population', { ascending: false, nullsFirst: false })
        .limit(8),
      supabase
        .from('cities')
        .select(CITY_SUGGESTION_SELECT)
        .ilike('city_ascii', pattern)
        .order('population', { ascending: false, nullsFirst: false })
        .limit(8),
    ]);

    if (cityResult.error || asciiResult.error) {
      console.error(
        '[api/cities] search error:',
        cityResult.error?.message || asciiResult.error?.message,
      );
    }

    const rowsById = new Map<string, NonNullable<typeof cityResult.data>[number]>();
    for (const row of [...(cityResult.data ?? []), ...(asciiResult.data ?? [])]) {
      rowsById.set(row.uuid_id, row);
    }

    const cities = Array.from(rowsById.values())
      .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
      .slice(0, 12)
      .map((row) => ({
        uuid_id: row.uuid_id,
        id: row.id,
        city: row.city,
        city_ascii: row.city_ascii,
        country: row.country,
        admin_name: row.admin_name,
        population: row.population,
      }));

    return NextResponse.json({ cities }, { status: 200 });
  } catch (error) {
    console.error('[api/cities] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
