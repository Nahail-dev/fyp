import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        username,
        full_name,
        avatar_url,
        bio,
        interests,
        theme,
        created_at,
        updated_at,
        user_stamps(*),
        user_follows!follower_id(id),
        user_follows!following_id(id)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { fullName, bio, interests, avatarUrl, theme } = await request.json();

    const updates: any = {};
    if (fullName) updates.full_name = fullName;
    if (bio) updates.bio = bio;
    if (interests) updates.interests = interests;
    if (avatarUrl) updates.avatar_url = avatarUrl;
    if (theme) updates.theme = theme;
    updates.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
