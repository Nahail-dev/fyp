'use client';

import { Mail, MapPin, Heart, MessageCircle, Award, Edit2, Share2 } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  name: string;
  location: string;
  bio: string;
  avatar: string;
  lettersSent: number;
  lettersReceived: number;
  totalLikes: number;
  stampsCollected: number;
  followers: number;
  following: number;
  joinDate: string;
  interests: string[];
  recentStamps: string[];
}

const mockProfile: UserProfile = {
  name: 'Sarah Chen',
  location: 'San Francisco, California',
  bio: 'Writer • Thoughtful Listener • Coffee Enthusiast | Loves collecting stories and stamps from around the world',
  avatar: '👩',
  lettersSent: 18,
  lettersReceived: 24,
  totalLikes: 1523,
  stampsCollected: 5,
  followers: 342,
  following: 156,
  joinDate: 'March 2024',
  interests: ['Writing', 'Travel', 'Philosophy', 'Art', 'Nature'],
  recentStamps: ['🌸', '🏔️', '🌊', '💓', '🦋'],
};

export default function ProfilePage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header with Avatar */}
      <div className="postal-card p-12 space-y-6 text-center">
        {/* Avatar */}
        <div className="text-9xl">{mockProfile.avatar}</div>

        {/* Name and Location */}
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-foreground">
            {mockProfile.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            {mockProfile.location}
          </div>
        </div>

        {/* Bio */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {mockProfile.bio}
        </p>

        {/* Join Date */}
        <p className="text-sm text-muted-foreground">
          Joined {mockProfile.joinDate}
        </p>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-6 py-3 bg-primary text-primary-foreground font-serif font-bold rounded-sm hover:bg-primary/90 transition-all flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </button>
          <button className="px-6 py-3 border border-border text-foreground font-serif font-bold rounded-sm hover:bg-muted transition-all flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="postal-card p-6 space-y-3 text-center hover:shadow-lg transition-all">
          <Mail className="w-8 h-8 text-primary mx-auto" />
          <p className="text-3xl font-serif font-bold text-foreground">
            {mockProfile.lettersSent}
          </p>
          <p className="text-sm text-muted-foreground">Letters Sent</p>
        </div>

        <div className="postal-card p-6 space-y-3 text-center hover:shadow-lg transition-all">
          <MessageCircle className="w-8 h-8 text-secondary mx-auto" />
          <p className="text-3xl font-serif font-bold text-foreground">
            {mockProfile.lettersReceived}
          </p>
          <p className="text-sm text-muted-foreground">Letters Received</p>
        </div>

        <div className="postal-card p-6 space-y-3 text-center hover:shadow-lg transition-all">
          <Heart className="w-8 h-8 text-status-pending mx-auto" />
          <p className="text-3xl font-serif font-bold text-foreground">
            {mockProfile.totalLikes}
          </p>
          <p className="text-sm text-muted-foreground">Total Likes</p>
        </div>

        <div className="postal-card p-6 space-y-3 text-center hover:shadow-lg transition-all">
          <Award className="w-8 h-8 text-accent mx-auto" />
          <p className="text-3xl font-serif font-bold text-foreground">
            {mockProfile.stampsCollected}
          </p>
          <p className="text-sm text-muted-foreground">Stamps Collected</p>
        </div>
      </div>

      {/* Social Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="postal-card p-6 space-y-4">
          <h3 className="text-lg font-serif font-bold text-foreground">Community</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <p className="text-muted-foreground">Followers</p>
              <p className="text-2xl font-serif font-bold text-primary">
                {mockProfile.followers}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Following</p>
              <p className="text-2xl font-serif font-bold text-primary">
                {mockProfile.following}
              </p>
            </div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-4">
          <h3 className="text-lg font-serif font-bold text-foreground">Stamps</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {mockProfile.recentStamps.map((stamp, idx) => (
              <div
                key={idx}
                className="text-3xl p-3 border-2 border-primary/30 rounded-sm bg-primary/5 animate-stamp-spin"
              >
                {stamp}
              </div>
            ))}
          </div>
          <Link
            href="/app/stamps"
            className="block text-center text-sm text-primary hover:underline font-medium"
          >
            View Full Collection
          </Link>
        </div>
      </div>

      {/* Interests */}
      <div className="postal-card p-8 space-y-4">
        <h3 className="text-lg font-serif font-bold text-foreground">Interests</h3>
        <div className="flex flex-wrap gap-3">
          {mockProfile.interests.map((interest) => (
            <span
              key={interest}
              className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="postal-card p-8 space-y-6">
        <h3 className="text-lg font-serif font-bold text-foreground">Recent Activity</h3>

        <div className="space-y-4">
          {/* Activity Item 1 */}
          <div className="flex gap-4 pb-4 border-b border-border">
            <div className="text-2xl">🌸</div>
            <div className="flex-1">
              <p className="font-serif font-bold text-foreground">
                Collected Wildflower Stamp
              </p>
              <p className="text-sm text-muted-foreground">2 days ago</p>
            </div>
          </div>

          {/* Activity Item 2 */}
          <div className="flex gap-4 pb-4 border-b border-border">
            <Heart className="w-6 h-6 text-secondary" />
            <div className="flex-1">
              <p className="font-serif font-bold text-foreground">
                Letter received 50 likes
              </p>
              <p className="text-sm text-muted-foreground">1 week ago</p>
            </div>
          </div>

          {/* Activity Item 3 */}
          <div className="flex gap-4 pb-4 border-b border-border">
            <Mail className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <p className="font-serif font-bold text-foreground">
                Sent letter to Japan
              </p>
              <p className="text-sm text-muted-foreground">2 weeks ago</p>
            </div>
          </div>

          {/* Activity Item 4 */}
          <div className="flex gap-4">
            <MessageCircle className="w-6 h-6 text-secondary" />
            <div className="flex-1">
              <p className="font-serif font-bold text-foreground">
                Received 5 letter replies
              </p>
              <p className="text-sm text-muted-foreground">3 weeks ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Link */}
      <div className="text-center">
        <Link
          href="/app/settings"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Manage profile settings and privacy
        </Link>
      </div>
    </div>
  );
}
