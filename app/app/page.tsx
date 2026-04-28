'use client';

import { Mail, MapPin, Calendar, Heart, Reply } from 'lucide-react';
import Link from 'next/link';

interface Letter {
  id: string;
  from: string;
  location: string;
  date: string;
  preview: string;
  status: 'pending' | 'in-transit' | 'delivered';
  likes: number;
  isLiked: boolean;
}

const mockLetters: Letter[] = [
  {
    id: '1',
    from: 'Emma Johnson',
    location: 'Portland, Oregon',
    date: 'Mar 15, 2024',
    preview: 'Dear Friend, I wanted to share a moment that changed my perspective today...',
    status: 'delivered',
    likes: 234,
    isLiked: false,
  },
  {
    id: '2',
    from: 'Marcus Chen',
    location: 'Tokyo, Japan',
    date: 'Mar 14, 2024',
    preview: 'Greetings! The cherry blossoms are in full bloom here. I wanted to invite you...',
    status: 'in-transit',
    likes: 156,
    isLiked: true,
  },
  {
    id: '3',
    from: 'Sofia Rodriguez',
    location: 'Barcelona, Spain',
    date: 'Mar 13, 2024',
    preview: 'Hola! I discovered this beautiful little café today and thought of you...',
    status: 'pending',
    likes: 89,
    isLiked: false,
  },
  {
    id: '4',
    from: 'James Wilson',
    location: 'Edinburgh, Scotland',
    date: 'Mar 12, 2024',
    preview: 'My dear friend, as I walked through the Highlands today, I reflected on our...',
    status: 'delivered',
    likes: 312,
    isLiked: true,
  },
  {
    id: '5',
    from: 'Aisha Patel',
    location: 'Mumbai, India',
    date: 'Mar 11, 2024',
    preview: 'Hello! The monsoon season has arrived, and I am reminded of the stories you told me...',
    status: 'in-transit',
    likes: 198,
    isLiked: false,
  },
  {
    id: '6',
    from: 'Luc Dubois',
    location: 'Paris, France',
    date: 'Mar 10, 2024',
    preview: 'Mon ami, I spent the afternoon at a gallery thinking about creativity and...',
    status: 'delivered',
    likes: 267,
    isLiked: false,
  },
];

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
  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Your Letters</h2>
        <p className="text-muted-foreground">Connect with thoughtful writers from around the world</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Letters Received</p>
          <p className="text-3xl font-serif font-bold text-primary">24</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Letters Sent</p>
          <p className="text-3xl font-serif font-bold text-secondary">18</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-secondary h-1 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Stamps Collected</p>
          <p className="text-3xl font-serif font-bold text-accent">12</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-accent h-1 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="postal-card p-6 space-y-2">
          <p className="text-muted-foreground text-sm">Total Likes</p>
          <p className="text-3xl font-serif font-bold text-status-transit">1,523</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-status-transit h-1 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      {/* Letters Grid */}
      <div>
        <h3 className="text-xl font-serif font-bold text-foreground mb-6">Recent Letters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLetters.map((letter) => (
            <Link
              key={letter.id}
              href={`/app/letter/${letter.id}`}
              className="postal-card p-6 hover:shadow-lg transition-all group cursor-pointer space-y-4 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                    {letter.from}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {letter.location}
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(letter.status)}`}>
                  {getStatusLabel(letter.status)}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {letter.date}
              </div>

              {/* Preview */}
              <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                {letter.preview}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-secondary transition-colors group/btn">
                    <Heart className={`w-4 h-4 ${letter.isLiked ? 'fill-secondary' : ''}`} />
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
          ))}
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
