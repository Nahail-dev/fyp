'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, Lock, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { STAMPS, type StampRarity } from '@/lib/stamps';

interface Stamp {
  id: string;
  name: string;
  description: string;
  rarity: StampRarity;
  image_url?: string;
  obtained: boolean;
  count: number;
  requirement: string;
}

const getRarityColor = (rarity: StampRarity) => {
  switch (rarity) {
    case 'common':
      return 'text-muted-foreground';
    case 'epic':
      return 'text-accent';
    case 'rare':
      return 'text-primary';
    case 'legendary':
      return 'text-secondary';
  }
};

const getRarityBgColor = (rarity: StampRarity) => {
  switch (rarity) {
    case 'common':
      return 'bg-muted/20';
    case 'epic':
      return 'bg-accent/20';
    case 'rare':
      return 'bg-primary/20';
    case 'legendary':
      return 'bg-secondary/20';
  }
};

export default function StampsPage() {
  const [stamps, setStamps] = useState<Stamp[]>(
    STAMPS.map((stamp) => ({
      ...stamp,
      image_url: stamp.image,
      obtained: stamp.rarity === 'common',
      count: stamp.rarity === 'common' ? 1 : 0,
    })),
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch(`/api/stamps?userId=${user.id}&type=collected`);
        const data = await response.json();
        
        if (data.stamps) {
          setStamps(
            data.stamps.map((stamp: Omit<Stamp, 'rarity'> & { rarity: StampRarity | 'uncommon'; image?: string }) => {
              const rarity = stamp.rarity === 'uncommon' ? 'epic' : stamp.rarity;
              return {
                ...stamp,
                rarity,
                image_url: stamp.image_url || stamp.image,
              };
            })
          );
        }
      } catch (error) {
        console.log('[v0] Error fetching stamps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStamps();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">Stamp Collection</h2>
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    );
  }

  const obtainedCount = stamps.filter((s) => s.obtained).length;
  const totalStamps = stamps.length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Stamp Collection</h2>
        <p className="text-muted-foreground">
          Unlock unique postal stamps as you exchange letters
        </p>
      </div>

      {/* Collection Stats */}
      <div className="postal-card p-8 space-y-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-serif font-bold text-primary">
              {obtainedCount}/{totalStamps}
            </p>
            <p className="text-muted-foreground mt-2">Stamps Collected</p>
          </div>
          <Sparkles className="w-20 h-20 text-primary/30" />
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${(obtainedCount / totalStamps) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((obtainedCount / totalStamps) * 100)}% of collection completed
          </p>
        </div>
      </div>

      {/* Stamps by Rarity */}
      <div className="space-y-8">
        {(['common', 'epic', 'rare', 'legendary'] as StampRarity[]).map((rarity) => {
          const rarityStamps = stamps.filter((s) => s.rarity === rarity);
          return (
            <div key={rarity} className="space-y-4">
              <h3 className={`text-xl font-serif font-bold capitalize ${getRarityColor(rarity)}`}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rarityStamps.map((stamp) => (
                  <div
                    key={stamp.id}
                    className={`postal-card p-6 space-y-4 transition-all ${
                      stamp.obtained
                        ? 'hover:shadow-lg'
                        : 'opacity-60'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-foreground text-lg">
                          {stamp.name}
                        </h4>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getRarityBgColor(stamp.rarity)} ${getRarityColor(stamp.rarity)}`}
                        >
                          {stamp.rarity}
                        </span>
                      </div>
                      {stamp.obtained && (
                        <Award className={`w-6 h-6 ${getRarityColor(stamp.rarity)}`} />
                      )}
                    </div>

                    {/* Stamp Display */}
                    <div className={`flex justify-center py-6 rounded-sm border-2 border-dashed ${stamp.obtained ? 'border-primary/40 bg-primary/5' : 'border-muted'}`}>
                      <div className="text-center space-y-3">
                        <div className={`relative mx-auto h-28 w-28 ${stamp.obtained ? 'animate-stamp-spin' : 'opacity-30 grayscale'}`}>
                          <Image
                            src={stamp.image_url || '/stamps/stamp-common.png'}
                            alt={`${stamp.rarity} stamp artwork`}
                            fill
                            sizes="112px"
                            className="object-contain drop-shadow-md"
                          />
                        </div>
                        {stamp.obtained && (
                          <p className="text-xs font-serif font-bold text-primary">
                            × {stamp.count}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {stamp.description}
                    </p>

                    {/* Requirement */}
                    <div className="flex items-start gap-2 pt-2 border-t border-border">
                      <div className="flex-shrink-0 mt-1">
                        {stamp.obtained ? (
                          <Award className="w-4 h-4 text-accent" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stamp.requirement}
                      </p>
                    </div>

                    {/* Status */}
                    {stamp.obtained ? (
                      <p className="text-xs font-serif font-bold text-accent text-center">
                        ✓ Unlocked
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">
                        Keep writing to unlock
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements Info */}
      <div className="postal-card p-8 space-y-4 border-l-4 border-l-accent">
        <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Stamp Collection Benefits
        </h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Show your stamp collection on your profile</span>
          </li>
          <li className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Unlock special badges and recognition</span>
          </li>
          <li className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Connect with collectors worldwide</span>
          </li>
          <li className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Legendary collectors receive exclusive features</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
