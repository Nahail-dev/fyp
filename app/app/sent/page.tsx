'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Calendar, User, Eye, Trash2 } from 'lucide-react';

const mockSentLetters = [
  {
    id: 1,
    recipient: 'Sarah Johnson',
    subject: 'Thoughts on autumn walks',
    sentDate: '2024-04-20',
    deliveryDate: '2024-04-25',
    stamp: 'Golden Autumn Leaf',
    status: 'delivered',
  },
  {
    id: 2,
    recipient: 'Marco Chen',
    subject: 'Summer memories and dreams',
    sentDate: '2024-04-15',
    deliveryDate: '2024-04-22',
    stamp: 'Ocean Waves',
    status: 'delivered',
  },
  {
    id: 3,
    recipient: 'Elena Rodriguez',
    subject: 'Letters about the book I just finished',
    sentDate: '2024-04-10',
    deliveryDate: '2024-04-17',
    stamp: 'Literary Dreams',
    status: 'delivered',
  },
  {
    id: 4,
    recipient: 'James Wilson',
    subject: 'Weekend plans and adventures',
    sentDate: '2024-04-05',
    deliveryDate: '2024-04-12',
    stamp: 'Mountain Peak',
    status: 'delivered',
  },
  {
    id: 5,
    recipient: 'Sophie Laurent',
    subject: 'Reflections on life changes',
    sentDate: '2024-03-30',
    deliveryDate: '2024-04-06',
    stamp: 'New Beginnings',
    status: 'delivered',
  },
];

export default function SentLettersPage() {
  const [filter, setFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-status-delivered/10 text-status-delivered';
      case 'in-transit':
        return 'bg-status-transit/10 text-status-transit';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Send className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Sent Letters</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {mockSentLetters.length} letters sent
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
        {mockSentLetters.map(letter => (
          <div key={letter.id} className="postal-card p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">{letter.recipient}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(letter.status)}`}>
                    {letter.status === 'delivered' ? '✓ Delivered' : 'In Transit'}
                  </span>
                </div>
                <p className="text-lg font-serif text-foreground">{letter.subject}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Sent {letter.sentDate}</span>
                  </div>
                  <div>Stamp: {letter.stamp}</div>
                </div>
                {letter.status === 'delivered' && (
                  <p className="text-sm text-status-delivered font-medium">
                    Delivered on {letter.deliveryDate}
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
        ))}
      </div>

      {mockSentLetters.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <Send className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-lg font-serif text-muted-foreground">No sent letters yet</p>
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
