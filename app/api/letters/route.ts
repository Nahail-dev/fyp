import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch user's letters
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type'); // inbox, sent, drafts

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    let query = supabase.from('letters').select('*');

    if (type === 'inbox') {
      query = query.eq('recipient_id', userId);
    } else if (type === 'sent') {
      query = query.eq('sender_id', userId).neq('status', 'draft');
    } else if (type === 'drafts') {
      query = query.eq('sender_id', userId).eq('status', 'draft');
    }

    const { data: letters, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ letters }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new letter
export async function POST(request: NextRequest) {
  try {
    const { senderId, recipientId, title, content, status = 'draft' } = await request.json();

    if (!senderId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId || null,
        title,
        content,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
