'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-card border-b border-border py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 2024</p>
        </div>
      </section>

      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto prose prose-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Yuubin, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">2. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">3. User Content</h2>
            <p className="text-muted-foreground">
              You retain all rights to any content you submit, post or display on or through Yuubin. By submitting content to Yuubin, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, and publish such content.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">4. Prohibited Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to use Yuubin to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Harass, abuse, or threaten another user</li>
              <li>Engage in any form of hate speech or discrimination</li>
              <li>Post illegal content or promote illegal activities</li>
              <li>Violate any intellectual property rights</li>
              <li>Spam or engage in deceptive practices</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">5. Limitations of Liability</h2>
            <p className="text-muted-foreground">
              Yuubin is provided on an "as-is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or merchantability, fitness for a particular purpose, and non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">6. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Yuubin and its officers, directors, employees, agents from any and all claims, damages, losses, costs, and expenses arising out of your use of Yuubin or violation of these terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">7. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to terminate your account and access to Yuubin at any time, for any reason, with or without notice. Upon termination, your right to use Yuubin will immediately cease.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will become effective immediately upon posting. Your continued use of Yuubin following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at legal@yuubin.app
            </p>
            <Link href="/" className="text-primary hover:underline inline-block mt-4">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
