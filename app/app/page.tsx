'use client';

import {
  Archive,
  Calendar,
  Eye,
  Heart,
  Mail,
  PenTool,
  Reply,
  Send,
  Sparkles,
  Stamp,
  UserRound,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { AppScreenLoader } from '@/components/app-screen-loader';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useAccessibility } from '@/components/accessibility-context';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface Letter {
  id: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  content: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'draft';
  likes: number | null;
  created_at: string;
  estimated_delivery_at?: string | null;
  is_read?: boolean | null;
  sender_profile?: UserProfile | null;
}

interface DashboardProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  profile_visibility: 'public' | 'private' | null;
  created_at: string | null;
}

interface Stats {
  lettersReceived: number;
  lettersSent: number;
  drafts: number;
  inTransit: number;
  delivered: number;
  unread: number;
  stampsCollected: number;
  totalLikes: number;
  followers: number;
  following: number;
  profile: DashboardProfile | null;
}

const emptyStats: Stats = {
  lettersReceived: 0,
  lettersSent: 0,
  drafts: 0,
  inTransit: 0,
  delivered: 0,
  unread: 0,
  stampsCollected: 0,
  totalLikes: 0,
  followers: 0,
  following: 0,
  profile: null,
};

const getStatusColor = (status: Letter['status']) => {
  switch (status) {
    case 'delivered':
      return 'border-accent/40 bg-accent/15 text-accent';
    case 'in-transit':
      return 'border-status-transit/40 bg-status-transit/15 text-status-transit';
    case 'pending':
      return 'border-status-pending/40 bg-status-pending/15 text-status-pending';
    case 'draft':
      return 'border-muted bg-muted/40 text-muted-foreground';
  }
};

const getStatusKey = (status: Letter['status']) => {
  switch (status) {
    case 'delivered':
      return 'deliveredStatus';
    case 'in-transit':
      return 'inTransitStatus';
    case 'pending':
      return 'pendingStatus';
    case 'draft':
      return 'draftStatus';
  }
};

const formatDate = (dateValue: string | null | undefined, fallback: string) => {
  if (!dateValue) return fallback;
  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function Dashboard() {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useAccessibility();
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { stats: emptyStats, letters: [] as Letter[] };
      }

      const [statsResponse, lettersResponse] = await Promise.all([
        authenticatedFetch(`/api/stats?userId=${user.id}`),
        authenticatedFetch(`/api/letters?userId=${user.id}&type=inbox`),
      ]);

      const statsData = await statsResponse.json().catch(() => emptyStats);
      const lettersData = await lettersResponse.json().catch(() => ({ letters: [] }));

      return {
        stats: statsResponse.ok ? { ...emptyStats, ...statsData } : emptyStats,
        letters:
          lettersResponse.ok && lettersData.letters
            ? (lettersData.letters as Letter[]).slice(0, 6)
            : [],
      };
    },
  });

  const stats = dashboardQuery.data?.stats ?? emptyStats;
  const letters = dashboardQuery.data?.letters ?? [];

  if (dashboardQuery.isLoading) {
    return <AppScreenLoader title={t('dashboard')} message={t('loadingYourData')} />;
  }

  const displayName =
    stats.profile?.full_name || stats.profile?.username || t('yuubinUser');
  const username = stats.profile?.username ? `@${stats.profile.username}` : t('completeProfile');
  const joinedDate = stats.profile?.created_at
    ? formatDate(stats.profile.created_at, t('unknownDate'))
    : t('newMember');
  const totalLetters = stats.lettersReceived + stats.lettersSent;
  const profileVisibility =
    stats.profile?.profile_visibility === 'private' ? t('privateProfile') : t('publicProfile');

  const primaryStats = [
    {
      label: t('lettersReceived'),
      value: stats.lettersReceived,
      icon: Mail,
      color: 'text-primary',
      href: '/app/inbox',
    },
    {
      label: t('lettersSent'),
      value: stats.lettersSent,
      icon: Send,
      color: 'text-secondary',
      href: '/app/sent',
    },
    {
      label: t('followers'),
      value: stats.followers,
      icon: Users,
      color: 'text-accent',
      href: '/app/explore',
    },
    {
      label: t('following'),
      value: stats.following,
      icon: UserRound,
      color: 'text-status-transit',
      href: '/app/explore',
    },
  ];

  const detailStats = [
    { label: t('unread'), value: stats.unread, icon: Eye },
    { label: t('inTransit'), value: stats.inTransit, icon: Sparkles },
    { label: t('delivered'), value: stats.delivered, icon: Archive },
    { label: t('drafts'), value: stats.drafts, icon: PenTool },
    { label: t('stamps'), value: stats.stampsCollected, icon: Stamp },
    { label: t('likes'), value: stats.totalLikes, icon: Heart },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="yuubin-dashboard-hero postal-card p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {stats.profile?.avatar_url ? (
                <img
                  src={stats.profile.avatar_url}
                  alt={displayName}
                  className="h-16 w-16 rounded-full border border-primary/30 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  <UserRound className="h-7 w-7" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{t('welcomeBack')}</p>
                <h2 className="font-serif text-3xl font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-primary">{username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm md:min-w-64">
              <div className="rounded-sm border border-border bg-background/40 p-3">
                <p className="text-muted-foreground">{t('visibility')}</p>
                <p className="font-serif font-bold text-foreground">{profileVisibility}</p>
              </div>
              <div className="rounded-sm border border-border bg-background/40 p-3">
                <p className="text-muted-foreground">{t('joined')}</p>
                <p className="font-serif font-bold text-foreground">{joinedDate}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/app/compose"
              className="rounded-sm bg-primary px-4 py-3 text-center font-serif font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {t('writeLetter')}
            </Link>
            <Link
              href="/app/explore"
              className="rounded-sm border border-border px-4 py-3 text-center font-serif font-bold text-foreground transition hover:bg-muted/40"
            >
              {t('exploreWriters')}
            </Link>
            <Link
              href="/app/stamps"
              className="rounded-sm border border-border px-4 py-3 text-center font-serif font-bold text-foreground transition hover:bg-muted/40"
            >
              {t('viewStamps')}
            </Link>
          </div>
        </div>

        <div className="yuubin-polished-card postal-card p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {t('letterActivity')}
          </p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-serif text-5xl font-bold text-foreground">{totalLetters}</p>
              <p className="mt-2 text-muted-foreground">{t('totalExchangedLetters')}</p>
            </div>
            <Mail className="h-14 w-14 text-primary/40" />
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  totalLetters ? (stats.lettersReceived / totalLetters) * 100 : 0,
                  100,
                )}%`,
              }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{stats.lettersReceived} {t('receivedShort')}</span>
            <span>{stats.lettersSent} {t('sentShort')}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="yuubin-stat-card postal-card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`mt-2 font-serif text-4xl font-bold ${color}`}>
                  {value.toLocaleString()}
                </p>
              </div>
              <Icon className={`h-8 w-8 ${color} opacity-70 transition group-hover:scale-110`} />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="yuubin-polished-card postal-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-foreground">{t('atAGlance')}</h3>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {detailStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="yuubin-mini-stat rounded-sm border border-border bg-background/40 p-4">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="font-serif text-2xl font-bold text-foreground">
                  {value.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">{t('recentLetters')}</h3>
              <p className="text-sm text-muted-foreground">{t('latestLettersInInbox')}</p>
            </div>
            <Link href="/app/inbox" className="text-sm font-medium text-primary hover:underline">
              {t('viewInbox')}
            </Link>
          </div>

          {letters.length === 0 ? (
            <div className="yuubin-polished-card postal-card p-10 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-primary/50" />
              <h4 className="font-serif text-xl font-bold text-foreground">{t('noLettersYet')}</h4>
              <p className="mt-2 text-muted-foreground">
                {t('noLettersMessage')}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {letters.map((letter) => {
                const sender = letter.sender_profile;
                const senderName =
                  sender?.username || sender?.full_name || t('unknownSender');
                const preview =
                  letter.status === 'delivered'
                    ? `${letter.content.substring(0, 130)}${letter.content.length > 130 ? '...' : ''}`
                    : t('travellingPreview');

                return (
                  <Link
                    key={letter.id}
                    href={`/app/letter/${letter.id}`}
                    className="yuubin-letter-preview-card postal-card group flex min-h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg font-bold text-foreground group-hover:text-primary">
                          {letter.title || t('untitledLetter')}
                        </p>
                        <p className="truncate text-sm text-primary">{t('from')} {senderName}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                          letter.status,
                        )}`}
                      >
                        {t(getStatusKey(letter.status))}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(letter.created_at, t('unknownDate'))}
                    </div>

                    <p className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground">
                      {preview}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {(letter.likes ?? 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <Reply className="h-4 w-4" />
                        {t('open')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
