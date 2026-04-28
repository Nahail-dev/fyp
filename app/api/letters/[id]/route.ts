import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch single letter
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: letter, error } = await supabase
      .from('letters')
      .select(`
        *,
        sender:sender_id(id, username, avatar_url),
        recipient:recipient_id(id, username, avatar_url),
        delivery_tracking(*),
        letter_comments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json({ letter }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update letter
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, content, status, recipientId } = await request.json();

    const updates: any = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (status) updates.status = status;
    if (recipientId) updates.recipient_id = recipientId;

    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
      updates.estimated_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ letter }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete letter
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Letter deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
