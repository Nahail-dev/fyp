'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the callback based on the hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.log('[v0] Session error:', sessionError);
          router.push('/auth/login?error=session_failed');
          return;
        }

        if (!session) {
          console.log('[v0] No session found');
          router.push('/auth/login?error=no_session');
          return;
        }

        const user = session.user;
        console.log('[v0] Auth callback - User:', user);

        // Check if user profile exists, if not create it
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it with Google data
          console.log('[v0] Creating new profile from Google data');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email,
              avatar_url: user.user_metadata?.avatar_url || null,
              bio: '',
              location: '',
              interests: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.log('[v0] Error creating profile:', insertError);
          } else {
            console.log('[v0] Profile created successfully');
          }
        }

        // Redirect to app
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
