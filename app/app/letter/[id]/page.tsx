'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Flag,
  Lock,
  Mail,
  MapPin,
  Reply,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { AppScreenLoader } from '@/components/app-screen-loader';
import { getStampById } from '@/lib/stamps';
import {
  formatDeliveryEta,
  getLetterDisplayStatus,
  getLetterProgress,
} from '@/lib/letterDeliveryStatus';

interface LetterUser {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface LetterCity {
  uuid_id: string;
  city: string;
  country: string;
  admin_name?: string | null;
}

interface Letter {
  id: string;
  title: string;
  content: string;
  status: string | null;
  language?: 'en' | 'ur' | string | null;
  created_at: string;
  sent_at?: string | null;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
  delivery_rule?: string | null;
  delivery_hours?: number | null;
  stamp_id?: string | null;
  sender?: LetterUser | null;
  recipient?: LetterUser | null;
  sender_city?: LetterCity | null;
  recipient_city?: LetterCity | null;
}

export default function LetterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, setProgressTick] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setIsLoading(true);
        const [
          {
            data: { user },
          },
          {
            data: { session },
          },
        ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);
        const token = session?.access_token;
        const letterResponse = await fetch(`/api/letters/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        });
        const data = await letterResponse.json().catch(() => ({}));

        if (!letterResponse.ok) {
          throw new Error(
            typeof data.error === 'string' ? data.error : 'Failed to load letter',
          );
        }

        setCurrentUserId(user?.id ?? null);
        setLetter(data.letter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load letter');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchLetter();
    }
  }, [params.id]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setProgressTick((value) => value + 1);
    }, 5000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!letter || letter.delivered_at || getLetterDisplayStatus(letter) !== 'delivered') {
      return;
    }

    const syncDelivery = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/letters/${letter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'sync-delivery' }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.letter) {
        setLetter((current) => (current ? { ...current, ...data.letter } : current));
      }
    };

    syncDelivery();
  }, [letter]);

  if (isLoading) {
    return (
      <AppScreenLoader title="Letter" message="Loading letter..." />
    );
  }

  if (error || !letter) {
    return (
      <div className="space-y-6">
        <Link
          href="/app/inbox"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Inbox
        </Link>
        <div className="postal-card p-8 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Letter not available
          </h1>
          <p className="mt-2 text-muted-foreground">{error || 'Could not load this letter.'}</p>
        </div>
      </div>
    );
  }

  const deliveryStatus = getLetterDisplayStatus(letter);
  const progress = getLetterProgress(letter);
  const senderName =
    letter.sender?.full_name || letter.sender?.username || 'Unknown sender';
  const senderLocation = letter.sender_city
    ? `${letter.sender_city.city}, ${letter.sender_city.country}`
    : 'Unknown location';
  const sentDate = letter.sent_at || letter.created_at;
  const isUrdu = letter.language === 'ur';
  const direction = isUrdu ? 'rtl' : 'ltr';
  const align = isUrdu ? 'text-right' : 'text-left';
  const font = isUrdu
    ? "[font-family:'Noto_Nastaliq_Urdu','Noto_Naskh_Arabic','Arial',sans-serif]"
    : 'font-serif';
  const stamp = getStampById(letter.stamp_id);
  const isSender = currentUserId === letter.sender?.id;
  const canOpenLetter = deliveryStatus === 'delivered' || isSender;
  const backHref = isSender ? '/app/sent' : '/app/inbox';
  const backLabel = isSender ? 'Back to Sent' : 'Back to Inbox';

  const deleteLetter = async () => {
    if (!currentUserId) return;
    setIsDeleting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/letters/${letter.id}`, {
        method: 'DELETE',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to delete letter');
      }
      router.push(backHref);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete letter');
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={backHref}
          className="p-2 hover:bg-muted rounded-sm transition-colors"
          title={backLabel}
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-serif font-bold text-foreground">
            {letter.title}
          </h1>
          <p className="text-muted-foreground">From {senderName}</p>
        </div>
        <button
          type="button"
          onClick={deleteLetter}
          disabled={isDeleting}
          className="ml-auto rounded-sm border border-border p-2 text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
          title="Delete letter"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {!canOpenLetter ? (
          <div className="postal-card overflow-hidden p-8 text-center">
            <div className="relative mx-auto mb-8 h-56 max-w-xl rounded-sm border border-border bg-muted/20 px-6 py-8">
              <div className="absolute left-8 right-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
              <div
                className="absolute left-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-status-transit transition-all"
                style={{ width: `calc((100% - 4rem) * ${progress / 100})` }}
              />
              <div className="absolute left-7 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-card text-primary shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Sent</span>
              </div>
              <div className="absolute right-7 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-card text-accent shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Arrival</span>
              </div>
              <div
                className="yuubin-transit-envelope absolute top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-sm border border-primary/40 bg-card text-primary shadow-lg"
                style={{
                  left: `clamp(2.25rem, calc(2rem + (100% - 4rem) * ${
                    progress / 100
                  }), calc(100% - 5.75rem))`,
                }}
              >
                <Mail className="h-7 w-7" />
              </div>
              <div className="absolute inset-x-6 bottom-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress}% travelled</span>
                <span>Arrives {formatDeliveryEta(letter.estimated_delivery_at)}</span>
              </div>
            </div>

            <div className="mx-auto max-w-lg space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Your Letter Is On Its Way
              </h2>
              <p className="text-muted-foreground">
                It is travelling from {senderLocation}. The seal opens automatically when
                delivery reaches 100%.
              </p>
              <p className="text-sm font-medium text-primary">
                Estimated opening time: {formatDeliveryEta(letter.estimated_delivery_at)}
              </p>
            </div>
          </div>
        ) : !isOpened ? (
          <button
            type="button"
            onClick={() => setIsOpened(true)}
            className="block w-full cursor-pointer text-left"
          >
            <div className="postal-card shadow-xl hover:shadow-2xl transition-all animate-letter-arrival">
              <div className="relative h-96 overflow-hidden bg-gradient-to-br from-card to-muted/30">
                <div className="absolute inset-x-0 top-0 flex h-1/2 items-center justify-center border-b border-border bg-card transition-transform duration-300 hover:-translate-y-2">
                  <div className="text-center space-y-4">
                    <div className="text-5xl">✉</div>
                    <p className="text-muted-foreground text-sm">Click to open</p>
                  </div>
                </div>
                <div className="flex h-full flex-col items-center justify-center px-8 pt-20 text-center">
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    {letter.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground">From {senderName}</p>
                  <p className="text-sm text-muted-foreground">{senderLocation}</p>
                </div>
                <div className="absolute right-6 top-6 flex h-24 w-20 items-center justify-center rounded-sm border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
                  <div className="text-center text-xs font-serif font-bold text-primary">
                    <div>STAMP</div>
                    <div className="relative mx-auto mt-1 h-12 w-12">
                      <Image
                        src={stamp.image}
                        alt={`${stamp.name} stamp`}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="space-y-8 animate-envelope-open">
            <div className="postal-card p-12 space-y-6 shadow-lg">
              <div className="border-b border-border pb-6">
                <h2
                  dir={direction}
                  className={`mb-4 break-words text-3xl font-bold text-foreground ${align} ${font}`}
                >
                  {letter.title}
                </h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>From:</strong> {senderName}
                  </p>
                  <p>
                    <strong>Location:</strong> {senderLocation}
                  </p>
                  <p>
                    <strong>Sent:</strong> {formatDeliveryEta(sentDate)}
                  </p>
                  <p>
                    <strong>Stamp:</strong> {stamp.name}
                  </p>
                </div>
              </div>

              <div
                dir={direction}
                className={`whitespace-pre-wrap text-lg leading-relaxed text-foreground ${align} ${font}`}
              >
                {letter.content}
              </div>
            </div>

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
                  <Reply className="mr-2 inline h-4 w-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
