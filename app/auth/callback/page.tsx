'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.log('[v0] Session error:', sessionError);
          router.push('/auth/login?error=session_failed');
          return;
        }

        if (!session?.access_token) {
          console.log('[v0] No session found');
          router.push('/auth/login?error=no_session');
          return;
        }

        console.log('[v0] Auth callback - User:', session.user);

        const ensureRes = await fetch('/api/profile/ensure', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!ensureRes.ok) {
          const body = await ensureRes.json().catch(() => ({}));
          console.log('[v0] Profile ensure failed:', body);
        }

        router.push('/app');
      } catch (error) {
        console.log('[v0] Callback error:', error);
        router.push('/auth/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">Completing your sign in...</p>
      </div>
    </div>
  );
}
