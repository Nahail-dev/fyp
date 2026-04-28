'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Reply, Flag, MoreVertical } from 'lucide-react';

interface Letter {
  id: string;
  from: string;
  location: string;
  date: string;
  subject: string;
  stamp?: string;
  content: string;
  signature: string;
  likes: number;
  isLiked: boolean;
  replies: number;
}

const mockLetter: Letter = {
  id: '1',
  from: 'Emma Johnson',
  location: 'Portland, Oregon',
  date: 'Mar 15, 2024',
  subject: 'Thoughts on a Rainy Morning',
  stamp: 'Wildflower',
  content: `Dear Friend,

Today I woke to the sound of rain against my window—a gentle reminder that not everything needs to be perfect to be beautiful. As I watched the droplets race down the glass, I found myself thinking about our last conversation.

You asked me what I was searching for in life. At the time, I wasn't sure how to answer. But now, sitting here with a warm cup of tea, I think I finally understand. I'm searching for moments like these. Moments where the world slows down, and I can simply be present.

The rain continues to fall outside, and I can see the wet streets reflecting the morning light. There's something magical about Portland in the spring. The flowers are beginning to bloom, and everything feels full of possibility.

I hope this letter finds you well. I'd love to hear what you're discovering about yourself these days. What does a beautiful life look like to you?

Looking forward to your response.`,
  signature: 'With warmth, Emma',
  likes: 234,
  isLiked: false,
  replies: 12,
};

export default function LetterPage({ params }: { params: { id: string } }) {
  const [isOpened, setIsOpened] = useState(false);
  const [isLiked, setIsLiked] = useState(mockLetter.isLiked);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/app/inbox"
          className="p-2 hover:bg-muted rounded-sm transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">{mockLetter.subject}</h1>
          <p className="text-muted-foreground">From {mockLetter.from}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[600px] py-8">
        <div className="w-full max-w-2xl">
          {!isOpened ? (
            /* Closed Envelope */
            <div
              onClick={() => setIsOpened(true)}
              className="cursor-pointer group"
            >
              <div className="postal-card shadow-xl hover:shadow-2xl transition-all animate-letter-arrival">
                {/* Envelope */}
                <div className="relative h-96 bg-gradient-to-br from-card to-muted/30 flex items-center justify-center overflow-hidden">
                  {/* Envelope Flap */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-card border-b border-border transform group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-5xl">✉</div>
                      <p className="text-muted-foreground text-sm">Click to open</p>
                    </div>
                  </div>

                  {/* Envelope Body */}
                  <div className="w-full px-8 space-y-4 text-center pt-20">
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      {mockLetter.subject}
                    </h2>
                    <p className="text-muted-foreground">From {mockLetter.from}</p>
                    <p className="text-sm text-muted-foreground">
                      {mockLetter.location}
                    </p>
                  </div>

                  {/* Stamp */}
                  <div className="absolute top-6 right-6 w-20 h-24 border-2 border-primary/30 rounded-sm bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:animate-stamp-spin transition-transform">
                    <div className="text-center text-xs font-serif font-bold text-primary">
                      <div>STAMP</div>
                      <div className="text-xl mt-1">🌸</div>
                    </div>
                  </div>

                  {/* Postmark */}
                  <div className="absolute top-8 right-28 w-12 h-12 border-2 border-primary rounded-full opacity-50 flex items-center justify-center text-xs font-mono text-primary">
                    {mockLetter.date.split(',')[1].trim()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Opened Letter */
            <div className="space-y-8 animate-envelope-open">
              {/* Letter Content */}
              <div className="postal-card p-12 space-y-6 shadow-lg">
                {/* Header */}
                <div className="border-b border-border pb-6">
                  <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                    {mockLetter.subject}
                  </h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>From:</strong> {mockLetter.from}
                    </p>
                    <p>
                      <strong>Location:</strong> {mockLetter.location}
                    </p>
                    <p>
                      <strong>Date:</strong> {mockLetter.date}
                    </p>
                    {mockLetter.stamp && (
                      <p>
                        <strong>Stamp:</strong> {mockLetter.stamp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Letter Body */}
                <div className="font-serif text-lg leading-relaxed text-foreground space-y-4 whitespace-pre-wrap">
                  {mockLetter.content}
                </div>

                {/* Signature */}
                <div className="pt-6 border-t border-border text-right">
                  <p className="font-serif text-lg text-foreground italic">
                    {mockLetter.signature}
                  </p>
                </div>
              </div>

              {/* Interactions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Like */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="postal-card p-4 flex items-center justify-center gap-3 hover:shadow-lg transition-all group"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isLiked ? 'fill-secondary text-secondary' : 'text-muted-foreground group-hover:text-secondary'
                    }`}
                  />
                  <span className="font-serif font-bold text-foreground">
                    {isLiked ? mockLetter.likes + 1 : mockLetter.likes}
                  </span>
                </button>

                {/* Reply */}
                <Link
                  href="#reply"
                  className="postal-card p-4 flex items-center justify-center gap-3 hover:shadow-lg transition-all group"
                >
                  <Reply className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-serif font-bold text-foreground">
                    {mockLetter.replies} Replies
                  </span>
                </Link>

                {/* Share */}
                <button className="postal-card p-4 flex items-center justify-center gap-3 hover:shadow-lg transition-all group">
                  <Share2 className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                  <span className="font-serif font-bold text-foreground">Share</span>
                </button>
              </div>

              {/* Reply Section */}
              <div
                id="reply"
                className="postal-card p-8 space-y-4"
              >
                <h3 className="text-xl font-serif font-bold text-foreground">Write a Reply</h3>
                <textarea
                  placeholder="Write your thoughtful response..."
                  className="w-full p-4 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif min-h-[200px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                    <Flag className="w-5 h-5 inline mr-2" />
                    Report
                  </button>
                  <button className="px-6 py-2 bg-primary text-primary-foreground font-serif font-bold rounded-sm hover:bg-primary/90 transition-all">
                    Send Reply
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <div className="flex justify-center pt-8">
                <Link
                  href="/app/inbox"
                  className="px-6 py-2 border border-border rounded-sm text-foreground hover:bg-muted transition-colors font-serif font-bold"
                >
                  Back to Inbox
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
