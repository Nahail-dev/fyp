'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Lock, Eye, Trash2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailOnDelivery: true,
    emailOnReply: true,
    weeklyDigest: false,
    stampUnlock: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showStamps: true,
    allowMessages: true,
  });

  type NotificationKey = keyof typeof notifications;
  type PrivacyKey = keyof typeof privacy;

  const handleNotificationChange = (key: NotificationKey) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: PrivacyKey) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app" className="p-2 hover:bg-muted rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
      </div>

      {/* Notifications Section */}
      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-4">
          {([
            { key: 'emailOnDelivery', label: 'Email when letter is delivered', desc: 'Get notified when your letter arrives' },
            { key: 'emailOnReply', label: 'Email on new replies', desc: 'Receive notifications for incoming letters' },
            { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of your letter activity' },
            { key: 'stampUnlock', label: 'Stamp unlock notifications', desc: 'Be notified when you unlock new stamps' },
          ] satisfies Array<{ key: NotificationKey; label: string; desc: string }>).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition">
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[key as keyof typeof notifications]}
                onChange={() => handleNotificationChange(key)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Section */}
      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-secondary" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Privacy</h2>
        </div>

        <div className="space-y-4">
          {([
            { key: 'profilePublic', label: 'Public profile', desc: 'Allow others to view your profile' },
            { key: 'showStamps', label: 'Show stamp collection', desc: 'Display your stamps publicly' },
            { key: 'allowMessages', label: 'Allow messages', desc: 'Let others send you letters' },
          ] satisfies Array<{ key: PrivacyKey; label: string; desc: string }>).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition">
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={privacy[key as keyof typeof privacy]}
                onChange={() => handlePrivacyChange(key)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="postal-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Account</h2>
        </div>

        <div className="space-y-4">
          <button className="w-full p-4 border border-border rounded-lg hover:bg-muted/30 transition text-left font-medium text-foreground">
            Change Password
          </button>
          <button className="w-full p-4 border border-border rounded-lg hover:bg-muted/30 transition text-left font-medium text-foreground">
            Download Your Data
          </button>
          <button className="w-full p-4 border border-destructive rounded-lg hover:bg-destructive/10 transition text-left font-medium text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button className="flex-1 px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
        <button className="flex-1 px-6 py-3 rounded-sm border border-border text-foreground hover:bg-muted transition font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
}
