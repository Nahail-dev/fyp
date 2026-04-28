'use client';

import { useState } from 'react';
import { Compass, Heart, User, Mail, Filter } from 'lucide-react';

const mockWriters = [
  {
    id: 1,
    name: 'Emma Watson',
    interests: ['Poetry', 'Nature', 'Travel'],
    lettersReceived: 12,
    stampsCollected: 8,
    bio: 'Poetry lover and nature enthusiast from Portland',
    avatar: '👩‍🎨',
  },
  {
    id: 2,
    name: 'Lucas Chen',
    interests: ['Technology', 'Photography', 'Philosophy'],
    lettersReceived: 18,
    stampsCollected: 15,
    bio: 'Exploring the intersection of tech and humanity',
    avatar: '👨‍💻',
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    interests: ['Cooking', 'Culture', 'Stories'],
    lettersReceived: 24,
    stampsCollected: 22,
    bio: 'Sharing recipes and stories from around the world',
    avatar: '👩‍🍳',
  },
  {
    id: 4,
    name: 'Alex Thompson',
    interests: ['Music', 'Art', 'Mindfulness'],
    lettersReceived: 16,
    stampsCollected: 12,
    bio: 'Creating art through words and melodies',
    avatar: '🎨',
  },
  {
    id: 5,
    name: 'Isabella Romano',
    interests: ['History', 'Books', 'Science'],
    lettersReceived: 20,
    stampsCollected: 18,
    bio: 'Fascinated by history and sharing knowledge',
    avatar: '📚',
  },
  {
    id: 6,
    name: 'David Kim',
    interests: ['Adventure', 'Sports', 'Environment'],
    lettersReceived: 14,
    stampsCollected: 10,
    bio: 'Outdoor enthusiast and environmental advocate',
    avatar: '🏔️',
  },
];

export default function ExplorePage() {
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const allInterests = Array.from(new Set(mockWriters.flatMap(w => w.interests)));

  const filteredWriters = selectedInterest
    ? mockWriters.filter(writer => writer.interests.includes(selectedInterest))
    : mockWriters;

  return (
    <div className="space-y-8">
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
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{writer.avatar}</div>
                <div>
                  <h3 className="font-serif font-bold text-foreground">{writer.name}</h3>
                  <p className="text-xs text-muted-foreground">{writer.lettersReceived} letters received</p>
                </div>
              </div>
              <button className="p-2 rounded-lg border border-border hover:bg-secondary/10 transition">
                <Heart className="w-5 h-5 text-secondary" />
              </button>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground">{writer.bio}</p>

            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              {writer.interests.map(interest => (
                <span key={interest} className="text-xs px-3 py-1 bg-muted rounded-full text-muted-foreground">
                  {interest}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{writer.lettersReceived}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⭐ {writer.stampsCollected} stamps</span>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full px-4 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium text-sm">
              Write a Letter
            </button>
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
