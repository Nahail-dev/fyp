'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Calendar, User, Eye, Trash2, Zap, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
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
    full_name: string;
  };
}

export default function SentLettersPage() {
  const [letters, setLetters] = useState<SentLetter[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch(`/api/letters?userId=${user.id}&type=sent`);
        const data = await response.json();
        
        if (data.letters) {
          const lettersWithProfiles = await Promise.all(
            data.letters.map(async (letter: SentLetter) => {
              if (letter.recipient_id) {
                const profileResponse = await supabase
                  .from('users')
                  .select('full_name')
                  .eq('id', letter.recipient_id)
                  .maybeSingle();
                
                return {
                  ...letter,
                  recipient_profile: profileResponse.data
                };
              }
              return letter;
            })
          );
          
          setLetters(lettersWithProfiles);
        }
      } catch (error) {
        console.log('[v0] Error fetching sent letters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

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
    if (filter === 'all') return true;
    return displayStatus === filter;
  });

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-3">
          <Send className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Sent Letters</h1>
        </div>
        <p className="text-muted-foreground">Loading your sent letters...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
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

      {/* Filter Tabs */}
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
                    <p className="font-medium text-foreground">{letter.recipient_profile?.full_name || 'Unknown Recipient'}</p>
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
                  <button className="p-2 rounded-lg border border-border hover:bg-destructive/10 transition">
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
