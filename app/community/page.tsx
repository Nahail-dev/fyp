'use client';

import Link from 'next/link';
import { Heart, Shield, Users, AlertCircle } from 'lucide-react';

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-card border-b border-border py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Community Guidelines</h1>
          <p className="text-muted-foreground">Help us maintain a safe, respectful, and welcoming community for all</p>
        </div>
      </section>

      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Be Respectful */}
          <div className="postal-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-secondary" />
              <h2 className="text-2xl font-serif font-bold text-foreground">Be Respectful</h2>
            </div>
            <p className="text-muted-foreground">
              Treat all community members with respect and kindness. Yuubin is about meaningful connection, not conflict. Disagreements are okay, but harassment, bullying, and hate speech are never acceptable.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Respect people&apos;s identities and beliefs</li>
              <li>Disagree with ideas, not people</li>
              <li>Use inclusive language</li>
              <li>Celebrate diversity in our community</li>
            </ul>
          </div>

          {/* Keep it Safe */}
          <div className="postal-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-serif font-bold text-foreground">Keep it Safe</h2>
            </div>
            <p className="text-muted-foreground">
              Yuubin should be a safe space for everyone. Do not share illegal content, violence, explicit material, or anything that could harm others.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Don&apos;t share personal information without consent</li>
              <li>Report suspicious or harmful behavior</li>
              <li>Protect minors from inappropriate content</li>
              <li>Follow laws regarding online conduct</li>
            </ul>
          </div>

          {/* Be Authentic */}
          <div className="postal-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-serif font-bold text-foreground">Be Authentic</h2>
            </div>
            <p className="text-muted-foreground">
              Be yourself in Yuubin. We value genuine connections and authentic expression. Avoid impersonating others or creating fake accounts to mislead.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Use a genuine username and profile</li>
              <li>Don&apos;t impersonate other users</li>
              <li>Avoid spam and scams</li>
              <li>Share genuine thoughts and experiences</li>
            </ul>
          </div>

          {/* Report Issues */}
          <div className="postal-card p-8 space-y-4 bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <h2 className="text-2xl font-serif font-bold text-foreground">Report Issues</h2>
            </div>
            <p className="text-muted-foreground">
              If you see content that violates these guidelines, please report it immediately. We review all reports and take appropriate action.
            </p>
            <div className="space-y-3 pt-4">
              <p className="font-medium text-foreground">To report a letter:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Open the letter and click the report button</li>
                <li>Select the reason for reporting</li>
                <li>Add any additional context</li>
                <li>Submit your report</li>
              </ul>
              <p className="text-sm text-muted-foreground pt-4">
                Our moderation team reviews all reports within 24 hours.
              </p>
            </div>
          </div>

          {/* Consequences */}
          <div className="postal-card p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">Consequences of Violations</h2>
            <p className="text-muted-foreground">
              We take violations seriously. Depending on the severity and frequency, consequences may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Warning or temporary suspension</li>
              <li>Content removal</li>
              <li>Account suspension</li>
              <li>Permanent banning from Yuubin</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-border space-y-4">
            <p className="text-muted-foreground">
              These guidelines are designed to foster a positive community. We reserve the right to update them at any time. Thank you for helping make Yuubin a wonderful place for meaningful letter writing.
            </p>
            <Link href="/" className="text-primary hover:underline inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
