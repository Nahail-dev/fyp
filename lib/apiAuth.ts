import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

export async function getVerifiedAuthUser(request: NextRequest) {
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
