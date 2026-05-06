import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const interest = request.nextUrl.searchParams.get('interest');

    let query = supabase.from('profiles').select('*');

    // If userId provided, exclude self
    if (userId) {
      query = query.neq('id', userId);
    }

    // If interest provided, filter by interests (assuming interests is a JSON field)
    if (interest) {
      query = query.contains('interests', [interest]);
    }

    const { data: users, error } = await query.limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
