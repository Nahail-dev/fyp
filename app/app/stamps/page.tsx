'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, Lock, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { STAMPS, type StampRarity } from '@/lib/stamps';
import { AppScreenLoader } from '@/components/app-screen-loader';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
      return 'bg-muted/20 border-muted/30';
    case 'epic':
      return 'bg-accent/20 border-accent/30';
    case 'rare':
      return 'bg-primary/20 border-primary/30';
    case 'legendary':
      return 'bg-secondary/20 border-secondary/30';
  }
};

const fallbackStamps: Stamp[] = STAMPS.map((stamp) => ({
  ...stamp,
  image_url: stamp.image,
  obtained: stamp.rarity === 'common',
  count: stamp.rarity === 'common' ? 1 : 0,
}));

function normalizeStamp(
  stamp: Omit<Stamp, 'rarity'> & { rarity: StampRarity | 'uncommon'; image?: string },
) {
  const rarity = stamp.rarity === 'uncommon' ? 'epic' : stamp.rarity;
  return {
    ...stamp,
    rarity,
    image_url: stamp.image_url || stamp.image,
  } as Stamp;
}

export default function StampsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);

  const stampsQuery = useQuery<{ userId: string | null; stamps: Stamp[] }>({
    queryKey: ['stamps', 'collection'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { userId: null, stamps: fallbackStamps };
      }

      const response = await authenticatedFetch(`/api/stamps?userId=${user.id}&type=collected`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load stamps');
      }

      return {
        userId: user.id,
        stamps: data.stamps
          ? (data.stamps as Array<Omit<Stamp, 'rarity'> & { rarity: StampRarity | 'uncommon'; image?: string }>).map(normalizeStamp)
          : fallbackStamps,
      };
    },
  });

  const currentUserId = stampsQuery.data?.userId ?? null;
  const stamps = stampsQuery.data?.stamps ?? fallbackStamps;

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`user-stamps-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stamp_inventory',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['stamps', 'collection'] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient, supabase]);

  // Set default selected stamp when stamps list loads
  useEffect(() => {
    if (stamps.length > 0 && !selectedStampId) {
      // Default to first obtained stamp, or first stamp in list
      const firstObtained = stamps.find((s) => s.obtained);
      setSelectedStampId(firstObtained ? firstObtained.id : stamps[0].id);
    }
  }, [stamps, selectedStampId]);

  if (stampsQuery.isLoading) {
    return (
      <AppScreenLoader title="Stamp Collection" message="Loading your collection..." />
    );
  }

  const obtainedCount = stamps.filter((s) => s.obtained).length;
  const totalStamps = stamps.length;

  const selectedStamp = stamps.find((s) => s.id === selectedStampId) || stamps[0];
  const filteredStamps = activeTab === 'all' 
    ? stamps 
    : stamps.filter((s) => s.rarity === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Yuubin Post Album</h2>
        <p className="text-muted-foreground">
          Unlock and collect stamps as you exchange correspondence with other writers.
        </p>
      </div>

      {/* Album Scrapbook Desk Wrapper */}
      <div className="stamp-album-book-desk relative p-3 sm:p-10 rounded-sm border border-border overflow-visible">
        
        {/* The Scrapbook */}
        <div className="relative stamp-album-book w-full min-h-[620px] grid grid-cols-1 lg:grid-cols-2 bg-card rounded-sm overflow-visible">
          
          {/* Ring Binding Spine (Center crease) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 stamp-album-spine z-30 pointer-events-none" />
          
          {/* LEFT PAGE - Details & Stats */}
          <div className="p-6 sm:p-8 lg:pr-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border bg-card/45 rounded-l-sm z-10">
            
            {/* Top: Selected Stamp Display */}
            {selectedStamp ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Album Mounting Log
                  </span>
                </div>

                {/* Big Stamp Visual */}
                <div className={`relative mx-auto h-48 w-48 flex items-center justify-center rounded-sm border-2 border-dashed p-4 ${
                  selectedStamp.obtained 
                    ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10' 
                    : 'border-muted bg-muted/10'
                }`}>
                  <div className={`relative w-36 h-36 ${selectedStamp.obtained ? '' : 'opacity-20 grayscale'}`}>
                    <Image
                      src={selectedStamp.image_url || '/stamps/stamp-common.png'}
                      alt={selectedStamp.name}
                      fill
                      sizes="144px"
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                  {!selectedStamp.obtained && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-background/80 p-3 shadow border border-border">
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Stamp Info */}
                <div className="space-y-3 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-2xl font-serif font-bold text-foreground">
                      {selectedStamp.name}
                    </h3>
                    <span className={`inline-block self-center px-2 py-0.5 rounded text-xxs border font-bold capitalize ${getRarityBgColor(selectedStamp.rarity)} ${getRarityColor(selectedStamp.rarity)}`}>
                      {selectedStamp.rarity}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{selectedStamp.description}"
                  </p>
                </div>

                {/* Requirement & Status */}
                <div className="rounded-sm border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-serif font-bold text-foreground">Mounting Requirement:</p>
                      <p className="text-muted-foreground">{selectedStamp.requirement}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Award className={`w-4 h-4 shrink-0 ${selectedStamp.obtained ? 'text-accent' : 'text-muted-foreground'}`} />
                    <p className="font-serif font-bold text-foreground">
                      Status: {' '}
                      <span className={selectedStamp.obtained ? 'text-accent' : 'text-muted-foreground'}>
                        {selectedStamp.obtained ? `Unlocked (Held: ${selectedStamp.count} pcs)` : 'Locked'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <BookOpen className="w-12 h-12 text-muted-foreground opacity-40 animate-pulse" />
                <p className="text-sm text-muted-foreground">Select a stamp from the mounting sheets to examine details.</p>
              </div>
            )}

            {/* Bottom: Book Progress Tracker */}
            <div className="mt-8 pt-6 border-t border-border space-y-3">
              <div className="flex justify-between text-xs font-serif font-bold">
                <span className="text-muted-foreground">Collection Progress:</span>
                <span className="text-primary">{obtainedCount}/{totalStamps} Unlocked</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(obtainedCount / totalStamps) * 100}%` }}
                />
              </div>
              <p className="text-xxs text-muted-foreground text-right italic">
                {Math.round((obtainedCount / totalStamps) * 100)}% of album mounted
              </p>
            </div>
          </div>

          {/* RIGHT PAGE - Mounting Sheets Grid */}
          <div className="relative p-6 sm:p-8 lg:pl-12 stamp-mounting-grid bg-card rounded-r-md z-10 overflow-visible">
            
            {/* Page Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Mounting Sheet: {activeTab === 'all' ? 'All Slots' : `${activeTab} Class`}
              </span>
              <span className="text-xs text-muted-foreground">
                Showing {filteredStamps.length} Slots
              </span>
            </div>

            {/* Book Bookmark Tabs (Desktop physical tabs) */}
            <div className="hidden sm:flex absolute right-0 top-16 flex-col gap-2 translate-x-full z-20">
              {[
                { id: 'all', label: 'All', bg: 'bg-[#5C4033] hover:bg-[#4A332A]' },
                { id: 'common', label: 'Common', bg: 'bg-muted-foreground/80 hover:bg-muted-foreground' },
                { id: 'rare', label: 'Rare', bg: 'bg-primary hover:bg-primary/90' },
                { id: 'epic', label: 'Epic', bg: 'bg-accent hover:bg-accent/90' },
                { id: 'legendary', label: 'Legendary', bg: 'bg-secondary hover:bg-secondary/90' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    // Select first stamp in new list
                    const first = stamps.find((s) => s.rarity === tab.id || tab.id === 'all');
                    if (first) setSelectedStampId(first.id);
                  }}
                  className={`stamp-album-tab w-6 py-4 text-xxs font-serif font-bold text-white text-center leading-none ${tab.bg} ${
                    activeTab === tab.id ? 'ring-2 ring-primary ring-offset-1 translate-x-2' : ''
                  }`}
                >
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Mobile Tab Select Dropdown */}
            <div className="sm:hidden mb-4">
              <label className="block text-xs font-bold text-muted-foreground mb-1">Select Sheet:</label>
              <select
                value={activeTab}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setActiveTab(val);
                  const first = stamps.find((s) => s.rarity === val || val === 'all');
                  if (first) setSelectedStampId(first.id);
                }}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="all">All Stamps</option>
                <option value="common">Common Stamps</option>
                <option value="rare">Rare Stamps</option>
                <option value="epic">Epic Stamps</option>
                <option value="legendary">Legendary Stamps</option>
              </select>
            </div>

            {/* Stamp Slots Grid */}
            <div className="grid grid-cols-3 gap-4 max-h-[480px] overflow-y-auto pr-1">
              {filteredStamps.map((stamp) => (
                <button
                  key={stamp.id}
                  onClick={() => setSelectedStampId(stamp.id)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded border-2 p-2 transition-all cursor-pointer ${
                    selectedStampId === stamp.id 
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-md' 
                      : stamp.obtained
                        ? 'border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10'
                        : 'border-dashed border-muted hover:border-muted-foreground/40 bg-muted/5'
                  }`}
                >
                  {/* Mount sticker effect */}
                  {stamp.obtained && (
                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-2.5 stamp-mount-sticker z-10 pointer-events-none" />
                  )}

                  {/* Stamp Graphic */}
                  <div className={`relative w-full h-full max-w-[72px] max-h-[72px] ${stamp.obtained ? 'drop-shadow-sm' : 'opacity-25 grayscale'}`}>
                    <Image
                      src={stamp.image_url || '/stamps/stamp-common.png'}
                      alt={`${stamp.name} stamp slot`}
                      fill
                      sizes="72px"
                      className="object-contain"
                    />
                  </div>

                  {/* Lock Indicator */}
                  {!stamp.obtained && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-sm">
                      <Lock className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                  )}

                  {/* Stamp count badge */}
                  {stamp.obtained && stamp.count > 1 && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-primary px-1 text-[9px] font-serif font-bold text-white shadow-sm leading-none flex items-center justify-center min-w-4 h-4">
                      {stamp.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Empty slots notice */}
            {filteredStamps.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border-2 border-dashed border-border rounded">
                <Sparkles className="w-8 h-8 opacity-45 mb-2" />
                <p className="text-xs">No stamps mounted in this sheet yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Album guide */}
      <div className="postal-card p-6 space-y-4 border-l-4 border-l-primary">
        <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Album Collection Benefits
        </h3>
        <p className="text-sm text-muted-foreground">
          Stamps are awarded dynamically based on milestone achievements, sending letters over varying distances, writing letters in multiple languages, and receiving replies from other pen pals. Completing pages inside your Yuubin Post Album unlocks special profile badges.
        </p>
      </div>
    </div>
  );
}
