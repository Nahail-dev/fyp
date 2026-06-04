'use client';

import Link from 'next/link';
import { Mail, Inbox, PenTool, User, Settings, LogOut, Stamp, Send, FileText, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient, resetBrowserClient } from '@/lib/supabaseClient';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ThemeLogo } from '@/components/theme-logo';
import { NotificationCenter } from '@/components/notification-center';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, full_name, email, avatar_url')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profileError) {
            console.log('[v0] Layout profile error:', profileError.message);
          } else if (profile) {
            setUser(profile);
            console.log('[v0] User profile loaded:', profile);
          }
        }
      } catch (error) {
        console.log('[v0] Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/app" className="flex items-center gap-2">
              <ThemeLogo className="[&_img]:h-8 [&_img]:w-14" />
            </Link>
          )}
          {!sidebarOpen && <ThemeLogo iconOnly />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/app"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors group"
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>

          <Link
            href="/app/inbox"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Inbox className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Inbox</span>}
          </Link>

          <Link
            href="/app/compose"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <PenTool className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Compose</span>}
          </Link>

          <Link
            href="/app/stamps"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Stamp className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Stamps</span>}
          </Link>

          <Link
            href="/app/explore"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Compass className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Explore</span>}
          </Link>

          <Link
            href="/app/sent"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Send className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sent</span>}
          </Link>

          <Link
            href="/app/drafts"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Drafts</span>}
          </Link>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border p-4 space-y-2">
          {!loading && user && (
            <Link
              href="/app/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors group"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-5 h-5 rounded-full flex-shrink-0 object-cover border border-primary/30 group-hover:border-primary transition-all"
                  title={user.full_name}
                />
              ) : (
                <User className="w-5 h-5 flex-shrink-0" />
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Signed in as</p>
                  <p className="font-medium text-sm text-foreground truncate">{user.full_name}</p>
                </div>
              )}
            </Link>
          )}
          
          <Link
            href="/app/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Profile</span>}
          </Link>

          <Link
            href="/app/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </Link>

          <button 
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success('Signed out successfully');
                setUser(null);
                resetBrowserClient();
                await new Promise((resolve) => setTimeout(resolve, 800));
                router.push('/auth/login');
              } catch (error) {
                console.log('[v0] Sign out error:', error);
                toast.error('Failed to sign out');
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mx-4 mb-4 px-4 py-2 rounded-sm border border-border hover:bg-muted text-sm text-muted-foreground transition-colors"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <ThemeLogo />
            <div className="flex items-center gap-6">
              <NotificationCenter userId={user?.id ?? null} />
              <ThemeSwitcher />
              <div className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : user ? `Welcome back, ${user.full_name}!` : 'Welcome back!'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
