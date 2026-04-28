'use client';

import { Mail, MapPin, Calendar, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';

interface InboxLetter {
  id: string;
  from: string;
  location: string;
  date: string;
  subject: string;
  status: 'delivered' | 'in-transit' | 'pending';
  progress: number;
  estimatedDelivery?: string;
  isRead: boolean;
}

const mockInbox: InboxLetter[] = [
  {
    id: '1',
    from: 'Emma Johnson',
    location: 'Portland, Oregon',
    date: 'Mar 15, 2024',
    subject: 'Thoughts on a Rainy Morning',
    status: 'delivered',
    progress: 100,
    isRead: true,
  },
  {
    id: '2',
    from: 'Marcus Chen',
    location: 'Tokyo, Japan',
    date: 'Mar 14, 2024',
    subject: 'Cherry Blossoms & New Beginnings',
    status: 'in-transit',
    progress: 65,
    estimatedDelivery: 'Mar 18, 2024',
    isRead: false,
  },
  {
    id: '3',
    from: 'Sofia Rodriguez',
    location: 'Barcelona, Spain',
    date: 'Mar 13, 2024',
    subject: 'A Café Discovery',
    status: 'pending',
    progress: 20,
    estimatedDelivery: 'Mar 20, 2024',
    isRead: false,
  },
  {
    id: '4',
    from: 'James Wilson',
    location: 'Edinburgh, Scotland',
    date: 'Mar 12, 2024',
    subject: 'The Highlands Call',
    status: 'delivered',
    progress: 100,
    isRead: true,
  },
  {
    id: '5',
    from: 'Aisha Patel',
    location: 'Mumbai, India',
    date: 'Mar 11, 2024',
    subject: 'Monsoon Reflections',
    status: 'in-transit',
    progress: 45,
    estimatedDelivery: 'Mar 17, 2024',
    isRead: false,
  },
  {
    id: '6',
    from: 'Luc Dubois',
    location: 'Paris, France',
    date: 'Mar 10, 2024',
    subject: 'Artistry & Philosophy',
    status: 'delivered',
    progress: 100,
    isRead: true,
  },
];

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

export default function InboxPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Inbox</h2>
        <p className="text-muted-foreground">Track your incoming letters and delivery status</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 rounded-sm bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
          All Letters
        </button>
        <button className="px-4 py-2 rounded-sm border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
          In Transit
        </button>
        <button className="px-4 py-2 rounded-sm border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
          Pending
        </button>
        <button className="px-4 py-2 rounded-sm border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
          Delivered
        </button>
        <button className="px-4 py-2 rounded-sm border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
          Unread
        </button>
      </div>

      {/* Letters List */}
      <div className="space-y-3">
        {mockInbox.map((letter) => (
          <Link
            key={letter.id}
            href={`/app/letter/${letter.id}`}
            className={`postal-card p-6 hover:shadow-lg transition-all cursor-pointer block ${
              !letter.isRead ? 'border-l-4 border-l-primary' : ''
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
                    <h3 className={`font-serif text-lg ${letter.isRead ? 'text-foreground' : 'font-bold text-foreground'}`}>
                      {letter.subject}
                    </h3>
                    <p className="text-sm text-muted-foreground">From {letter.from}</p>
                  </div>
                  
                  {!letter.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                    </div>
                  )}
                </div>

                {/* Location & Date */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {letter.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {letter.date}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {getStatusLabel(letter.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {letter.progress}%
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
                      style={{ width: `${letter.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                {letter.estimatedDelivery && letter.status !== 'delivered' && (
                  <p className="text-xs text-muted-foreground">
                    Estimated delivery: {letter.estimatedDelivery}
                  </p>
                )}
              </div>

              {/* Postmark */}
              <div className="flex-shrink-0 text-right space-y-2">
                <div className="text-2xl text-primary/30 font-serif">✉</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State - Below existing letters */}
      {mockInbox.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <Mail className="w-16 h-16 text-muted-foreground mx-auto opacity-30" />
          <h3 className="text-xl font-serif font-bold text-foreground">No letters yet</h3>
          <p className="text-muted-foreground">Your inbox is empty. Share your profile to start receiving letters!</p>
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
