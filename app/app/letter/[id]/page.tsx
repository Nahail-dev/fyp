'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  Lock,
  Mail,
  MapPin,
  Reply,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
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

function statusCopy(letter: Letter) {
  const status = getLetterDisplayStatus(letter);
  if (status === 'delivered') {
    return {
      icon: <CheckCircle2 className="h-5 w-5 text-accent" />,
      label: 'Delivered',
      body: 'This letter has arrived and can be opened.',
    };
  }
  if (status === 'in-transit') {
    return {
      icon: <Zap className="h-5 w-5 text-status-transit animate-delivery-pulse" />,
      label: 'In Transit',
      body: `This letter is still travelling. Estimated arrival: ${formatDeliveryEta(
        letter.estimated_delivery_at,
      )}.`,
    };
  }
  return {
    icon: <Clock className="h-5 w-5 text-status-pending" />,
    label: 'Pending',
    body: 'This letter has not started delivery yet.',
  };
}

export default function LetterPage() {
  const params = useParams<{ id: string }>();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setIsLoading(true);
        const [
          {
            data: { user },
          },
          response,
        ] = await Promise.all([
          supabase.auth.getUser(),
          fetch(`/api/letters/${params.id}`),
        ]);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="postal-card mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <p className="text-muted-foreground">Loading letter...</p>
        </div>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="p-8 space-y-6">
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
  const copy = statusCopy(letter);
  const stamp = getStampById(letter.stamp_id);
  const isSender = currentUserId === letter.sender?.id;
  const canOpenLetter = deliveryStatus === 'delivered' || isSender;
  const backHref = isSender ? '/app/sent' : '/app/inbox';
  const backLabel = isSender ? 'Back to Sent' : 'Back to Inbox';

  return (
    <div className="p-8">
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
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="postal-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {copy.icon}
              <div>
                <p className="font-serif font-bold text-foreground">{copy.label}</p>
                <p className="text-sm text-muted-foreground">{copy.body}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-foreground">{progress}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${
                deliveryStatus === 'delivered'
                  ? 'bg-accent'
                  : deliveryStatus === 'in-transit'
                  ? 'bg-status-transit'
                  : 'bg-status-pending'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="relative pt-4">
            <div className="absolute left-4 right-4 top-7 h-0.5 bg-border" />
            <div
              className={`absolute left-4 top-7 h-0.5 transition-all ${
                deliveryStatus === 'delivered' ? 'bg-accent' : 'bg-status-transit'
              }`}
              style={{ width: `calc((100% - 2rem) * ${progress / 100})` }}
            />
            <div className="relative grid grid-cols-3 text-center text-xs">
              {[
                { label: 'Sent', active: progress >= 1, icon: Mail },
                { label: 'Transit', active: progress > 1 && progress < 100, icon: Zap },
                { label: 'Arrived', active: progress === 100, icon: MapPin },
              ].map(({ label, active, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border bg-card ${
                      active
                        ? 'border-primary text-primary shadow-sm'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={active ? 'text-foreground' : 'text-muted-foreground'}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
            <p>
              <strong>Sent:</strong> {formatDeliveryEta(sentDate)}
            </p>
            <p>
              <strong>Estimated:</strong>{' '}
              {formatDeliveryEta(letter.estimated_delivery_at)}
            </p>
          </div>
        </div>

        {!canOpenLetter ? (
          <div className="postal-card p-12 text-center space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/25">
              <Lock className="h-9 w-9 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Letter Still Travelling
              </h2>
              <p className="text-muted-foreground">
                Yuubin keeps delayed letters sealed until their delivery time.
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
