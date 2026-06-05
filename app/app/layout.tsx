'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Compass,
  FileText,
  HelpCircle,
  Inbox,
  LogOut,
  Mail,
  Newspaper,
  PenTool,
  Send,
  Settings,
  Shield,
  Stamp,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient, resetBrowserClient } from '@/lib/supabaseClient';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ThemeLogo } from '@/components/theme-logo';
import { NotificationCenter } from '@/components/notification-center';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string;
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const navLinkClass = (href: string) => {
    const isActive = href === '/app' ? pathname === href : pathname.startsWith(href);
    return `flex items-center gap-3 rounded-sm px-4 py-3 text-foreground transition-colors ${
      isActive
        ? 'border border-primary/30 bg-primary/15 text-primary shadow-sm'
        : 'hover:bg-muted/50'
    }`;
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Signed out successfully');
      setUser(null);
      setUserMenuOpen(false);
      resetBrowserClient();
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/auth/login');
    } catch (error) {
      console.log('[v0] Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const headers: HeadersInit = {};
          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }

          const response = await fetch('/api/profile', {
            credentials: 'include',
            headers,
          });
          const profile = await response.json().catch(() => null);

          if (response.ok && profile) {
            setUser({
              id: profile.id,
              username: profile.username || '',
              full_name: profile.full_name || '',
              email: profile.email || authUser.email || '',
              avatar_url: profile.avatar_url || null,
            });
            console.log('[v0] User profile loaded:', profile);
          } else {
            console.log('[v0] Layout profile error:', profile?.error || response.status);
            setUser({
              id: authUser.id,
              username:
                authUser.user_metadata?.username ||
                authUser.email?.split('@')[0] ||
                '',
              full_name: authUser.user_metadata?.full_name || '',
              email: authUser.email || '',
              avatar_url: authUser.user_metadata?.avatar_url || null,
            });
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} h-screen shrink-0 overflow-hidden bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex h-24 shrink-0 items-center justify-between border-b border-border px-6">
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
            className={`${navLinkClass('/app')} group`}
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>

          <Link
            href="/app/inbox"
            className={navLinkClass('/app/inbox')}
          >
            <Inbox className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Inbox</span>}
          </Link>

          <Link
            href="/app/compose"
            className={navLinkClass('/app/compose')}
          >
            <PenTool className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Compose</span>}
          </Link>

          <Link
            href="/app/stamps"
            className={navLinkClass('/app/stamps')}
          >
            <Stamp className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Stamps</span>}
          </Link>

          <Link
            href="/app/explore"
            className={navLinkClass('/app/explore')}
          >
            <Compass className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Explore</span>}
          </Link>

          <Link
            href="/app/sent"
            className={navLinkClass('/app/sent')}
          >
            <Send className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sent</span>}
          </Link>

          <Link
            href="/app/drafts"
            className={navLinkClass('/app/drafts')}
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
              className={`${navLinkClass('/app/profile')} group`}
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
            className={navLinkClass('/app/profile')}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Profile</span>}
          </Link>

          <Link
            href="/app/settings"
            className={navLinkClass('/app/settings')}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </Link>

          <button 
            onClick={handleSignOut}
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
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-24 shrink-0 items-center border-b border-border bg-card px-8">
          <div className="flex w-full min-w-0 items-center justify-between gap-6">
            <ThemeLogo className="min-w-0 shrink-0" />
            <div className="flex min-w-0 items-center justify-end gap-6">
              <NotificationCenter userId={user?.id ?? null} />
              <ThemeSwitcher />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex max-w-56 items-center gap-3 rounded-sm border border-border bg-card px-3 py-2 text-left transition hover:bg-muted/50"
                  aria-expanded={userMenuOpen}
                  aria-label="Open user menu"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-8 w-8 shrink-0 rounded-full border border-primary/30 object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      Welcome back
                    </span>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {loading ? 'Loading...' : user?.username || user?.full_name || 'Yuubin user'}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-sm border border-border bg-card shadow-2xl">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate font-serif font-bold text-foreground">
                        {user?.username || user?.full_name || 'Yuubin user'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email || 'Signed in'}
                      </p>
                    </div>

                    <div className="p-2">
                      {[
                        { href: '/app/profile', label: 'Profile', icon: User },
                        { href: '/app/settings', label: 'Settings', icon: Settings },
                        { href: '/updates', label: 'Updates', icon: Newspaper },
                        { href: '/privacy', label: 'Privacy Policy', icon: Shield },
                        { href: '/terms', label: 'Terms of Service', icon: FileText },
                        { href: '/help', label: 'Help', icon: HelpCircle },
                      ].map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-foreground transition hover:bg-muted/50"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="yuubin-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
