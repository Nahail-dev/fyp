'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Calendar, User, Eye, Trash2, Zap, CheckCircle2, Search } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { AppScreenLoader } from '@/components/app-screen-loader';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import {
  formatDeliveryEta,
  getLetterDisplayStatus,
  getLetterProgress,
  type LetterDisplayStatus,
} from '@/lib/letterDeliveryStatus';

interface SentLetter {
  id: string;
  recipient_id: string;
  title: string;
  status: string | null;
  created_at: string;
  updated_at: string;
  sent_at?: string | null;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
  recipient_profile?: {
    username: string | null;
  } | null;
}

export default function SentLettersPage() {
  const [letters, setLetters] = useState<SentLetter[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, setProgressTick] = useState(0);
  const supabase = createClient();

  const loadSentLetters = async (userId: string) => {
    const response = await authenticatedFetch(`/api/letters?userId=${userId}&type=sent`);
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
        await loadSentLetters(user.id);
      } catch (error) {
        console.error('[sent] Loading failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const refreshSent = () => {
      void loadSentLetters(currentUserId);
    };

    const channel = supabase
      .channel(`sent-letters-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letters',
          filter: `sender_id=eq.${currentUserId}`,
        },
        refreshSent,
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
        await loadSentLetters(currentUserId);
      }
    };

    syncDelivered();
    const interval = window.setInterval(syncDelivered, 30000);
    return () => window.clearInterval(interval);
  }, [currentUserId]);

  const deleteLetter = async (letterId: string) => {
    if (!currentUserId) return;
    setDeletingId(letterId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/letters/${letterId}`, {
        method: 'DELETE',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to delete letter');
      }

      setLetters((current) => current.filter((letter) => letter.id !== letterId));
    } catch (error) {
      console.log('[sent] delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: LetterDisplayStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-accent/10 text-accent';
      case 'in-transit':
        return 'bg-status-transit/10 text-status-transit';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredLetters = letters.filter(letter => {
    const displayStatus = getLetterDisplayStatus(letter);
    const matchesFilter = filter === 'all' || displayStatus === filter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      letter.title.toLowerCase().includes(query) ||
      (letter.recipient_profile?.username || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <AppScreenLoader title="Sent Letters" message="Loading your sent letters..." />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Send className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Sent Letters</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {letters.length} letters sent
        </div>
      </div>

      {/* Search and Filter Tabs */}
      <div className="postal-card p-4 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search sent letters by title or recipient username"
            className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 border-b border-border">
          {['all', 'delivered', 'in-transit'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 capitalize border-b-2 transition ${
                filter === tab
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'delivered' ? 'Delivered' : 'In Transit'}
            </button>
          ))}
        </div>
      </div>

      {/* Letters List */}
      <div className="space-y-4">
        {filteredLetters.map(letter => {
          const displayStatus = getLetterDisplayStatus(letter);
          const progress = getLetterProgress(letter);
          const sentDate = new Date(letter.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          const updatedDate = new Date(letter.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });

          return (
            <div key={letter.id} className="postal-card p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      {letter.recipient_profile?.username || 'Unknown Recipient'}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(displayStatus)}`}>
                      {displayStatus === 'delivered' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Delivered
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          In Transit
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-lg font-serif text-foreground">{letter.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Sent {sentDate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {displayStatus === 'delivered'
                          ? `Delivered on ${updatedDate}`
                          : `Estimated ${formatDeliveryEta(letter.estimated_delivery_at)}`}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          displayStatus === 'delivered'
                            ? 'bg-accent'
                            : 'bg-status-transit'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="h-px flex-1 bg-border">
                        <div
                          className="h-px bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          displayStatus === 'delivered' ? 'bg-accent' : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/app/letter/${letter.id}`}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition"
                    title="View letter"
                  >
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteLetter(letter.id)}
                    disabled={deletingId === letter.id}
                    className="p-2 rounded-lg border border-border hover:bg-destructive/10 transition disabled:opacity-50"
                    title="Delete letter"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLetters.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <Send className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-lg font-serif text-muted-foreground">
            {filter === 'all' ? 'No sent letters yet' : `No ${filter} letters`}
          </p>
          <p className="text-sm text-muted-foreground">Start writing your first letter to someone special</p>
          <Link
            href="/app/compose"
            className="inline-block px-6 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium mt-4"
          >
            Write a Letter
          </Link>
        </div>
      )}
    </div>
  );
}
