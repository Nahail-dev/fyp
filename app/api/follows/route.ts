import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();

export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const targetUserId = request.nextUrl.searchParams.get('targetUserId');
    const { data: follows, error } = await supabase
      .from('user_follows')
      .select('id, follower_id, following_id, created_at')
      .eq('follower_id', auth.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (targetUserId) {
      return NextResponse.json({
        following: (follows ?? []).some((follow) => follow.following_id === targetUserId),
      });
    }

    return NextResponse.json({ follows: follows ?? [] });
  } catch (error) {
    console.log('[api/follows GET] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId : '';
    if (!targetUserId || targetUserId === auth.user.id) {
      return NextResponse.json({ error: 'Invalid follow target' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', auth.user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existing.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ following: false });
    }

    const { error } = await supabase.from('user_follows').insert({
      follower_id: auth.user.id,
      following_id: targetUserId,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ following: true }, { status: 201 });
  } catch (error) {
    console.log('[api/follows POST] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
