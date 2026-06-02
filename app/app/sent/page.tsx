'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Calendar, User, Eye, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface SentLetter {
  id: string;
  recipient_id: string;
  title: string;
  status: 'pending' | 'in-transit' | 'delivered';
  created_at: string;
  updated_at: string;
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

  const getStatusColor = (status: string) => {
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
    if (filter === 'all') return true;
    return letter.status === filter;
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
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(letter.status)}`}>
                      {letter.status === 'delivered' ? '✓ Delivered' : 'In Transit'}
                    </span>
                  </div>
                  <p className="text-lg font-serif text-foreground">{letter.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Sent {sentDate}</span>
                    </div>
                  </div>
                  {letter.status === 'delivered' && (
                    <p className="text-sm text-accent font-medium">
                      Delivered on {updatedDate}
                    </p>
                  )}
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
