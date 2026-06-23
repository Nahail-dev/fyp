import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/apiAuth';
import { syncLetterDeliveries } from '@/lib/deliveryNotifications';

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function runDeliveryJob(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncLetterDeliveries(getServiceSupabase());
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[cron/deliver-letters] job failed', error);
    return NextResponse.json(
      { error: 'Delivery job failed' },
      { status: 500 },
    );
  }
}

export const GET = runDeliveryJob;
export const POST = runDeliveryJob;
