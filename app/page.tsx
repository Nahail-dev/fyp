'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Compass,
  Feather,
  Heart,
  Languages,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Stamp,
} from 'lucide-react';
import { ThemeLogo } from '@/components/theme-logo';

const emotionalPromises = [
  {
    icon: Clock,
    title: 'Letters that take their time',
    text: 'Yuubin keeps every letter sealed until its delivery moment, so receiving words feels intentional instead of instant.',
  },
  {
    icon: MapPin,
    title: 'A journey between places',
    text: 'Delivery time is shaped by sender and receiver locations, giving each message a small sense of distance and arrival.',
  },
  {
    icon: Heart,
    title: 'Connection without noise',
    text: 'No endless feed, no pressure to reply in seconds. Just thoughtful writing, quiet discovery, and meaningful exchange.',
  },
];

const featureHighlights = [
  {
    icon: Feather,
    title: 'Write with feeling',
    text: 'Compose English or Urdu letters, save drafts, and return when the right words finally arrive.',
  },
  {
    icon: Compass,
    title: 'Discover public profiles',
    text: 'Explore people who choose to be visible, then write to them by username without exposing private emails.',
  },
  {
    icon: Stamp,
    title: 'Collect postal stamps',
    text: 'Choose a stamp before sending. The stamp travels with the letter and becomes part of the receiver collection.',
  },
  {
    icon: Languages,
    title: 'Accessible by design',
    text: 'Urdu RTL mode and larger text options help Yuubin feel easier for more people to read and use.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    text: 'Supabase authentication, profile visibility controls, and secure letter access keep personal writing protected.',
  },
  {
    icon: Sparkles,
    title: 'A calmer social ritual',
    text: 'Replies, reactions, follows, and notifications are built around correspondence rather than constant scrolling.',
  },
];

const journeySteps = [
  {
    title: 'Write a letter',
    description: 'Compose English or Urdu letters, save drafts, and return when the right words arrive.',
  },
  {
    title: 'Choose a stamp',
    description: 'Attach a stamp from your collection. It travels with the letter to the recipient.',
  },
  {
    title: 'Wait for delivery',
    description: 'Track the journey in real time. The distance between cities shapes the delay.',
  },
  {
    title: 'Open when it arrives',
    description: 'Receive an email notification when it lands. Open the seal and respond mindfully.',
  },
];

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-card/90 px-6 py-4 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ThemeLogo />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-sm border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-sm bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-border px-6 pb-20 pt-32 md:px-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_30%),radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_28%),linear-gradient(135deg,color-mix(in_srgb,var(--card)_82%,transparent),var(--background))]" />
          <div className="absolute left-[8%] top-28 h-40 w-64 rotate-[-10deg] rounded-sm border border-primary/20 opacity-35" />
          <div className="absolute bottom-28 right-[8%] h-28 w-44 rotate-[8deg] rounded-sm border border-secondary/25 opacity-40" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Mindful letters for a louder world
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-serif font-bold leading-tight text-foreground md:text-7xl">
                Not every message should arrive instantly.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                Yuubin turns digital communication into a slower, more personal ritual.
                Write a letter, send it with a stamp, and let it travel before it opens.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-8 py-4 font-serif text-lg font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:shadow-xl"
              >
                Write Your First Letter
                <Send className="h-5 w-5" />
              </Link>
              <Link
                href="#journey"
                className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-primary px-8 py-4 font-serif text-lg font-bold text-primary transition hover:bg-primary/10"
              >
                See The Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[460px]">
            <div className="absolute left-1/2 top-8 h-72 w-[18rem] sm:w-[22rem] -translate-x-1/2 rotate-[-7deg] rounded-sm border border-border bg-card shadow-2xl md:w-[26rem]">
              <div className="absolute inset-0 rounded-sm bg-[linear-gradient(90deg,transparent_94%,color-mix(in_srgb,var(--primary)_14%,transparent)_95%),linear-gradient(0deg,transparent_94%,color-mix(in_srgb,var(--primary)_10%,transparent)_95%)] bg-[length:14px_14px]" />
              <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Yuubin Air Mail</p>
                    <p className="mt-2 font-serif text-2xl font-bold text-foreground">A sealed letter</p>
                  </div>
                  <img
                    src="/stamps/stamp-rare.png"
                    alt="Yuubin stamp"
                    className="h-16 w-16 rounded-sm object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-4/5 rounded-full bg-primary/25" />
                  <div className="h-3 w-3/5 rounded-full bg-secondary/25" />
                  <div className="h-3 w-2/3 rounded-full bg-accent/25" />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Sahiwal</span>
                  <span className="h-px flex-1 bg-border mx-4" />
                  <span>Hamburg</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-14 left-4 w-64 rotate-[6deg] rounded-sm border border-border bg-card p-5 shadow-xl md:left-10 hidden sm:block">
              <div className="mb-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <p className="font-serif font-bold text-foreground">In transit</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">The seal opens when the journey reaches 100%.</p>
            </div>

            <div className="absolute bottom-0 right-0 w-52 rotate-[-4deg] rounded-sm border border-border bg-card p-5 shadow-xl hidden sm:block">
              <Heart className="mb-3 h-6 w-6 text-secondary" />
              <p className="font-serif text-lg font-bold text-foreground">Slow down. Mean it.</p>
              <p className="mt-2 text-sm text-muted-foreground">A small pause can make words feel heavier.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Why it feels different</p>
            <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
              Built for people who want to be understood, not just notified.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {emotionalPromises.map(({ icon: Icon, title, text }) => (
              <article key={title} className="postal-card p-7 transition hover:-translate-y-1 hover:shadow-xl">
                <Icon className="mb-5 h-8 w-8 text-primary" />
                <h3 className="font-serif text-2xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="border-y border-border bg-card px-6 py-14 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            {/* Left Side: Header & Interactive Steps */}
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">The Yuubin ritual</p>
                <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                  A letter should feel like it crossed a little distance to reach you.
                </h2>
                <p className="text-base leading-7 text-muted-foreground">
                  Instead of instant messages, Yuubin letters travel in real time. Hover or click each stage to visualize the slow-communication journey.
                </p>
              </div>

              {/* Vertical Steps */}
              <div className="space-y-2">
                {journeySteps.map((step, index) => {
                  const isActive = activeStep === index;
                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      onMouseEnter={() => setActiveStep(index)}
                      className={`w-full text-left p-3.5 rounded-sm border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? 'border-primary bg-background/50 shadow-md translate-x-1.5'
                          : 'border-border/60 hover:border-primary/40 bg-card hover:bg-background/20'
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif font-bold text-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Interactive Visualizer Box */}
            <div className="relative flex h-[310px] w-full items-center justify-center rounded-sm border-2 border-border/80 bg-background/40 p-4 shadow-inner overflow-hidden">
              <div className="absolute inset-0 rounded-sm bg-[linear-gradient(90deg,transparent_94%,color-mix(in_srgb,var(--primary)_6%,transparent)_95%),linear-gradient(0deg,transparent_94%,color-mix(in_srgb,var(--primary)_6%,transparent)_95%)] bg-[length:16px_16px] opacity-60" />
              
              {/* Visualizer content based on activeStep */}
              {activeStep === 0 && (
                <div className="animate-letter-flutter relative flex flex-col justify-between w-56 h-64 rounded-sm border border-border bg-card p-5 shadow-2xl animate-fade-in">
                  {/* Paper lines */}
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
                    <span className="font-serif text-[10px] text-primary font-bold tracking-widest uppercase">Yuubin Note</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                  </div>
                  
                  {/* Animating content lines */}
                  <div className="flex-1 space-y-3.5">
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-foreground/15 rounded-sm w-3/4 animate-[pulse_1.5s_infinite_0.1s]" />
                      <div className="h-2.5 bg-foreground/15 rounded-sm w-full animate-[pulse_1.5s_infinite_0.2s]" />
                      <div className="h-2.5 bg-foreground/15 rounded-sm w-5/6 animate-[pulse_1.5s_infinite_0.3s]" />
                    </div>
                    
                    {/* Urdu native font writing indicator */}
                    <div className="text-right pt-4 space-y-1.5" dir="rtl">
                      <div className="h-2.5 bg-primary/20 rounded-sm w-2/3 animate-[pulse_1.5s_infinite_0.4s]" />
                      <div className="h-2.5 bg-primary/20 rounded-sm w-4/5 animate-[pulse_1.5s_infinite_0.5s]" />
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground italic text-center mt-3">
                    &quot;Writing with patience...&quot;
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="relative flex flex-col items-center justify-center animate-fade-in">
                  {/* Envelope Base */}
                  <div className="relative w-60 h-36 rounded-sm border border-border bg-card shadow-2xl flex items-center justify-center">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_50%)]" />
                    
                    {/* Destination/Sender labels */}
                    <div className="absolute left-5 bottom-5 space-y-1">
                      <div className="h-1.5 w-12 bg-muted-foreground/20 rounded-full" />
                      <div className="h-1.5 w-20 bg-muted-foreground/15 rounded-full" />
                    </div>

                    {/* Stamp Placement Target */}
                    <div className="absolute top-3 right-3 w-[52px] h-[64px] border border-dashed border-primary/40 rounded-sm flex items-center justify-center bg-background/20">
                      <span className="text-[8px] uppercase tracking-wider text-primary/40 font-bold text-center">Place Stamp</span>
                    </div>

                    {/* Descending stamp animation */}
                    <div className="absolute top-3 right-3 animate-stamp-spin drop-shadow-lg">
                      <img
                        src="/stamps/stamp-rare.png"
                        alt="stamp selection"
                        className="h-[64px] w-[52px] rounded-sm object-contain"
                      />
                      {/* Postmark stamp overlay effect */}
                      <div className="absolute -left-2 -top-2 w-8 h-8 border border-muted-foreground/30 rounded-full flex items-center justify-center opacity-70 animate-postmark-stamp">
                        <div className="w-6 h-6 border border-dashed border-muted-foreground/20 rounded-full rotate-45" />
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-xs font-serif font-bold text-foreground bg-card px-3.5 py-1 rounded-full border border-border shadow-md">
                    Attaching &quot;Golden Route&quot;
                  </p>
                </div>
              )}

              {activeStep === 2 && (
                <div className="relative flex flex-col items-center justify-center w-full max-w-sm px-6 animate-fade-in">
                  {/* Journey Cities */}
                  <div className="flex w-full items-center justify-between text-xs text-foreground font-serif font-bold mb-4">
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mx-auto mb-1">
                        <span>🇵🇰</span>
                      </div>
                      <span>Sahiwal</span>
                    </div>
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/40 flex items-center justify-center mx-auto mb-1">
                        <span>🇩🇪</span>
                      </div>
                      <span>Hamburg</span>
                    </div>
                  </div>

                  {/* Travel Line */}
                  <div className="relative w-full h-6 bg-muted/20 border border-border rounded-full p-0.5 mb-3">
                    {/* Dotted path */}
                    <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-primary/30" />
                    
                    {/* Moving letter */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[60%] yuubin-transit-envelope">
                      <div className="relative h-4.5 w-7 bg-card border border-primary/50 shadow-md rounded-sm flex items-center justify-center">
                        {/* Tiny stamp */}
                        <div className="absolute top-0.5 right-0.5 w-1 h-1.5 bg-primary/40 rounded-[1px]" />
                        <div className="w-3 h-[1px] bg-muted-foreground/30" />
                      </div>
                    </div>
                  </div>

                  {/* Distance/Timer Display */}
                  <div className="text-center space-y-0.5">
                    <div className="font-serif font-bold text-sm text-foreground animate-pulse">
                      In Transit (60% Completed)
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Estimated delivery: ~4.2 hours remaining
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="relative flex flex-col items-center justify-center animate-fade-in">
                  {/* Sealed Wax envelope opening */}
                  <div className="group relative w-60 h-36 rounded-sm border border-border bg-card shadow-2xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-500 hover:border-primary/80 hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.02)_100%)]" />
                    
                    {/* Slide-out letter note */}
                    <div className="absolute inset-x-4 top-4 bottom-3 bg-background border border-border rounded-sm p-3 transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col justify-between">
                      <p className="font-serif text-[10px] leading-normal text-foreground">
                        &quot;Dear Friend, I am glad we waited for this letter. Some words are truly worth waiting for...&quot;
                      </p>
                      <p className="text-right text-[9px] text-primary font-bold">- Nahail</p>
                    </div>

                    {/* Wax Seal - breaks/disappears on hover */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-destructive rounded-full flex items-center justify-center shadow-lg border border-destructive-foreground/30 group-hover:scale-0 group-hover:opacity-0 transition-all duration-500 ease-out z-10">
                      <div className="w-8 h-8 border border-dashed border-destructive-foreground/40 rounded-full flex items-center justify-center">
                        <span className="font-serif text-white font-bold text-[10px]">Y</span>
                      </div>
                    </div>

                    {/* Folded envelope seam visual */}
                    <div className="absolute inset-0 pointer-events-none border-b-[72px] border-b-transparent border-t-[72px] border-t-transparent border-l-[120px] border-l-border/10 border-r-[120px] border-r-border/10 group-hover:opacity-0 transition-opacity duration-300" />
                  </div>

                  <p className="mt-4 text-xs font-serif font-bold text-foreground text-center animate-delivery-pulse">
                    Hover to open the letter envelope
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary">What you can do</p>
            <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">Everything around the letter.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureHighlights.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-sm border border-border bg-card p-6 transition hover:border-primary/60 hover:shadow-lg">
                <Icon className="mb-5 h-7 w-7 text-primary" />
                <h3 className="font-serif text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-5xl border-y border-border py-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Begin gently</p>
          <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
            Write something that deserves to be awaited.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Create your Yuubin account, choose your theme, and send your first letter with a stamp.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-10 py-4 font-serif text-lg font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:shadow-xl"
          >
            Start Writing Free
            <Send className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-6 py-12 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <ThemeLogo className="[&_img]:h-8 [&_img]:w-14" />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              A mindful digital letter exchange platform for slower, warmer communication.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-serif font-bold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="transition hover:text-foreground">Features</Link></li>
              <li><Link href="#journey" className="transition hover:text-foreground">Letter Journey</Link></li>
              <li><Link href="/auth/signup" className="transition hover:text-foreground">Get Started</Link></li>
              <li><Link href="/auth/login" className="transition hover:text-foreground">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif font-bold text-foreground">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="transition hover:text-foreground">About</Link></li>
              <li><Link href="/community" className="transition hover:text-foreground">Guidelines</Link></li>
              <li><Link href="/help" className="transition hover:text-foreground">Help & FAQ</Link></li>
              <li><Link href="/release-notes" className="transition hover:text-foreground">Release Notes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif font-bold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="transition hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/help" className="transition hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Yuubin. Crafted with care for thoughtful souls.</p>
        </div>
      </footer>
    </main>
  );
}
