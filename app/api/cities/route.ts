import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { CityRowSchema, CitySearchQuerySchema } from '@/lib/citiesSchema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

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

    const search = parsed.data.search.replace(/[%_,]/g, '').trim();
    const { data, error } = await supabase
      .from('cities')
      .select(
        'uuid_id, id, city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, continent, timezone',
      )
      .or(`city.ilike.%${search}%,city_ascii.ilike.%${search}%`)
      .order('population', { ascending: false, nullsFirst: false })
      .limit(12);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cities = (data ?? [])
      .map((row) => CityRowSchema.safeParse(row))
      .filter((result) => result.success)
      .map((result) => result.data);

    return NextResponse.json({ cities }, { status: 200 });
  } catch (error) {
    console.error('[api/cities] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
