import { NextRequest, NextResponse } from 'next/server';
import { STAMPS, STARTING_COMMON_STAMPS } from '@/lib/stamps';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();

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
