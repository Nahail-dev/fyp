import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();

export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const requestedUserId = request.nextUrl.searchParams.get('userId');
    if (requestedUserId && requestedUserId !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const userId = auth.user.id;

    const now = new Date().toISOString();

    const [
      lettersReceivedResult,
      lettersSentResult,
      draftsResult,
      inTransitResult,
      deliveredResult,
      unreadResult,
      stampsResult,
      likesResult,
      followersResult,
      followingResult,
      profileResult,
    ] = await Promise.all([
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .neq('status', 'draft'),
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .neq('status', 'draft'),
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .eq('status', 'draft'),
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .neq('status', 'draft')
        .gt('estimated_delivery_at', now),
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('status', 'delivered'),
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('status', 'delivered')
        .eq('is_read', false),
      supabase
        .from('user_stamps')
        .select('quantity')
        .eq('user_id', userId),
      supabase
        .from('letters')
        .select('likes')
        .eq('sender_id', userId),
      supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
      supabase
        .from('users')
        .select('id, username, full_name, avatar_url, bio, profile_visibility, city_uuid_id, created_at')
        .eq('id', userId)
        .maybeSingle(),
    ]);

    const totalLikes =
      likesResult.data?.reduce((sum, letter) => sum + (letter.likes || 0), 0) || 0;
    const stampsCollected =
      stampsResult.data?.reduce((sum, stamp) => sum + (stamp.quantity || 0), 0) || 0;

    return NextResponse.json({
      lettersReceived: lettersReceivedResult.count || 0,
      lettersSent: lettersSentResult.count || 0,
      drafts: draftsResult.count || 0,
      inTransit: inTransitResult.count || 0,
      delivered: deliveredResult.count || 0,
      unread: unreadResult.count || 0,
      stampsCollected,
      totalLikes,
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
      profile: profileResult.data ?? null,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
