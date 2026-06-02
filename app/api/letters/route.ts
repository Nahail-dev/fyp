import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { CityRowSchema } from '@/lib/citiesSchema';
import { calculateDelivery } from '@/lib/deliveryTime';
import { DEFAULT_STAMP_ID, getStampById } from '@/lib/stamps';

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

    return NextResponse.json({ letters }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new letter
export async function POST(request: NextRequest) {
  try {
    const {
      senderId,
      recipientId,
      title,
      content,
      status = 'draft',
      language = 'en',
      stampId = DEFAULT_STAMP_ID,
    } = await request.json();

    if (!senderId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
        p_title: title,
        p_content: content,
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

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
