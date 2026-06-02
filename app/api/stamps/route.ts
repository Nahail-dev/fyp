import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { STAMPS, STARTING_COMMON_STAMPS, getStampById } from '@/lib/stamps';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type');

    if (type === 'collected' && userId) {
      const { data: userStamps, error } = await supabase
        .from('user_stamp_inventory')
        .select('stamp_id, quantity, updated_at')
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const inventory = new Map(
        (userStamps ?? []).map((userStamp) => [
          String(userStamp.stamp_id),
          {
            quantity: Number(userStamp.quantity ?? 0),
            updatedAt: userStamp.updated_at ?? null,
          },
        ]),
      );

      const stamps = STAMPS.map((stamp) => ({
        ...stamp,
        image_url: stamp.image,
        obtained: (inventory.get(stamp.id)?.quantity ?? 0) > 0,
        count: inventory.get(stamp.id)?.quantity ?? 0,
        unlocked_at: inventory.get(stamp.id)?.updatedAt ?? null,
      }));

      return NextResponse.json({ stamps }, { status: 200 });
    }

    return NextResponse.json(
      {
        stamps: STAMPS.map((stamp) => ({
          ...stamp,
          image_url: stamp.image,
          obtained: stamp.rarity === 'common',
          count: stamp.rarity === 'common' ? STARTING_COMMON_STAMPS : 0,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, stampId } = await request.json();

    if (!userId || !stampId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const stamp = getStampById(stampId);
    if (stamp.id !== stampId) {
      return NextResponse.json({ error: 'Invalid stamp id' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('user_stamp_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('stamp_id', stamp.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const nextQuantity = Number(existing?.quantity ?? 0) + 1;
    const { data: userStamp, error } = await supabase
      .from('user_stamp_inventory')
      .upsert(
        {
        user_id: userId,
        stamp_id: stamp.id,
        quantity: nextQuantity,
        updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,stamp_id',
        },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ userStamp }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
