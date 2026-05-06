'use client';

import { Mail, MapPin, Calendar, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

interface InboxLetter {
  id: string;
  sender_id: string;
  title: string;
  status: 'delivered' | 'in-transit' | 'pending';
  created_at: string;
  is_read: boolean;
  sender_profile?: {
    full_name: string;
    location: string;
  };
}

const getStatusIcon = (status: InboxLetter['status']) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle2 className="w-5 h-5 text-accent" />;
    case 'in-transit':
      return <Zap className="w-5 h-5 text-status-transit animate-delivery-pulse" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-status-pending" />;
  }
};

const getStatusLabel = (status: InboxLetter['status']) => {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'in-transit':
      return 'In Transit';
    case 'pending':
      return 'Pending';
  }
};

const getStatusProgress = (status: InboxLetter['status']) => {
  switch (status) {
    case 'delivered':
      return 100;
    case 'in-transit':
      return 65;
    case 'pending':
      return 20;
  }
};

export default function InboxPage() {
  const [letters, setLetters] = useState<InboxLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch(`/api/letters?userId=${user.id}&type=inbox`);
        const data = await response.json();
        
        if (data.letters) {
          // Fetch sender profiles for each letter
          const lettersWithProfiles = await Promise.all(
            data.letters.map(async (letter: InboxLetter) => {
              const profileResponse = await supabase
                .from('profiles')
                .select('full_name, location')
                .eq('id', letter.sender_id)
                .single();
              
              return {
                ...letter,
                sender_profile: profileResponse.data
              };
            })
          );
          
          setLetters(lettersWithProfiles);
        }
      } catch (error) {
        console.log('[v0] Error fetching inbox:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  const filteredLetters = letters.filter(letter => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !letter.is_read;
    return letter.status === filter;
  });
  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">Inbox</h2>
          <p className="text-muted-foreground">Track your incoming letters and delivery status</p>
        </div>
        <p className="text-muted-foreground">Loading your inbox...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Inbox</h2>
        <p className="text-muted-foreground">Track your incoming letters and delivery status</p>
      </div>

      {/* Filters */}
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

      {/* Letters List */}
      <div className="space-y-3">
        {filteredLetters.map((letter) => {
          const date = new Date(letter.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const progress = getStatusProgress(letter.status);

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
                  {getStatusIcon(letter.status)}
                </div>

                {/* Letter Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className={`font-serif text-lg ${!letter.is_read ? 'font-bold text-foreground' : 'text-foreground'}`}>
                        {letter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">From {letter.sender_profile?.full_name || 'Unknown'}</p>
                    </div>
                    
                    {!letter.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {/* Location & Date */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                    {letter.sender_profile?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {letter.sender_profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {date}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {getStatusLabel(letter.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          letter.status === 'delivered'
                            ? 'bg-accent'
                            : letter.status === 'in-transit'
                            ? 'bg-status-transit'
                            : 'bg-status-pending'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
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
