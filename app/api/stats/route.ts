import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get letters received count
    const { count: lettersReceived } = await supabase
      .from('letters')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId);

    // Get letters sent count
    const { count: lettersSent } = await supabase
      .from('letters')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId)
      .neq('status', 'draft');

    // Get stamps collected count
    const { data: userStamps, error: stampsError } = await supabase
      .from('user_stamps')
      .select('id')
      .eq('user_id', userId);

    // Get total likes on user's letters
    const { data: likesData } = await supabase
      .from('letters')
      .select('likes')
      .eq('sender_id', userId);

    const totalLikes = likesData?.reduce((sum, letter) => sum + (letter.likes || 0), 0) || 0;

    return NextResponse.json({
      lettersReceived: lettersReceived || 0,
      lettersSent: lettersSent || 0,
      stampsCollected: userStamps?.length || 0,
      totalLikes,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
