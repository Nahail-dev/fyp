'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-card border-b border-border py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2024</p>
        </div>
      </section>

      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto prose prose-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account. This includes your name, email address, and optional profile information. We do not read or store the content of your letters.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide and maintain our services</li>
              <li>Send you service-related announcements</li>
              <li>Respond to your customer service inquiries</li>
              <li>Analyze usage patterns to improve our services</li>
              <li>Prevent fraudulent activity and ensure security</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">4. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties. We may share information when required by law or to protect our rights and safety.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to track activity on our site and maintain certain information. You can instruct your browser to refuse cookies or alert you when cookies are being sent.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information at any time by logging into your account or contacting us. You can also request a copy of your data.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">7. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Yuubin is not intended for children under 13. We do not knowingly collect information from children under 13. If we become aware that we have collected information from a child under 13, we will delete such information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at privacy@yuubin.app
            </p>
          </div>

          <div className="pt-8 border-t border-border">
            <Link href="/" className="text-primary hover:underline inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
