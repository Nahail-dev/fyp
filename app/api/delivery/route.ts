import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Get delivery tracking info
export async function GET(request: NextRequest) {
  try {
    const letterId = request.nextUrl.searchParams.get('letterId');

    if (!letterId) {
      return NextResponse.json(
        { error: 'Missing letterId' },
        { status: 400 }
      );
    }

    const { data: tracking, error } = await supabase
      .from('delivery_tracking')
      .select('*')
      .eq('letter_id', letterId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Tracking not found' }, { status: 404 });
    }

    return NextResponse.json({ tracking }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create delivery tracking
export async function POST(request: NextRequest) {
  try {
    const { letterId, status = 'pending' } = await request.json();

    if (!letterId) {
      return NextResponse.json(
        { error: 'Missing letterId' },
        { status: 400 }
      );
    }

    const { data: tracking, error } = await supabase
      .from('delivery_tracking')
      .insert({
        letter_id: letterId,
        current_status: status,
        progress_percentage: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tracking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update delivery status
export async function PATCH(request: NextRequest) {
  try {
    const { letterId, status, progress, location } = await request.json();

    if (!letterId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updates: any = {
      current_status: status,
      last_update: new Date().toISOString(),
    };

    if (progress !== undefined) updates.progress_percentage = progress;
    if (location) updates.location = location;

    if (status === 'delivered') {
      updates.progress_percentage = 100;
      // Update letter as delivered
      await supabase
        .from('letters')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', letterId);
    }

    const { data: tracking, error } = await supabase
      .from('delivery_tracking')
      .update(updates)
      .eq('letter_id', letterId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tracking }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
