import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch single letter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: letter, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    const userIds = [letter.sender_id, letter.recipient_id].filter(Boolean);
    const cityIds = [
      letter.sender_city_uuid_id,
      letter.recipient_city_uuid_id,
    ].filter(Boolean);

    const [{ data: users }, { data: cities }] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from('users')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds)
        : Promise.resolve({ data: [] }),
      cityIds.length > 0
        ? supabase
            .from('cities')
            .select('uuid_id, city, country, admin_name')
            .in('uuid_id', cityIds)
        : Promise.resolve({ data: [] }),
    ]);

    const sender = users?.find((user) => user.id === letter.sender_id) ?? null;
    const recipient =
      users?.find((user) => user.id === letter.recipient_id) ?? null;
    const sender_city =
      cities?.find((city) => city.uuid_id === letter.sender_city_uuid_id) ??
      null;
    const recipient_city =
      cities?.find((city) => city.uuid_id === letter.recipient_city_uuid_id) ??
      null;

    return NextResponse.json(
      {
        letter: {
          ...letter,
          sender,
          recipient,
          sender_city,
          recipient_city,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update letter
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
