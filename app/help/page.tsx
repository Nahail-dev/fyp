'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Mail, Clock, Stamp, Heart, Send } from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Get Started" on our landing page and fill in your email and password. You&apos;ll receive a confirmation email to verify your account. Once verified, you can start writing letters!',
      },
      {
        q: 'Is Yuubin free to use?',
        a: 'Yes! Yuubin is completely free to use. Write and receive as many letters as you want without any cost.',
      },
      {
        q: 'How do I write my first letter?',
        a: 'After logging in, click "Compose" or go to the compose page. Write your letter, select a stamp design, and add the recipient. You can schedule it or send it immediately.',
      },
    ],
  },
  {
    category: 'Letters & Delivery',
    questions: [
      {
        q: 'How long does it take to deliver a letter?',
        a: 'Letters are delivered with intentional delays ranging from 3 to 7 days, simulating a real postal experience. You can see the estimated delivery date when composing.',
      },
      {
        q: 'Can I schedule a letter to be sent later?',
        a: 'Absolutely! When composing, you can choose "Schedule for later" and pick your preferred send date. The delivery will happen according to that schedule.',
      },
      {
        q: 'What happens if I want to unsend a letter?',
        a: 'You can unsend a letter only before it&apos;s been delivered. Once in transit, it can&apos;t be unsent (just like real mail!). Check your "Sent" folder to manage your letters.',
      },
      {
        q: 'Can I send letters to anyone?',
        a: 'Yes, anyone with a Yuubin account can receive letters. You just need their username or email address. Users can adjust their privacy settings if they don&apos;t want to receive messages.',
      },
    ],
  },
  {
    category: 'Stamps & Customization',
    questions: [
      {
        q: 'What are stamps?',
        a: 'Stamps are decorative designs you can add to your letters. They&apos;re both aesthetic and collectible. Each letter you write earns you stamps, and you unlock special ones through achievements.',
      },
      {
        q: 'How do I unlock new stamps?',
        a: 'You unlock stamps by: writing letters, reaching milestones (like your 10th letter), responding to letters, and participating in special events. Check your Stamps collection to see progress.',
      },
      {
        q: 'Can I customize my letter appearance?',
        a: 'Yes! You can format text (bold, italic, underline), choose your stamp design, add a background, and customize the envelope appearance. More customization options unlock as you progress.',
      },
    ],
  },
  {
    category: 'Privacy & Safety',
    questions: [
      {
        q: 'Are my letters private?',
        a: 'Yes! Your letters are between you and the recipient. Only they can read your letter content. We never share letter data with third parties.',
      },
      {
        q: 'What data do you collect?',
        a: 'We collect your profile information (name, email, bio) and letter metadata (sender, recipient, date). We do NOT read the content of your letters.',
      },
      {
        q: 'How do I report inappropriate content?',
        a: 'If you receive an inappropriate letter, you can report it using the report button on the letter. Our team reviews reports and takes action to keep the community safe.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, you can delete your account anytime in your Settings. All your letters and data will be permanently removed.',
      },
    ],
  },
];

export default function HelpPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Help & FAQ</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about Yuubin and how to make the most of your letter-writing experience.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                {section.category === 'Getting Started' && <Send className="w-6 h-6 text-primary" />}
                {section.category === 'Letters & Delivery' && <Clock className="w-6 h-6 text-secondary" />}
                {section.category === 'Stamps & Customization' && <Stamp className="w-6 h-6 text-accent" />}
                {section.category === 'Privacy & Safety' && <Heart className="w-6 h-6 text-destructive" />}
                {section.category}
              </h2>

              <div className="space-y-2">
                {section.questions.map((item, questionIndex) => {
                  const globalIndex = sectionIndex * 100 + questionIndex;
                  const isExpanded = expandedIndex === globalIndex;

                  return (
                    <div key={questionIndex} className="postal-card overflow-hidden">
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                        className="w-full px-6 py-4 hover:bg-muted/30 transition flex items-center justify-between gap-4 text-left"
                      >
                        <p className="font-medium text-foreground">{item.q}</p>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-6 py-4 border-t border-border bg-muted/10">
                          <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contact Support */}
          <div className="postal-card p-8 text-center space-y-4 bg-primary/5 border border-primary/20">
            <Mail className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-2xl font-serif font-bold text-foreground">Still have questions?</h3>
            <p className="text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Send us a letter at support@yuubin.app
            </p>
            <button className="px-6 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium inline-block">
              Contact Support
            </button>
          </div>

          {/* Links */}
          <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-border">
            <Link
              href="/terms"
              className="postal-card p-6 hover:shadow-lg transition text-center space-y-2"
            >
              <p className="font-serif font-bold text-foreground">Terms of Service</p>
              <p className="text-sm text-muted-foreground">Read our terms and conditions</p>
            </Link>
            <Link
              href="/privacy"
              className="postal-card p-6 hover:shadow-lg transition text-center space-y-2"
            >
              <p className="font-serif font-bold text-foreground">Privacy Policy</p>
              <p className="text-sm text-muted-foreground">Learn how we protect your data</p>
            </Link>
            <Link
              href="/community"
              className="postal-card p-6 hover:shadow-lg transition text-center space-y-2"
            >
              <p className="font-serif font-bold text-foreground">Community Guidelines</p>
              <p className="text-sm text-muted-foreground">Our community standards</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
