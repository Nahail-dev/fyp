import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { USERS_PROFILE_SELECT } from '@/lib/usersSchema';

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

async function createCookieSupabase(request: NextRequest) {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore
          }
        },
      },
    },
  );
}

/** Who is calling — from Bearer JWT or Supabase cookies. Does not use service role. */
async function getVerifiedAuthUser(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const bearer = getBearerToken(request);

  if (bearer) {
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(bearer);
    if (error || !user) {
      return { error: 'Unauthorized' as const, status: 401 };
    }
    return { user };
  }

  const supabase = await createCookieSupabase(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: 'Unauthorized' as const, status: 401 };
  }
  return { user };
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapRowToProfile(
  raw: Record<string, unknown>,
  fallbackEmail: string | null | undefined,
) {
  return {
    id: raw.id as string,
    email: (raw.email as string) ?? fallbackEmail ?? '',
    username: (raw.username as string) ?? '',
    full_name: (raw.full_name as string) ?? '',
    bio: (raw.bio as string) ?? '',
    avatar_url: (raw.avatar_url as string | null) ?? null,
    interests: Array.isArray(raw.interests) ? (raw.interests as string[]) : [],
    theme: (raw.theme as string) ?? 'modern',
    is_active: (raw.is_active as boolean) ?? true,
    created_at: (raw.created_at as string) ?? new Date().toISOString(),
    updated_at:
      (raw.updated_at as string) ??
      (raw.created_at as string) ??
      new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let admin;
    try {
      admin = getServiceSupabase();
    } catch (e) {
      console.error('[api/profile GET]', e);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    const { data: rawProfile, error } = await admin
      .from('users')
      .select(USERS_PROFILE_SELECT)
      .eq('id', auth.user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!rawProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(
      mapRowToProfile(rawProfile as Record<string, unknown>, auth.user.email),
    );
  } catch (error) {
    console.log('[v0] Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { full_name, bio, interests, avatar_url } = body;

    console.log('[v0] Updating profile for user:', auth.user.id, body);

    const updatePayload: Record<string, unknown> = {
      full_name: full_name || undefined,
      bio: bio || undefined,
      interests: interests || undefined,
      avatar_url: avatar_url || undefined,
      updated_at: new Date().toISOString(),
    };

    let admin;
    try {
      admin = getServiceSupabase();
    } catch (e) {
      console.error('[api/profile PUT]', e);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    const { data: profile, error } = await admin
      .from('users')
      .update(updatePayload)
      .eq('id', auth.user.id)
      .select(USERS_PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      console.log('[v0] Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'No profile row for this user' },
        { status: 404 },
      );
    }

    console.log('[v0] Profile updated successfully:', profile);
    return NextResponse.json(
      mapRowToProfile(profile as Record<string, unknown>, auth.user.email),
    );
  } catch (error) {
    console.log('[v0] Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
