'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, User, Mail, Filter, MapPin, PenTool } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface WriterProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  interests: string[];
  avatar_url?: string;
  city?: {
    city: string;
    country: string;
    admin_name?: string | null;
  } | null;
}

export default function ExplorePage() {
  const [writers, setWriters] = useState<WriterProfile[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchWriters = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const params = new URLSearchParams({ publicOnly: 'true' });
        if (user) params.set('userId', user.id);

        const response = await fetch(`/api/users?${params.toString()}`);
        const data = await response.json();
        
        if (data.users) {
          setWriters(data.users);
        }
      } catch (error) {
        console.log('[v0] Error fetching writers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWriters();
  }, []);

  const allInterests = Array.from(new Set(writers.flatMap(w => w.interests || [])));

  const filteredWriters = selectedInterest
    ? writers.filter(writer => writer.interests?.includes(selectedInterest))
    : writers;

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-3">
          <Compass className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Explore Writers</h1>
        </div>
        <p className="text-muted-foreground">Loading writers...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Compass className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-serif font-bold text-foreground">Explore Writers</h1>
      </div>

      {/* Search & Filter */}
      <div className="postal-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-5 h-5" />
          <p className="font-medium">Filter by interests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedInterest(null)}
            className={`px-4 py-2 rounded-full transition ${
              selectedInterest === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {allInterests.map(interest => (
            <button
              key={interest}
              onClick={() => setSelectedInterest(interest)}
              className={`px-4 py-2 rounded-full transition ${
                selectedInterest === interest
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Writers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWriters.map(writer => (
          <div key={writer.id} className="postal-card p-6 hover:shadow-lg transition space-y-4">
            {/* Writer Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl w-12 h-12 flex items-center justify-center rounded-full bg-muted overflow-hidden">
                  {writer.avatar_url ? (
                    <img src={writer.avatar_url} alt={writer.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-foreground">{writer.full_name}</h3>
                  <p className="text-xs text-muted-foreground">@{writer.username}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground">{writer.bio || 'No bio provided'}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {writer.city
                  ? `${writer.city.city}, ${writer.city.country}`
                  : 'City not set'}
              </span>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              {(writer.interests || []).slice(0, 3).map(interest => (
                <span key={interest} className="text-xs px-3 py-1 bg-muted rounded-full text-muted-foreground">
                  {interest}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>Open to letters</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/app/compose?recipient=${encodeURIComponent(writer.username)}`}
              className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium text-sm"
            >
              <PenTool className="h-4 w-4" />
              Write a Letter
            </Link>
          </div>
        ))}
      </div>

      {filteredWriters.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-lg font-serif text-muted-foreground">No writers found</p>
          <p className="text-sm text-muted-foreground">Try selecting different interests</p>
        </div>
      )}
    </div>
  );
}
