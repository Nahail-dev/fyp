'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCircle2, Mail, X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabaseClient';

type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  related_user_id?: string | null;
  related_letter_id?: string | null;
  is_read: boolean;
  created_at: string;
};

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function notificationIcon(type: string) {
  if (type === 'letter_delivered') {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (type === 'letter_in_transit') {
    return <Zap className="h-4 w-4" />;
  }
  return <Mail className="h-4 w-4" />;
}

export function NotificationCenter({ userId }: { userId: string | null }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported',
  );
  const hasLoadedOnceRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;

      const nextNotifications = (data.notifications || []) as AppNotification[];
      const newUnread = nextNotifications.filter(
        (notification) => !notification.is_read && !seenIdsRef.current.has(notification.id),
      );

      setNotifications(nextNotifications);
      nextNotifications.forEach((notification) => seenIdsRef.current.add(notification.id));

      if (hasLoadedOnceRef.current) {
        newUnread.forEach((notification) => {
          toast(notification.title, {
            description: notification.message || undefined,
          });

          if (permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
              body: notification.message || undefined,
              icon: '/logos/favicon/favicon-32x32.png',
            });
            browserNotification.onclick = () => {
              window.focus();
              if (notification.related_letter_id) {
                router.push(`/app/letter/${notification.related_letter_id}`);
              }
            };
          }
        });
      }

      hasLoadedOnceRef.current = true;
    } catch (error) {
      console.log('[notifications] fetch failed:', error);
    }
  }, [permission, router, userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 15000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void fetchNotifications();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchNotifications, userId]);

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
  };

  const markRead = async (notificationId: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId, isRead: true }),
    });
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
  };

  const markAllRead = async () => {
    if (!userId) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, markAll: true }),
    });
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true })),
    );
  };

  const openNotification = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markRead(notification.id);
    }
    setIsOpen(false);
    if (notification.related_letter_id) {
      router.push(`/app/letter/${notification.related_letter_id}`);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-sm border border-border p-2 text-foreground transition hover:bg-muted"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-sm border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-serif font-bold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-sm p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-sm p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {permission === 'default' && (
            <div className="border-b border-border bg-primary/5 px-4 py-3">
              <button
                type="button"
                onClick={requestBrowserPermission}
                className="text-sm font-medium text-primary hover:underline"
              >
                Enable browser popups for new letters
              </button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/50" />
                <p className="font-serif font-bold text-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  Letter updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 hover:bg-muted/50 ${
                    notification.is_read ? '' : 'bg-primary/5'
                  }`}
                >
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {notificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-medium text-foreground">
                        {notification.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    {notification.message && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
