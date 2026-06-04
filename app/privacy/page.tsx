'use client';

import Link from 'next/link';
import { Lock, Mail, MapPin, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Yuubin collects the information needed to create and operate your account, including your email address, username, full name, selected avatar, profile bio, interests, theme preference, city for delivery calculation, and profile visibility setting.',
      'When you use the letter system, we store letter metadata such as sender, recipient, stamp ID, language, delivery status, sent time, estimated delivery time, and read/delivery state. Letter content is stored so the recipient can read it after delivery.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'We use your data to authenticate your account, show your profile, calculate delayed delivery time, save drafts, send and receive letters, display stamp inventory, show notifications, and power the Explore page for public profiles.',
      'Your selected city is used for delivery timing rules. You provide the city once, and Yuubin uses its country, continent, timezone, and coordinates from the cities dataset.',
    ],
  },
  {
    title: 'Profiles and Explore',
    body: [
      'If your profile visibility is public, your profile card may appear in Explore with your avatar, full name, username, interests, bio, and city/country. If your profile visibility is private, your profile is hidden from Explore.',
      'Your email address is not shown in recipient search or Explore.',
    ],
  },
  {
    title: 'Cookies and Local Storage',
    body: [
      'Yuubin uses essential browser storage for authentication, remember-me behavior, cookie consent, theme settings, notification preferences, and privacy preferences that are not yet server-backed.',
      'You can clear browser storage from your browser settings, but doing so may sign you out or reset local preferences.',
    ],
  },
  {
    title: 'Security',
    body: [
      'Authentication is handled through Supabase Auth. Password reset, email confirmation, hCaptcha, and session handling are part of the security flow.',
      'No web application can guarantee perfect security, but Yuubin is designed to limit exposed personal information and avoid showing user emails publicly.',
    ],
  },
  {
    title: 'Your Choices',
    body: [
      'You can edit your profile, change profile visibility, choose an avatar, set your city, download your data from Settings, and deactivate your profile.',
      'Some features, such as email notifications and replies, may appear as planned or disabled until they are fully implemented.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card px-6 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-9 w-9 text-primary" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: June 4, 2026</p>
          <p className="max-w-3xl text-muted-foreground">
            This page explains how Yuubin handles information inside the digital letter exchange platform.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Mail, label: 'Letters', text: 'Stored for sender and recipient workflows.' },
              { icon: MapPin, label: 'City Data', text: 'Used to calculate delayed delivery.' },
              { icon: Lock, label: 'Privacy', text: 'Public/private profile visibility is respected.' },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="postal-card p-5">
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <p className="font-serif font-bold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          {sections.map((section, index) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                {index + 1}. {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold text-foreground">7. Contact</h2>
            <p className="leading-relaxed text-muted-foreground">
              For FYP review, support, or privacy questions, contact the Yuubin development team through the project owner.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 border-t border-border pt-8">
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            <Link href="/updates" className="text-primary hover:underline">
              Update Log
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
