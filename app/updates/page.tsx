'use client';

import Link from 'next/link';
import { CalendarDays, CheckCircle2, Rocket } from 'lucide-react';

const updates = [
  {
    number: 'Update 09',
    title: 'Polished App Shell, Secure Letters, and Delivery Experience',
    date: 'June 5, 2026',
    status: 'Latest',
    changes: [
      'Added a mini user chip with avatar, username, dropdown links, and sign out.',
      'Added active-page highlighting in the sidebar.',
      'Fixed app shell scrolling so only the right content area scrolls.',
      'Added a shared postal screen loader across app pages.',
      'Secured letter detail links and cleaned reset-password tokens from URLs.',
      'Improved delayed letter arrival notifications and travelling letter UI.',
    ],
  },
  {
    number: 'Update 08',
    title: 'Explore, Settings, and Legal Pages',
    date: 'June 4, 2026',
    status: 'Completed',
    changes: [
      'Added public/private profile visibility.',
      'Built Explore page cards for public profiles.',
      'Added direct Write a Letter flow from Explore.',
      'Made Settings controls reflect working features.',
      'Added Privacy Policy, Terms of Service, and Update Log pages.',
    ],
  },
  {
    number: 'Update 07',
    title: 'Drafts and Live Delivery Progress',
    date: 'June 4, 2026',
    status: 'Completed',
    changes: [
      'Implemented database-backed draft saving.',
      'Added draft editing and draft deletion.',
      'Added sent letter deletion and letter-detail deletion.',
      'Automatically marks delivered letters when delivery time passes.',
      'Made delivery progress update without page refresh.',
    ],
  },
  {
    number: 'Update 06',
    title: 'Notifications and Avatar System',
    date: 'June 4, 2026',
    status: 'Completed',
    changes: [
      'Added six built-in Yuubin avatar images.',
      'Added avatar picker in profile settings.',
      'Added web notification bell and popup dropdown.',
      'Added unread notification badge.',
      'Added notification creation when a letter is sent.',
    ],
  },
  {
    number: 'Update 05',
    title: 'Stamp Catalog and Inventory',
    date: 'June 3, 2026',
    status: 'Completed',
    changes: [
      'Moved stamp images into project assets.',
      'Created a stamp catalog using fixed stamp IDs.',
      'Stored only stamp IDs on letters.',
      'Added stamp inventory transfer from sender to receiver.',
      'Updated stamp collection page to use project assets.',
    ],
  },
  {
    number: 'Update 04',
    title: 'Delayed Letter Delivery',
    date: 'June 3, 2026',
    status: 'Completed',
    changes: [
      'Added city selection during signup and profile editing.',
      'Added city search from imported cities dataset.',
      'Implemented city/country/continent based delivery rules.',
      'Added in-transit and delivered progress UI.',
      'Allowed sender to open sent letters while receiver waits for delivery.',
    ],
  },
  {
    number: 'Update 03',
    title: 'Recipient Search and Urdu Letters',
    date: 'June 3, 2026',
    status: 'Completed',
    changes: [
      'Added Gmail-style recipient search by username.',
      'Added recipient pill with avatar and username.',
      'Blocked self-search and self-send behavior.',
      'Added Urdu letter language option.',
      'Added Roman Urdu typing conversion and RTL preview fixes.',
    ],
  },
  {
    number: 'Update 02',
    title: 'Auth, Cookies, and Profile Stability',
    date: 'Earlier Development',
    status: 'Completed',
    changes: [
      'Kept authentication on Supabase email/password.',
      'Removed Google and Apple OAuth buttons.',
      'Added remember-me login behavior.',
      'Added forgot password and reset password pages.',
      'Added cookie consent banner and profile loading improvements.',
    ],
  },
  {
    number: 'Update 01',
    title: 'Yuubin Base Experience',
    date: 'Earlier Development',
    status: 'Completed',
    changes: [
      'Built the core Yuubin app structure.',
      'Added themed logos and theme switching.',
      'Created dashboard, inbox, sent, compose, profile, and stamp pages.',
      'Added public assets for logos, favicon, and stamps.',
      'Started the postal-inspired UI direction.',
    ],
  },
];

export default function UpdatesPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex items-center gap-3">
            <Rocket className="h-9 w-9 text-primary" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Update Log</h1>
          </div>
          <p className="max-w-3xl text-muted-foreground">
            A developer-maintained record of Yuubin updates, feature additions, and completed project milestones.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl space-y-6">
          {updates.map((update) => (
            <article key={update.number} className="postal-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-sm bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      {update.number}
                    </span>
                    <span className="rounded-sm border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                      {update.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    {update.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {update.date}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {update.changes.map((change) => (
                  <div key={change} className="flex gap-3 rounded-sm border border-border p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <p className="text-sm text-muted-foreground">{change}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}

          <div className="flex flex-wrap gap-4 border-t border-border pt-8">
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
