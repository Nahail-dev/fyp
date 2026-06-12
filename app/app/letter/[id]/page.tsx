'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Flag,
  Heart,
  Lock,
  Mail,
  MessageCircle,
  MapPin,
  Reply,
  Smile,
  Sparkles,
  Trash2,
  Frown,
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

interface LetterReply {
  id: string;
  letter_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  author?: LetterUser | null;
}

type ReactionKey = 'heart' | 'smile' | 'wow' | 'sad';

const reactionOptions: Array<{
  key: ReactionKey;
  label: string;
  icon: typeof Heart;
}> = [
  { key: 'heart', label: 'Heart', icon: Heart },
  { key: 'smile', label: 'Smile', icon: Smile },
  { key: 'wow', label: 'Wow', icon: Sparkles },
  { key: 'sad', label: 'Sad', icon: Frown },
];

export default function LetterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replies, setReplies] = useState<LetterReply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [threadError, setThreadError] = useState('');
  const [reactions, setReactions] = useState<Record<ReactionKey, number>>({
    heart: 0,
    smile: 0,
    wow: 0,
    sad: 0,
  });
  const [myReactions, setMyReactions] = useState<ReactionKey[]>([]);
  const [, setProgressTick] = useState(0);
  const supabase = createClient();

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined;
  };

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

  useEffect(() => {
    if (!letter || !currentUserId || getLetterDisplayStatus(letter) !== 'delivered') return;

    let isActive = true;

    const fetchThread = async (quiet = false) => {
      const headers = await getAuthHeaders();
      const [repliesResponse, reactionsResponse] = await Promise.all([
        fetch(`/api/letters/${letter.id}/replies`, {
          headers,
          credentials: 'include',
        }),
        fetch(`/api/letters/${letter.id}/reactions`, {
          headers,
          credentials: 'include',
        }),
      ]);

      const repliesData = await repliesResponse.json().catch(() => ({}));
      if (repliesResponse.ok) {
        if (!isActive) return;
        setReplies(repliesData.replies || []);
        if (!quiet) setThreadError('');
      } else if (typeof repliesData.error === 'string') {
        if (!quiet && isActive) setThreadError(repliesData.error);
      }

      const reactionsData = await reactionsResponse.json().catch(() => ({}));
      if (reactionsResponse.ok) {
        if (!isActive) return;
        setReactions({
          heart: reactionsData.counts?.heart || 0,
          smile: reactionsData.counts?.smile || 0,
          wow: reactionsData.counts?.wow || 0,
          sad: reactionsData.counts?.sad || 0,
        });
        setMyReactions(reactionsData.mine || []);
      } else if (typeof reactionsData.error === 'string') {
        if (!quiet && isActive) setThreadError(reactionsData.error);
      }
    };

    fetchThread();
    const channel = supabase
      .channel(`letter-thread-${letter.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letter_comments',
          filter: `letter_id=eq.${letter.id}`,
        },
        () => {
          void fetchThread(true);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letter_reactions',
          filter: `letter_id=eq.${letter.id}`,
        },
        () => {
          void fetchThread(true);
        },
      )
      .subscribe();
    const fallbackRefresh = window.setInterval(() => {
      void fetchThread(true);
    }, 10000);

    return () => {
      isActive = false;
      window.clearInterval(fallbackRefresh);
      void supabase.removeChannel(channel);
    };
  }, [letter?.id, currentUserId, letter?.delivered_at, letter?.status]);

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

  const refreshReplies = async () => {
    if (!letter) return;
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/letters/${letter.id}/replies`, {
      headers,
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setReplies(data.replies || []);
    }
  };

  const submitReply = async () => {
    if (!letter || !replyText.trim()) return;
    setIsReplying(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/letters/${letter.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(headers ?? {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          content: replyText,
          parentCommentId: replyParentId,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not send reply');
      }
      setReplyText('');
      setReplyParentId(null);
      setThreadError('');
      await refreshReplies();
    } catch (error) {
      setThreadError(error instanceof Error ? error.message : 'Could not send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const toggleReaction = async (reaction: ReactionKey) => {
    if (!letter) return;
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/letters/${letter.id}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
      },
      credentials: 'include',
      body: JSON.stringify({ reaction }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setThreadError(typeof data.error === 'string' ? data.error : 'Could not update reaction');
      return;
    }
    setThreadError('');

    const nextResponse = await fetch(`/api/letters/${letter.id}/reactions`, {
      headers,
      credentials: 'include',
    });
    const data = await nextResponse.json().catch(() => ({}));
    if (nextResponse.ok) {
      setReactions({
        heart: data.counts?.heart || 0,
        smile: data.counts?.smile || 0,
        wow: data.counts?.wow || 0,
        sad: data.counts?.sad || 0,
      });
      setMyReactions(data.mine || []);
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
              className="postal-card p-8 space-y-6"
            >
              <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    Replies and Reactions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Continue the letter as a thoughtful thread.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reactionOptions.map(({ key, label, icon: Icon }) => {
                    const active = myReactions.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleReaction(key)}
                        className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-sm transition ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:bg-muted'
                        }`}
                        title={label}
                      >
                        <Icon className="h-4 w-4" />
                        {reactions[key]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {threadError && (
                  <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {threadError}
                  </div>
                )}

                {replies.length === 0 ? (
                  <div className="rounded-sm border border-dashed border-border p-6 text-center">
                    <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                    <p className="font-serif font-bold text-foreground">No replies yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start the conversation with a reply below.
                    </p>
                  </div>
                ) : (
                  replies.map((reply) => {
                    const isChild = Boolean(reply.parent_comment_id);
                    const parentReply = reply.parent_comment_id
                      ? replies.find((item) => item.id === reply.parent_comment_id)
                      : null;
                    return (
                      <div
                        key={reply.id}
                        className={`rounded-sm border bg-muted/20 p-4 ${
                          isChild
                            ? 'ml-8 border-l-4 border-l-primary/50 border-border'
                            : 'border-border'
                        }`}
                      >
                        {parentReply && (
                          <p className="mb-3 rounded-sm bg-card px-3 py-2 text-xs text-muted-foreground">
                            Replying to @{parentReply.author?.username || 'unknown'}: “
                            {parentReply.content.slice(0, 80)}
                            {parentReply.content.length > 80 ? '...' : ''}”
                          </p>
                        )}
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {reply.author?.avatar_url ? (
                              <img
                                src={reply.author.avatar_url}
                                alt={reply.author.username}
                                className="h-8 w-8 rounded-full border border-primary/30 object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card">
                                <Mail className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                @{reply.author?.username || 'unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(reply.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReplyParentId(reply.id)}
                            className="rounded-sm px-3 py-1 text-xs text-primary hover:bg-primary/10"
                          >
                            Reply
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {reply.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {replyParentId && (
                <div className="flex items-center justify-between rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
                  <span className="text-primary">Replying in thread</span>
                  <button
                    type="button"
                    onClick={() => setReplyParentId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <textarea
                placeholder="Write your thoughtful response..."
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                className="w-full p-4 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif min-h-[200px] resize-none"
              />
              <div className="flex justify-between items-center">
                <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                  <Flag className="w-5 h-5 inline mr-2" />
                  Report
                </button>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={isReplying || !replyText.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground font-serif font-bold rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Reply className="mr-2 inline h-4 w-4" />
                  {isReplying ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
