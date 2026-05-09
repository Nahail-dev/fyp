import { createClient } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.log('[v0] Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, bio, location, interests, avatar_url } = body;

    console.log('[v0] Updating profile for user:', user.id, body);

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: full_name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        interests: interests || undefined,
        avatar_url: avatar_url || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.log('[v0] Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[v0] Profile updated successfully:', profile);
    return NextResponse.json(profile);
  } catch (error) {
    console.log('[v0] Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
