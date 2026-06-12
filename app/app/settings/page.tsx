'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ALargeSmall, ArrowLeft, Bell, Download, Eye, KeyRound, Languages, Lock, Save, Trash2 } from 'lucide-react';
import { createClient, resetBrowserClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useAccessibility } from '@/components/accessibility-context';

const SETTINGS_STORAGE_KEY = 'yuubin-settings';

type LocalSettings = {
  notifications: {
    weeklyDigest: boolean;
    stampUnlock: boolean;
  };
  privacy: {
    showStamps: boolean;
    allowMessages: boolean;
  };
};

const defaultLocalSettings: LocalSettings = {
  notifications: {
    weeklyDigest: false,
    stampUnlock: true,
  },
  privacy: {
    showStamps: true,
    allowMessages: true,
  },
};

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [notifications, setNotifications] = useState({
    emailOnDelivery: false,
    emailOnReply: false,
    weeklyDigest: defaultLocalSettings.notifications.weeklyDigest,
    stampUnlock: defaultLocalSettings.notifications.stampUnlock,
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showStamps: defaultLocalSettings.privacy.showStamps,
    allowMessages: defaultLocalSettings.privacy.allowMessages,
  });
  const supabase = createClient();
  const router = useRouter();
  const { language, setLanguage, setTextScale, textScale, t } = useAccessibility();

  type NotificationKey = keyof typeof notifications;
  type PrivacyKey = keyof typeof privacy;

  useEffect(() => {
    const loadSettings = async () => {
      const saved =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(SETTINGS_STORAGE_KEY)
          : null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<LocalSettings>;
          setNotifications((current) => ({
            ...current,
            weeklyDigest:
              parsed.notifications?.weeklyDigest ??
              defaultLocalSettings.notifications.weeklyDigest,
            stampUnlock:
              parsed.notifications?.stampUnlock ??
              defaultLocalSettings.notifications.stampUnlock,
          }));
          setPrivacy((current) => ({
            ...current,
            showStamps:
              parsed.privacy?.showStamps ?? defaultLocalSettings.privacy.showStamps,
            allowMessages:
              parsed.privacy?.allowMessages ?? defaultLocalSettings.privacy.allowMessages,
          }));
        } catch {
          window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/profile', {
        credentials: 'include',
        headers,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setPrivacy((current) => ({
          ...current,
          profilePublic: data.profile_visibility !== 'private',
        }));
      }
    };

    loadSettings();
  }, []);

  const disabledNotificationKeys: NotificationKey[] = ['emailOnDelivery', 'emailOnReply'];

  const handleNotificationChange = (key: NotificationKey) => {
    if (disabledNotificationKeys.includes(key)) return;
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrivacyChange = (key: PrivacyKey) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          profile_visibility: privacy.profilePublic ? 'public' : 'private',
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to save settings',
        );
      }

      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          notifications: {
            weeklyDigest: notifications.weeklyDigest,
            stampUnlock: notifications.stampUnlock,
          },
          privacy: {
            showStamps: privacy.showStamps,
            allowMessages: privacy.allowMessages,
          },
        } satisfies LocalSettings),
      );

      toast.success('Settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadData = async () => {
    setIsExporting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!user) throw new Error('Please sign in first');

      const headers: Record<string, string> = {};
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

      const [profileRes, inboxRes, sentRes, draftsRes, stampsRes, notificationsRes] =
        await Promise.all([
          fetch('/api/profile', { credentials: 'include', headers }),
          fetch(`/api/letters?userId=${user.id}&type=inbox`),
          fetch(`/api/letters?userId=${user.id}&type=sent`),
          fetch(`/api/letters?userId=${user.id}&type=drafts`),
          fetch(`/api/stamps?userId=${user.id}&type=collected`),
          fetch(`/api/notifications?userId=${user.id}`),
        ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: await profileRes.json().catch(() => null),
        inbox: await inboxRes.json().catch(() => null),
        sent: await sentRes.json().catch(() => null),
        drafts: await draftsRes.json().catch(() => null),
        stamps: await stampsRes.json().catch(() => null),
        notifications: await notificationsRes.json().catch(() => null),
        local_settings: {
          notifications,
          privacy,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `yuubin-data-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Data export downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not download data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      'Deactivate your account? Your profile will be hidden and you will be signed out.',
    );
    if (!confirmed) return;

    setIsDeactivating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          is_active: false,
          profile_visibility: 'private',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Could not deactivate account',
        );
      }

      await supabase.auth.signOut();
      resetBrowserClient();
      toast.success('Account deactivated');
      router.push('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not deactivate account');
    } finally {
      setIsDeactivating(false);
    }
  };

  const notificationRows = [
    {
      key: 'emailOnDelivery' as const,
      label: 'Email when letter is delivered',
      desc: 'Email delivery is not enabled yet.',
      disabled: true,
    },
    {
      key: 'emailOnReply' as const,
      label: 'Email on new replies',
      desc: 'Reply email notifications will be available after replies are built.',
      disabled: true,
    },
    {
      key: 'weeklyDigest' as const,
      label: 'Weekly in-app digest',
      desc: 'Save your preference for weekly Yuubin activity summaries.',
      disabled: false,
    },
    {
      key: 'stampUnlock' as const,
      label: 'Stamp unlock notifications',
      desc: 'Show app notifications when new stamps become available.',
      disabled: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app" className="p-2 hover:bg-muted rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
      </div>

      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <ALargeSmall className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-serif font-bold text-foreground">{t('accessibility')}</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="mb-4 flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{t('language')}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ur'
                    ? 'ویب سائٹ اردو اور دائیں سے بائیں انداز میں دکھائی جائے گی۔'
                    : 'Switch Yuubin between English and Urdu RTL mode.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'en', label: t('english') },
                { value: 'ur', label: t('urdu') },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={`rounded-sm border px-4 py-3 font-medium transition ${
                    language === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:bg-muted/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="mb-4 flex items-center gap-3">
              <ALargeSmall className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{t('textSize')}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ur'
                    ? 'کمزور نظر والے صارفین کے لیے متن بڑا کریں۔'
                    : 'Increase text size for users who need easier reading.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'normal', label: t('normalText'), sample: 'A' },
                { value: 'large', label: t('largeText'), sample: 'A+' },
                { value: 'extra', label: t('extraLargeText'), sample: 'A++' },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTextScale(option.value)}
                  className={`rounded-sm border px-3 py-3 text-center transition ${
                    textScale === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="block font-bold">{option.sample}</span>
                  <span className="block text-xs opacity-80">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-4">
          {notificationRows.map(({ key, label, desc, disabled }) => (
            <div
              key={key}
              className={`flex items-center justify-between p-4 border border-border rounded-lg transition ${
                disabled ? 'opacity-60' : 'hover:bg-muted/30'
              }`}
            >
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <input
                type="checkbox"
                disabled={disabled}
                checked={notifications[key]}
                onChange={() => handleNotificationChange(key)}
                className={`w-5 h-5 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-secondary" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Privacy</h2>
        </div>

        <div className="space-y-4">
          {([
            { key: 'profilePublic', label: 'Public profile', desc: 'Allow others to view your profile in Explore' },
            { key: 'showStamps', label: 'Show stamp collection', desc: 'Save whether your stamp collection should be shown publicly later' },
            { key: 'allowMessages', label: 'Allow messages', desc: 'Save whether other users can write letters to you later' },
          ] satisfies Array<{ key: PrivacyKey; label: string; desc: string }>).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition">
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={privacy[key]}
                onChange={() => handlePrivacyChange(key)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Account</h2>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/forgot-password"
            className="flex w-full items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition text-left font-medium text-foreground"
          >
            <KeyRound className="w-5 h-5 text-primary" />
            Change Password
          </Link>
          <button
            onClick={handleDownloadData}
            disabled={isExporting}
            className="flex w-full items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition text-left font-medium text-foreground disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-accent" />
            {isExporting ? 'Preparing Download...' : 'Download Your Data'}
          </button>
          <button
            onClick={handleDeactivateAccount}
            disabled={isDeactivating}
            className="w-full p-4 border border-destructive rounded-lg hover:bg-destructive/10 transition text-left font-medium text-destructive flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex-1 px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => router.push('/app')}
          className="flex-1 px-6 py-3 rounded-sm border border-border text-foreground hover:bg-muted transition font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
