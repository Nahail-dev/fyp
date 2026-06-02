import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { buildUsersInsertRow } from '@/lib/usersSchema';

/**
 * Creates `public.users` when missing. Uses service role so RLS does not block
 * the insert; caller must prove identity via Bearer JWT (validated with anon client).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const jwt =
      authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!jwt) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      console.error('[profile/ensure] SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(jwt);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, created: false });
    }

    let insertRow = buildUsersInsertRow(user);
    let { error: insertError } = await admin.from('users').insert(insertRow);

    if (insertError?.code === '23505') {
      insertRow = {
        ...insertRow,
        username: `user_${user.id.replace(/-/g, '')}`,
      };
      ({ error: insertError } = await admin.from('users').insert(insertRow));
    }

    if (insertError) {
      console.log('[profile/ensure] insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, created: true });
  } catch (e) {
    console.log('[profile/ensure] error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
