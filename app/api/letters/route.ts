import { NextRequest, NextResponse } from 'next/server';
import { CityRowSchema } from '@/lib/citiesSchema';
import { calculateDelivery } from '@/lib/deliveryTime';
import { DEFAULT_STAMP_ID, getStampById } from '@/lib/stamps';
import { syncLetterDeliveries } from '@/lib/deliveryNotifications';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();

type LetterRow = {
  sender_id?: string | null;
  recipient_id?: string | null;
  [key: string]: unknown;
};

type UserProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

async function attachLetterProfiles(letters: LetterRow[] | null) {
  if (!letters?.length) return letters;

  const userIds = Array.from(
    new Set(
      letters
        .flatMap((letter) => [letter.sender_id, letter.recipient_id])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (!userIds.length) return letters;

  const { data: profiles, error } = await supabase
    .from('users')
    .select('id, username, full_name, avatar_url')
    .in('id', userIds);

  if (error) {
    console.log('[api/letters] profile lookup failed:', error);
    return letters;
  }

  const profileById = new Map(
    (profiles as UserProfile[] | null)?.map((profile) => [profile.id, profile]) ?? [],
  );

  return letters.map((letter) => ({
    ...letter,
    sender_profile: letter.sender_id ? profileById.get(letter.sender_id) ?? null : null,
    recipient_profile: letter.recipient_id ? profileById.get(letter.recipient_id) ?? null : null,
  }));
}

// GET - Fetch user's letters
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
    const type = request.nextUrl.searchParams.get('type'); // inbox, sent, drafts

    if (!['inbox', 'sent', 'drafts'].includes(type ?? '')) {
      return NextResponse.json(
        { error: 'Invalid letter type' },
        { status: 400 }
      );
    }

    try {
      await syncLetterDeliveries(supabase, userId);
    } catch (deliverySyncError) {
      console.log('[api/letters] delivery sync failed:', deliverySyncError);
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
      if (error.message?.includes("'language' column")) {
        return NextResponse.json(
          {
            error:
              "Database is missing letters.language. Run: alter table letters add column if not exists language text default 'en';",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const lettersWithProfiles = await attachLetterProfiles(letters);

    return NextResponse.json({ letters: lettersWithProfiles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new letter
export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const {
      senderId,
      recipientId,
      title,
      content,
      status = 'draft',
      language = 'en',
      stampId = DEFAULT_STAMP_ID,
    } = await request.json();

    if (senderId !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const normalizedTitle =
      typeof title === 'string' && title.trim() ? title.trim() : 'Untitled Draft';
    const normalizedContent = typeof content === 'string' ? content : '';

    if (!senderId || (status !== 'draft' && (!normalizedTitle || !normalizedContent))) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (recipientId && senderId === recipientId) {
      return NextResponse.json(
        { error: 'You cannot send a letter to yourself' },
        { status: 400 },
      );
    }

    if (status !== 'draft' && !recipientId) {
      return NextResponse.json(
        { error: 'Recipient is required before sending a letter' },
        { status: 400 },
      );
    }

    const selectedStamp = getStampById(stampId);
    let deliveryPayload: {
      sender_city_uuid_id?: string;
      recipient_city_uuid_id?: string;
      delivery_rule?: string;
      delivery_hours?: number;
      sent_at?: string;
      estimated_delivery_at?: string;
    } = {};

    if (status !== 'draft') {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, city_uuid_id')
        .in('id', [senderId, recipientId]);

      if (usersError) {
        return NextResponse.json({ error: usersError.message }, { status: 500 });
      }

      const sender = users?.find((user) => user.id === senderId);
      const recipient = users?.find((user) => user.id === recipientId);

      if (!sender?.city_uuid_id) {
        return NextResponse.json(
          { error: 'Please set your city before sending letters' },
          { status: 400 },
        );
      }

      if (!recipient?.city_uuid_id) {
        return NextResponse.json(
          { error: 'Recipient has not set their city yet' },
          { status: 400 },
        );
      }

      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select(
          'uuid_id, id, city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, continent, timezone',
        )
        .in('uuid_id', [sender.city_uuid_id, recipient.city_uuid_id]);

      if (citiesError) {
        return NextResponse.json({ error: citiesError.message }, { status: 500 });
      }

      const senderCityResult = CityRowSchema.safeParse(
        cities?.find((city) => city.uuid_id === sender.city_uuid_id),
      );
      const recipientCityResult = CityRowSchema.safeParse(
        cities?.find((city) => city.uuid_id === recipient.city_uuid_id),
      );

      if (!senderCityResult.success || !recipientCityResult.success) {
        return NextResponse.json(
          { error: 'Could not read city details for delivery calculation' },
          { status: 500 },
        );
      }

      const sentAt = new Date();
      const delivery = calculateDelivery(
        senderCityResult.data,
        recipientCityResult.data,
        sentAt,
      );

      deliveryPayload = {
        sender_city_uuid_id: senderCityResult.data.uuid_id,
        recipient_city_uuid_id: recipientCityResult.data.uuid_id,
        delivery_rule: delivery.deliveryRule,
        delivery_hours: delivery.deliveryHours,
        sent_at: sentAt.toISOString(),
        estimated_delivery_at: delivery.estimatedDeliveryAt,
      };
    }

    const { data: letter, error } = await supabase
      .rpc('send_letter_with_stamp', {
        p_sender_id: senderId,
        p_recipient_id: recipientId || null,
        p_title: normalizedTitle,
        p_content: normalizedContent,
        p_status: status,
        p_language: language,
        p_stamp_id: selectedStamp.id,
        p_sender_city_uuid_id: deliveryPayload.sender_city_uuid_id ?? null,
        p_recipient_city_uuid_id: deliveryPayload.recipient_city_uuid_id ?? null,
        p_delivery_rule: deliveryPayload.delivery_rule ?? null,
        p_delivery_hours: deliveryPayload.delivery_hours ?? null,
        p_sent_at: deliveryPayload.sent_at ?? null,
        p_estimated_delivery_at: deliveryPayload.estimated_delivery_at ?? null,
      });

    if (error) {
      if (error.message?.includes('send_letter_with_stamp')) {
        return NextResponse.json(
          {
            error:
              'Database stamp transfer function is missing. Run report/supabase-stamp-inventory.sql in Supabase SQL Editor.',
          },
          { status: 500 },
        );
      }

      if (error.message?.includes("'stamp_id' column")) {
        return NextResponse.json(
          {
            error:
              "Database is missing letters.stamp_id. Run: alter table letters add column if not exists stamp_id text default 'yuubin-common';",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (status !== 'draft' && recipientId && letter?.id) {
      const { data: senderProfile } = await supabase
        .from('users')
        .select('full_name, username')
        .eq('id', senderId)
        .maybeSingle();

      const senderName =
        senderProfile?.full_name || senderProfile?.username || 'Someone';

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'letter_in_transit',
          title: 'New letter is on its way',
          message: `${senderName} sent you a letter. It will open when it arrives.`,
          related_user_id: senderId,
          related_letter_id: letter.id,
        });

      if (notificationError) {
        console.log('[api/letters] notification insert failed:', notificationError);
      }
    }

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId, syncDelivered = false } = await request.json();
    if (userId && userId !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (syncDelivered) {
      const result = await syncLetterDeliveries(supabase, auth.user.id);
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
