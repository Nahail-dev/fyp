import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

// ✅ Server-only Supabase client (ADMIN ACCESS)

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { email, password } = await request.json();

    // ✅ Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // =========================
    // 1. Get user
    // =========================
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, username, full_name, avatar_url, theme")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // =========================
    // 2. Get password hash
    // =========================
    const { data: passwordData, error: passError } = await supabase
      .from("passwords")
      .select("hashed_password")
      .eq("user_id", user.id)
      .single();

    if (passError || !passwordData) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // =========================
    // 3. Verify password
    // =========================
    const isMatch = await bcrypt.compare(
      password,
      passwordData.hashed_password,
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // =========================
    // 4. Success response
    // =========================
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          theme: user.theme,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
