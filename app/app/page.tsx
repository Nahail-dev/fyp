'use client';

import { Mail, Calendar, Heart, Reply } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { AppScreenLoader } from '@/components/app-screen-loader';

interface Letter {
  id: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  content: string;
  status: 'pending' | 'in-transit' | 'delivered';
  likes: number;
  created_at: string;
}

interface SenderProfile {
  id: string;
  full_name: string;
}

interface Stats {
  lettersReceived: number;
  lettersSent: number;
  stampsCollected: number;
  totalLikes: number;
}

const getStatusColor = (status: Letter['status']) => {
  switch (status) {
    case 'delivered':
      return 'bg-accent text-accent';
    case 'in-transit':
      return 'bg-status-transit text-status-transit';
    case 'pending':
      return 'bg-status-pending text-status-pending';
  }
};

const getStatusLabel = (status: Letter['status']) => {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'in-transit':
      return 'In Transit';
    case 'pending':
      return 'Pending';
  }
};

export default function Dashboard() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [stats, setStats] = useState<Stats>({
    lettersReceived: 0,
    lettersSent: 0,
    stampsCollected: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [senderProfiles, setSenderProfiles] = useState<Record<string, SenderProfile>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's stats
        const statsResponse = await fetch(`/api/stats?userId=${user.id}`);
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch recent letters received
        const lettersResponse = await fetch(`/api/letters?userId=${user.id}&type=inbox`);
        const lettersData = await lettersResponse.json();
        
        if (lettersData.letters) {
          setLetters(lettersData.letters.slice(0, 6));
          
          // Fetch sender profiles
          const profiles: Record<string, SenderProfile> = {};
          for (const letter of lettersData.letters.slice(0, 6)) {
            if (!profiles[letter.sender_id]) {
              const profileResponse = await supabase
                .from('users')
                .select('id, full_name')
                .eq('id', letter.sender_id)
                .maybeSingle();
              
              if (profileResponse.data) {
                profiles[letter.sender_id] = {
                  id: profileResponse.data.id,
                  full_name: profileResponse.data.full_name,
                };
              }
            }
          }
          setSenderProfiles(profiles);
        }
      } catch (error) {
        console.log('[v0] Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AppScreenLoader title="Your Letters" message="Loading your data..." />
    );
  }

  const maxLetters = Math.max(stats.lettersReceived, 1);
  const maxSent = Math.max(stats.lettersSent, 1);
  const maxStamps = Math.max(stats.stampsCollected, 1);
  const maxLikes = Math.max(stats.totalLikes, 1);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Your Letters</h2>
        <p className="text-muted-foreground">Connect with thoughtful writers from around the world</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Letters Received</p>
          <p className="text-3xl font-serif font-bold text-primary">{stats.lettersReceived}</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: `${Math.min((stats.lettersReceived / maxLetters) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Letters Sent</p>
          <p className="text-3xl font-serif font-bold text-secondary">{stats.lettersSent}</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-secondary h-1 rounded-full" style={{ width: `${Math.min((stats.lettersSent / maxSent) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Stamps Collected</p>
          <p className="text-3xl font-serif font-bold text-accent">{stats.stampsCollected}</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-accent h-1 rounded-full" style={{ width: `${Math.min((stats.stampsCollected / maxStamps) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Total Likes</p>
          <p className="text-3xl font-serif font-bold text-status-transit">{stats.totalLikes.toLocaleString()}</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-status-transit h-1 rounded-full" style={{ width: `${Math.min((stats.totalLikes / maxLikes) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Letters Grid */}
      <div>
        <h3 className="text-xl font-serif font-bold text-foreground mb-6">Recent Letters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => {
            const sender = senderProfiles[letter.sender_id];
            const date = new Date(letter.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            return (
              <Link
                key={letter.id}
                href={`/app/letter/${letter.id}`}
                className="postal-card p-6 hover:shadow-lg transition-all group cursor-pointer space-y-4 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                      {sender?.full_name || 'Unknown Sender'}
                    </h4>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(letter.status)}`}>
                    {getStatusLabel(letter.status)}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {date}
                </div>

                {/* Preview */}
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {letter.content.substring(0, 150)}...
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-secondary transition-colors group/btn">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{letter.likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                      <Reply className="w-4 h-4" />
                      <span className="text-xs">Reply</span>
                    </button>
                  </div>

                  {/* Postmark */}
                  <div className="text-xs font-serif text-primary opacity-50 animate-postmark-stamp">
                    ✉
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="postal-card p-8 text-center space-y-4 border-2 border-primary/20">
        <Mail className="w-12 h-12 text-primary mx-auto opacity-50" />
        <h3 className="text-xl font-serif font-bold text-foreground">Write Your Own Letter</h3>
        <p className="text-muted-foreground">Share your thoughts and connect with people around the world</p>
        <Link
          href="/app/compose"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground font-serif font-bold rounded-sm hover:bg-primary/90 transition-all"
        >
          Start Writing
        </Link>
      </div>
    </div>
  );
}
