'use client';

import { Mail, Calendar, CheckCircle2, Clock, MapPin, Search, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { AppScreenLoader } from '@/components/app-screen-loader';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import {
  formatDeliveryEta,
  getLetterDisplayStatus,
  getLetterProgress,
  type LetterDisplayStatus,
} from '@/lib/letterDeliveryStatus';

interface InboxLetter {
  id: string;
  sender_id: string;
  title: string;
  status: string | null;
  created_at: string;
  sent_at?: string | null;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
  is_read: boolean;
  sender_profile?: {
    username: string | null;
  } | null;
}

const getStatusIcon = (status: LetterDisplayStatus) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle2 className="w-5 h-5 text-accent" />;
    case 'in-transit':
      return <Zap className="w-5 h-5 text-status-transit animate-delivery-pulse" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-status-pending" />;
  }
};

const getStatusLabel = (status: LetterDisplayStatus) => {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'in-transit':
      return 'In Transit';
    case 'pending':
      return 'Pending';
  }
};

export default function InboxPage() {
  const [letters, setLetters] = useState<InboxLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [, setProgressTick] = useState(0);
  const supabase = createClient();

  const loadInboxLetters = async (userId: string) => {
    const response = await authenticatedFetch(`/api/letters?userId=${userId}&type=inbox`);
    const data = await response.json();

    if (data.letters) {
      setLetters(data.letters);
    }
  };

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);
        await loadInboxLetters(user.id);
      } catch (error) {
        console.error('[inbox] Loading failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const refreshInbox = () => {
      void loadInboxLetters(currentUserId);
    };

    const channel = supabase
      .channel(`inbox-letters-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letters',
          filter: `recipient_id=eq.${currentUserId}`,
        },
        refreshInbox,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setProgressTick((value) => value + 1);
    }, 5000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const syncDelivered = async () => {
      const response = await authenticatedFetch('/api/letters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, syncDelivered: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && Number(data.delivered) > 0) {
        await loadInboxLetters(currentUserId);
      }
    };

    syncDelivered();
    const interval = window.setInterval(syncDelivered, 30000);
    return () => window.clearInterval(interval);
  }, [currentUserId]);

  const filteredLetters = letters.filter(letter => {
    const displayStatus = getLetterDisplayStatus(letter);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' ? !letter.is_read : displayStatus === filter);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      letter.title.toLowerCase().includes(query) ||
      (letter.sender_profile?.username || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  if (loading) {
    return (
      <AppScreenLoader title="Inbox" message="Loading your inbox..." />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Inbox</h2>
        <p className="text-muted-foreground">Track your incoming letters and delivery status</p>
      </div>

      {/* Search and Filters */}
      <div className="postal-card p-4 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search inbox by title or sender username"
            className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {['all', 'delivered', 'in-transit', 'pending', 'unread'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-sm font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'All Letters' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Letters List */}
      <div className="space-y-3">
        {filteredLetters.map((letter) => {
          const date = new Date(letter.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const displayStatus = getLetterDisplayStatus(letter);
          const progress = getLetterProgress(letter);

          return (
            <Link
              key={letter.id}
              href={`/app/letter/${letter.id}`}
              className={`postal-card p-6 hover:shadow-lg transition-all cursor-pointer block ${
                !letter.is_read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="pt-1 flex-shrink-0">
                  {getStatusIcon(displayStatus)}
                </div>

                {/* Letter Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className={`font-serif text-lg ${!letter.is_read ? 'font-bold text-foreground' : 'text-foreground'}`}>
                        {letter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        From {letter.sender_profile?.username || 'Unknown'}
                      </p>
                    </div>
                    
                    {!letter.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {date}
                    </div>
                    {letter.estimated_delivery_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Arrives {formatDeliveryEta(letter.estimated_delivery_at)}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {getStatusLabel(displayStatus)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          displayStatus === 'delivered'
                            ? 'bg-accent'
                            : displayStatus === 'in-transit'
                            ? 'bg-status-transit'
                            : 'bg-status-pending'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border bg-card ${
                          progress >= 1
                            ? 'border-primary text-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        <Mail className="h-3 w-3" />
                      </div>
                      <div className="h-px flex-1 bg-border">
                        <div
                          className={`h-px transition-all ${
                            displayStatus === 'delivered' ? 'bg-accent' : 'bg-status-transit'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border bg-card ${
                          displayStatus === 'delivered'
                            ? 'border-accent text-accent'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Postmark */}
                <div className="flex-shrink-0 text-right space-y-2">
                  <div className="text-2xl text-primary/30 font-serif">✉</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State - Below existing letters */}
      {filteredLetters.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <Mail className="w-16 h-16 text-muted-foreground mx-auto opacity-30" />
          <h3 className="text-xl font-serif font-bold text-foreground">
            {filter === 'all' ? 'No letters yet' : `No ${filter} letters`}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'Your inbox is empty. Share your profile to start receiving letters!' : `Try adjusting your filter`}
          </p>
          <Link
            href="/app/profile"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground font-serif font-bold rounded-sm hover:bg-primary/90 transition-all"
          >
            View Profile
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="bg-card border-l-4 border-l-primary p-6 rounded-sm space-y-4">
        <h3 className="font-serif font-bold text-foreground">Delivery Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-status-pending flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Pending</p>
              <p className="text-muted-foreground">Letter is being prepared</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-status-transit flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">In Transit</p>
              <p className="text-muted-foreground">Letter is on its way</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Delivered</p>
              <p className="text-muted-foreground">Letter has arrived</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
