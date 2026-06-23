import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { syncLetterDeliveries } from '@/lib/deliveryNotifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

async function getVerifiedAuthUser(request: NextRequest) {
  const bearer = getBearerToken(request);
  if (!bearer) {
    return { error: 'Unauthorized' as const, status: 401 };
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(bearer);

  if (error || !user) {
    return { error: 'Unauthorized' as const, status: 401 };
  }

  return { user };
}

function hasLetterArrived(letter: {
  status?: string | null;
  delivered_at?: string | null;
  estimated_delivery_at?: string | null;
}) {
  if (letter.status === 'delivered' || letter.delivered_at) return true;
  if (!letter.estimated_delivery_at) return false;
  return new Date(letter.estimated_delivery_at).getTime() <= Date.now();
}

// GET - Fetch single letter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await syncLetterDeliveries(supabase, auth.user.id);

    const { data: letter, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    const isSender = letter.sender_id === auth.user.id;
    const isRecipient = letter.recipient_id === auth.user.id;

    if (!isSender && !isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
          content: isSender || hasLetterArrived(letter) ? letter.content : '',
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
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data: existingLetter, error: lookupError } = await supabase
      .from('letters')
      .select('id, sender_id, recipient_id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError || !existingLetter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    if (
      existingLetter.sender_id !== auth.user.id &&
      existingLetter.recipient_id !== auth.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      content,
      status,
      recipientId,
      language,
      stampId,
      isRead,
      action,
    } = body;

    if (action === 'sync-delivery') {
      await syncLetterDeliveries(supabase, auth.user.id);
      const { data: letter, error } = await supabase
        .from('letters')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !letter) {
        return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
      }

      return NextResponse.json({ letter }, { status: 200 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (existingLetter.recipient_id === auth.user.id) {
      if (typeof isRead !== 'boolean') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data: letter, error } = await supabase
        .from('letters')
        .update({
          is_read: isRead,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('recipient_id', auth.user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ letter }, { status: 200 });
    }

    if (existingLetter.sender_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (typeof title === 'string') updates.title = title.trim() || 'Untitled Draft';
    if (typeof content === 'string') updates.content = content;
    if (typeof status === 'string') updates.status = status;
    if (Object.prototype.hasOwnProperty.call(body, 'recipientId')) {
      updates.recipient_id = recipientId || null;
    }
    if (typeof language === 'string') updates.language = language;
    if (typeof stampId === 'string') updates.stamp_id = stampId;
    if (typeof isRead === 'boolean') updates.is_read = isRead;

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
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data: letter, error: lookupError } = await supabase
      .from('letters')
      .select('id, sender_id, recipient_id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    if (letter.sender_id !== auth.user.id && letter.recipient_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
