'use client';

import { useEffect, useState, useRef } from 'react';
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
import { parseLetterContent } from '@/lib/utils';

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
  const progress = letter ? getLetterProgress(letter) : 0;
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
  const [isOpening, setIsOpening] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [point, setPoint] = useState({ x: 50, y: 130, angle: 0 });
  const [pathLength, setPathLength] = useState(0);

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
    const updatePoint = () => {
      if (pathRef.current) {
        try {
          const totalLen = pathRef.current.getTotalLength();
          setPathLength(totalLen);
          const targetLength = totalLen * (progress / 100);
          const pt = pathRef.current.getPointAtLength(targetLength);
          const nextPt = pathRef.current.getPointAtLength(Math.min(totalLen, targetLength + 2));
          const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
          setPoint({ x: pt.x, y: pt.y, angle });
        } catch (e) {
          // Browser compatibility fallback
        }
      }
    };

    const timeout = setTimeout(updatePoint, 100);
    return () => clearTimeout(timeout);
  }, [progress, letter]);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);
    setSealCracked(true);
    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
    }, 1500);
  };

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
  const senderName =
    letter.sender?.full_name || letter.sender?.username || 'Unknown sender';
  const senderLocation = letter.sender_city
    ? `${letter.sender_city.city}, ${letter.sender_city.country}`
    : 'Unknown location';
  const sentDate = letter.sent_at || letter.created_at;
  const isUrdu = letter.language === 'ur';
  const direction = isUrdu ? 'rtl' : 'ltr';
  const align = isUrdu ? 'text-right' : 'text-left';
  const parsed = parseLetterContent(letter.content);
  const font = isUrdu
    ? "[font-family:'Noto_Nastaliq_Urdu','Noto_Naskh_Arabic','Arial',sans-serif]"
    : parsed.font;
  const color = parsed.color;
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
            {/* Curved Map-Based Delivery Tracker */}
            <div className="relative mx-auto mb-8 w-full max-w-xl rounded-sm border-2 border-[#E3D8C2] dark:border-[#3A332B] bg-[#FAF3E0] dark:bg-[#1E1916] p-6 shadow-md overflow-hidden select-none">
              
              {/* Map grid coordinate markings */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(139,111,71,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(139,111,71,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              
              {/* Map decorations: Compass Rose and flight path details */}
              <div className="absolute right-4 top-4 w-12 h-12 opacity-15 text-primary border border-primary/30 rounded-full flex items-center justify-center font-serif text-[10px] pointer-events-none">
                N
              </div>

              {/* SVG Curve Path Drawing */}
              <svg viewBox="0 0 500 180" className="w-full h-48 relative z-10">
                {/* Curved background line */}
                <path
                  id="delivery-path"
                  ref={pathRef}
                  d="M 50 130 C 150 40, 350 40, 450 130"
                  fill="none"
                  stroke="color-mix(in srgb, var(--border) 35%, transparent)"
                  strokeWidth="3.5"
                  className="map-route-line"
                />

                {/* Golden completed trace path */}
                <path
                  d="M 50 130 C 150 40, 350 40, 450 130"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="4"
                  strokeDasharray={pathLength || 420}
                  strokeDashoffset={(pathLength || 420) * (1 - progress / 100)}
                  className="transition-all duration-1000 ease-out"
                />

                {/* SVG Milestone Indicators */}
                {[
                  { pct: 0, label: 'Sent', x: 50, y: 130 },
                  { pct: 33, label: 'Sorting', x: 171.5, y: 69.3 },
                  { pct: 66, label: 'In Transit', x: 328.5, y: 69.3 },
                  { pct: 100, label: 'Arrival', x: 450, y: 130 },
                ].map((milestone, idx) => {
                  const active = progress >= milestone.pct;
                  return (
                    <g key={idx}>
                      <circle
                        cx={milestone.x}
                        cy={milestone.y}
                        r="8"
                        className={`${
                          active ? 'fill-primary milestone-glow' : 'fill-muted stroke-border stroke-2'
                        } transition-colors duration-500`}
                      />
                      <circle
                        cx={milestone.x}
                        cy={milestone.y}
                        r="4"
                        className="fill-background"
                      />
                      <text
                        x={milestone.x}
                        y={milestone.y + 24}
                        textAnchor="middle"
                        className={`font-serif text-[10px] font-bold ${
                          active ? 'fill-foreground' : 'fill-muted-foreground'
                        }`}
                      >
                        {milestone.label}
                      </text>
                    </g>
                  );
                })}

                {/* Gliding Envelope Icon */}
                {point && (
                  <g
                    transform={`translate(${point.x}, ${point.y}) rotate(${point.angle})`}
                    className="envelope-glide"
                  >
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="20"
                      rx="2"
                      className="fill-card stroke-primary stroke-2"
                    />
                    <path
                      d="M -14 -10 L 0 0 L 14 -10"
                      fill="none"
                      className="stroke-primary stroke-2"
                    />
                  </g>
                )}
              </svg>

              <div className="absolute inset-x-6 bottom-3 flex items-center justify-between text-xxs font-serif font-bold text-muted-foreground">
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
          <div className="perspective-[1000px] w-full max-w-xl mx-auto h-[450px] relative overflow-visible select-none">
            {/* The Envelope */}
            <div className={`relative w-full h-full bg-card rounded-sm shadow-xl border border-border transition-all duration-1000 ${
              isOpening ? 'translate-y-[200px] opacity-0 scale-95 pointer-events-none' : ''
            }`}>
              
              {/* Back Pocket Background */}
              <div className="absolute inset-0 bg-[#EADEC9] dark:bg-[#1E1712] rounded-sm overflow-hidden z-0">
                {/* Visual coordinate markings inside envelope back pocket */}
                <div className="absolute inset-0 opacity-10 font-mono text-[9px] p-4 text-[#8B6F47] select-none pointer-events-none">
                  YUUBIN POSTAL SERVICE · CONFIDENTIAL CORRESPONDENCE
                </div>
              </div>

              {/* Letter Paper (Slides Out Upward) */}
              <div 
                style={{
                  fontFamily: isUrdu ? undefined : (font === 'font-serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' : `var(--font-${font.replace('font-', '')}), cursive, sans-serif`),
                  color: parsed.color === 'text-foreground' ? undefined : `var(--ink-${parsed.color.replace('text-ink-', '')})`
                }}
                className={`absolute inset-x-6 top-6 bottom-6 bg-card border border-border/80 shadow-md p-8 rounded-sm select-none pointer-events-none transition-transform duration-1000 ease-in-out ${
                  isOpening ? 'translate-y-[-160px] scale-[1.03] z-25' : 'translate-y-0 z-10'
                }`}
              >
                {/* Truncated header of letter to show it rising out */}
                <h3 className="text-sm font-bold opacity-40 line-clamp-1 border-b border-border/40 pb-2">
                  {letter.title}
                </h3>
                <p className="text-xs opacity-30 mt-3 line-clamp-4 leading-loose">
                  {parsed.text}
                </p>
              </div>

              {/* Front Pocket Overlay (Bottom/Side Triangles) */}
              <div 
                className="absolute inset-x-0 bottom-0 h-2/3 border-t border-border/50 rounded-b-sm bg-gradient-to-t from-[#FDF8F3] to-[#FDF8F3]/95 dark:from-[#1C1816] dark:to-[#1C1816]/95 z-20"
                style={{
                  clipPath: 'polygon(0 100%, 50% 40%, 100% 100%, 100% 40%, 0 40%)'
                }}
              />
              {/* Left Triangle */}
              <div 
                className="absolute left-0 bottom-0 top-0 w-1/2 border-r border-border/50 bg-[#FDF8F3]/95 dark:bg-[#1C1816]/95 z-20"
                style={{
                  clipPath: 'polygon(0 0, 0 100%, 100% 100%)'
                }}
              />
              {/* Right Triangle */}
              <div 
                className="absolute right-0 bottom-0 top-0 w-1/2 border-l border-border/50 bg-[#FDF8F3]/95 dark:bg-[#1C1816]/95 z-20"
                style={{
                  clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
                }}
              />

              {/* Envelope Top Flap (Rotates Upward) */}
              <div 
                className={`absolute inset-x-0 top-0 h-1/2 bg-[#FDF8F3] dark:bg-[#1C1816] border-b border-border/30 origin-top z-30 transition-transform duration-700 ease-in-out`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  transform: isOpening ? 'rotateX(180deg)' : 'rotateX(0deg)',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />

              {/* Wax Seal Button */}
              <button
                type="button"
                onClick={handleOpenEnvelope}
                disabled={isOpening}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full cursor-pointer focus:outline-none z-40 transition-all hover:scale-105"
              >
                {/* Left Half of Seal */}
                <div 
                  className={`absolute inset-0 bg-[#8B1D1D] rounded-full border border-[#6B1313] shadow-md flex items-center justify-center ${
                    sealCracked ? 'animate-seal-left' : ''
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                  }}
                >
                  <span className="text-yellow-500 font-serif font-bold text-xs select-none -translate-x-0.5">Y</span>
                </div>
                {/* Right Half of Seal */}
                <div 
                  className={`absolute inset-0 bg-[#8B1D1D] rounded-full border border-[#6B1313] shadow-md flex items-center justify-center ${
                    sealCracked ? 'animate-seal-right' : ''
                  }`}
                  style={{
                    clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                  }}
                >
                  <span className="text-yellow-500 font-serif font-bold text-xs select-none translate-x-0.5">Y</span>
                </div>
              </button>

              {/* Instruction Prompt */}
              {!isOpening && (
                <div className="absolute bottom-6 left-0 right-0 text-center z-35 animate-bounce">
                  <p className="text-xxs font-serif font-bold text-muted-foreground uppercase tracking-widest bg-background/80 py-1.5 px-3 rounded-full border border-border inline-block shadow-sm">
                    Click the Seal to Open
                  </p>
                </div>
              )}
            </div>
          </div>
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
                style={{
                  fontFamily: isUrdu ? undefined : (font === 'font-serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' : `var(--font-${font.replace('font-', '')}), cursive, sans-serif`),
                  color: parsed.color === 'text-foreground' ? undefined : `var(--ink-${parsed.color.replace('text-ink-', '')})`
                }}
                className={`whitespace-pre-wrap text-lg leading-relaxed ${align}`}
              >
                {parsed.text}
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
