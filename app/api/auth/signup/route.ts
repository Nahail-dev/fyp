import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { email, username, fullName, password } = await request.json();

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        full_name: fullName || username,
      })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Store password
    const { error: passwordError } = await supabase
      .from('passwords')
      .insert({
        user_id: user.id,
        hashed_password: hashedPassword,
      });

    if (passwordError) {
      return NextResponse.json(
        { error: 'Failed to set password' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { user: { id: user.id, email: user.email, username: user.username } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
