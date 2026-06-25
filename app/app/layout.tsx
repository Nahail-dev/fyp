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
  Menu,
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
import { AccessibilityControls } from '@/components/accessibility-controls';
import { useAccessibility } from '@/components/accessibility-context';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppScreenLoader } from '@/components/app-screen-loader';

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
  const { t, language } = useAccessibility();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinkClass = (href: string) => {
    const isActive = href === '/app' ? pathname === href : pathname.startsWith(href);
    return `yuubin-app-nav-link flex min-h-11 items-center gap-3 rounded-sm px-4 py-2.5 text-foreground transition-colors ${
      isActive
        ? 'yuubin-app-nav-link-active border border-primary/30 bg-primary/15 text-primary shadow-sm'
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
      toast.success(t('signOutSuccess'));
      setUser(null);
      setUserMenuOpen(false);
      resetBrowserClient();
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/auth/login');
    } catch (error) {
      console.error('[app-layout] Sign out failed:', error);
      toast.error(t('signOutError'));
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
          } else {
            console.error('[app-layout] Profile request failed:', profile?.error || response.status);
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
        } else {
          setUser(null);
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('[app-layout] User loading failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <AppScreenLoader
          title={loading ? t('loading') : t('signingIn')}
          message={loading ? t('loadingYourData') : t('redirecting')}
        />
      </div>
    );
  }

  return (
    <div className="yuubin-app-shell flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`yuubin-sidebar yuubin-scrollbar-hidden fixed inset-y-0 left-0 z-50 lg:relative ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
      } ${
        sidebarOpen ? 'w-64' : 'lg:w-20'
      } h-screen shrink-0 overflow-y-auto overflow-x-hidden bg-card transition-all duration-300 flex flex-col border-r border-border`}>
        {/* Logo */}
        <div className="yuubin-sidebar-brand flex h-20 shrink-0 items-center justify-between border-b border-border px-5 md:h-24 md:px-6">
          {sidebarOpen && (
            <Link href="/app" className="flex items-center gap-2">
              <ThemeLogo className="[&_img]:h-8 [&_img]:w-14" textClassName="inline-block" />
            </Link>
          )}
          {!sidebarOpen && <ThemeLogo iconOnly />}
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 p-3 md:space-y-2 md:p-4">
          <Link
            href="/app"
            className={`${navLinkClass('/app')} group`}
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('dashboard')}</span>}
          </Link>

          <Link
            href="/app/inbox"
            className={navLinkClass('/app/inbox')}
          >
            <Inbox className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('inbox')}</span>}
          </Link>

          <Link
            href="/app/compose"
            className={navLinkClass('/app/compose')}
          >
            <PenTool className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('compose')}</span>}
          </Link>

          <Link
            href="/app/stamps"
            className={navLinkClass('/app/stamps')}
          >
            <Stamp className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('stamps')}</span>}
          </Link>

          <Link
            href="/app/explore"
            className={navLinkClass('/app/explore')}
          >
            <Compass className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('explore')}</span>}
          </Link>

          <Link
            href="/app/sent"
            className={navLinkClass('/app/sent')}
          >
            <Send className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('sent')}</span>}
          </Link>

          <Link
            href="/app/drafts"
            className={navLinkClass('/app/drafts')}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('drafts')}</span>}
          </Link>
        </nav>

        {/* Bottom Navigation */}
        <div className="yuubin-sidebar-footer mt-auto shrink-0 space-y-1.5 border-t border-border p-3 md:space-y-2 md:p-4">
          {sidebarOpen && (
            <div className="flex flex-col gap-2.5 py-3 border-b border-border mb-3 lg:hidden">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {language === 'ur' ? 'سائز اور زبان' : 'Text Size & Language'}
              </span>
              <AccessibilityControls />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">
                {language === 'ur' ? 'تھیم منتخب کریں' : 'Choose Theme'}
              </span>
              <ThemeSwitcher />
            </div>
          )}
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
                  <p className="text-xs leading-tight text-muted-foreground">{t('signedInAs')}</p>
                  <p className="break-words text-sm font-medium leading-tight text-foreground">{user.full_name}</p>
                </div>
              )}
            </Link>
          )}
          
          {(!user || loading) && (
            <Link
              href="/app/profile"
              className={navLinkClass('/app/profile')}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('profile')}</span>}
            </Link>
          )}

          <Link
            href="/app/settings"
            className={navLinkClass('/app/settings')}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('settings')}</span>}
          </Link>

          <button 
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-sm px-4 py-2.5 text-foreground transition-colors hover:bg-muted/50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="min-w-0 break-words font-medium leading-tight">{t('signOut')}</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mx-3 mb-3 shrink-0 rounded-sm border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted md:mx-4 md:mb-4"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="yuubin-topbar flex h-24 shrink-0 items-center border-b border-border bg-card px-4 md:px-8">
          <div className="flex w-full min-w-0 items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="rounded-sm border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground lg:hidden shrink-0 cursor-pointer"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <ThemeLogo className="min-w-0 shrink-0" />
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
              <NotificationCenter userId={user?.id ?? null} />
              <div className="hidden sm:block">
                <AccessibilityControls />
              </div>
              <div className="hidden lg:block">
                <ThemeSwitcher />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="yuubin-user-chip flex max-w-56 items-center gap-3 rounded-sm border border-border bg-card px-3 py-2 text-left transition hover:bg-muted/50"
                  aria-expanded={userMenuOpen}
                  aria-label={t('userMenuLabel')}
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
                  <span className="min-w-0 hidden sm:block">
                    <span className="block text-xs text-muted-foreground">
                      {t('welcomeBack')}
                    </span>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {loading ? t('loading') : user?.username || user?.full_name || t('yuubinUser')}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="yuubin-menu-popover absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-sm border border-border bg-card shadow-2xl">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate font-serif font-bold text-foreground">
                        {user?.username || user?.full_name || t('yuubinUser')}
                      </p>
                      <p className="truncate text-xs text-muted-foreground" dir="ltr">
                        {user?.email || t('signedIn')}
                      </p>
                    </div>

                    <div className="p-2">
                      {[
                        { href: '/app/profile', label: t('profile'), icon: User },
                        { href: '/app/settings', label: t('settings'), icon: Settings },
                        { href: '/release-notes', label: t('releaseNotes'), icon: Newspaper },
                        { href: '/privacy', label: t('privacyPolicy'), icon: Shield },
                        { href: '/terms', label: t('termsOfService'), icon: FileText },
                        { href: '/help', label: t('help'), icon: HelpCircle },
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
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="yuubin-app-content yuubin-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
