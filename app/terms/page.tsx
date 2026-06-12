'use client';

import Link from 'next/link';
import { FileText, ShieldAlert } from 'lucide-react';

const terms = [
  {
    title: 'Use of Yuubin',
    body: 'Yuubin is a web-based digital letter exchange platform for thoughtful, delayed communication. You agree to use it respectfully and only for lawful, personal, academic, or demonstration purposes.',
  },
  {
    title: 'Accounts and Security',
    body: 'You are responsible for your account credentials and activity. Supabase Auth handles account authentication, password reset, and email confirmation. You should not share your login details with others.',
  },
  {
    title: 'Letter Content',
    body: 'You are responsible for the letters, drafts, profile text, interests, and other content you create. Do not send harassment, threats, hate speech, illegal content, spam, or content that violates another person’s rights.',
  },
  {
    title: 'Delayed Delivery',
    body: 'Yuubin intentionally delays letters based on sender and receiver city data. Delivery progress and estimated delivery times are calculated by the system and may change as the project evolves.',
  },
  {
    title: 'Profiles and Privacy',
    body: 'Users can set profiles to public or private. Public profiles may appear in Explore. Private profiles are hidden from Explore, but existing letters and app records may remain available to involved users.',
  },
  {
    title: 'Stamps and Rewards',
    body: 'Stamps are provided by Yuubin as fixed project assets. Users cannot upload custom stamps. Stamp balances, transfers, and future unlock rules are part of the application’s feature system and may be updated.',
  },
  {
    title: 'Notifications',
    body: 'Yuubin may show in-app notifications and browser popups for letter activity. Email notification features may remain disabled until fully implemented.',
  },
  {
    title: 'Account Deactivation',
    body: 'Settings may allow account deactivation. Deactivation hides the profile and signs the user out, but it may not immediately remove all database records because letter history and project integrity may require retained records.',
  },
  {
    title: 'Changes to the Service',
    body: 'Yuubin is an FYP project and may change frequently. Features may be added, refined, disabled, or removed as development continues.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card px-6 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-9 w-9 text-primary" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">Last updated: June 4, 2026</p>
          <p className="max-w-3xl text-muted-foreground">
            These terms describe the expected use of Yuubin and the responsibilities of users of the platform.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="postal-card border-l-4 border-l-primary p-6">
            <div className="flex gap-3">
              <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                This page is written for the Yuubin FYP project and is not a substitute for professional legal advice.
              </p>
            </div>
          </div>

          {terms.map((term, index) => (
            <section key={term.title} className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                {index + 1}. {term.title}
              </h2>
              <p className="leading-relaxed text-muted-foreground">{term.body}</p>
            </section>
          ))}

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold text-foreground">10. Contact</h2>
            <p className="leading-relaxed text-muted-foreground">
              For questions about these terms, contact the Yuubin development team through the project owner.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 border-t border-border pt-8">
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/release-notes" className="text-primary hover:underline">
              Release Notes
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
