import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch all stamps or user's stamps
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type'); // all or collected

    if (type === 'collected' && userId) {
      // Get stamps collected by user
      const { data: userStamps, error } = await supabase
        .from('user_stamps')
        .select('stamp_id, stamps(*), unlocked_at')
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ stamps: userStamps }, { status: 200 });
    }

    // Get all stamps
    const { data: stamps, error } = await supabase
      .from('stamps')
      .select('*')
      .order('rarity', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stamps }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Unlock stamp for user
export async function POST(request: NextRequest) {
  try {
    const { userId, stampId } = await request.json();

    if (!userId || !stampId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: userStamp, error } = await supabase
      .from('user_stamps')
      .insert({
        user_id: userId,
        stamp_id: stampId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Stamp already collected' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ userStamp }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
