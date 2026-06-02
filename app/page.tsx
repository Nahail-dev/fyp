'use client';

import Link from 'next/link';
import { Mail, Stamp, Heart, Send } from 'lucide-react';
import { ThemeLogo } from '@/components/theme-logo';

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <ThemeLogo />
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="px-6 py-2 rounded-sm border border-border text-foreground hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup" 
            className="px-6 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight">
              Exchange Thoughtful Letters
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect with the world through mindful, meaningful correspondence. Write letters that matter, receive words that touch your heart.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/auth/signup"
              className="px-8 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-serif font-bold text-lg shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Start Writing
            </Link>
            <Link 
              href="#features"
              className="px-8 py-3 rounded-sm border-2 border-primary text-primary hover:bg-primary/5 transition-all font-serif font-bold text-lg inline-flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="space-y-1">
              <p className="text-3xl font-serif font-bold text-primary">2.5K+</p>
              <p className="text-sm text-muted-foreground">Letters Sent</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-serif font-bold text-secondary">1.2K+</p>
              <p className="text-sm text-muted-foreground">Active Writers</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-serif font-bold text-accent">98%</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </div>
        </div>

        {/* Hero Visual - Envelope Stack */}
        <div className="relative h-96 md:h-full flex items-center justify-center">
          <div className="absolute w-96 h-64 postal-card animate-letter-arrival shadow-xl" style={{ transform: 'rotateY(-5deg) rotateX(2deg)' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4">
              <Stamp className="w-16 h-16 text-primary" />
              <h3 className="font-serif text-2xl font-bold text-center">Your First Letter Awaits</h3>
              <p className="text-center text-sm text-muted-foreground">Join thousands discovering the joy of letter writing</p>
            </div>
          </div>
          
          <div className="absolute w-96 h-64 postal-card shadow-lg" style={{ transform: 'rotateY(5deg) rotateX(-2deg) translateY(20px)', zIndex: -1 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card border-t border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Why Yuubin?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience letter writing like never before with our thoughtfully designed platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="postal-card p-8 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Beautiful Letters</h3>
              <p className="text-muted-foreground">Write and format letters with elegant styling. Your words deserve a beautiful canvas.</p>
            </div>

            {/* Feature 2 */}
            <div className="postal-card p-8 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
                <Heart className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Meaningful Exchange</h3>
              <p className="text-muted-foreground">Connect with thoughtful people. Share stories, dreams, and experiences through letters.</p>
            </div>

            {/* Feature 3 */}
            <div className="postal-card p-8 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Stamp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Collector&apos;s Stamps</h3>
              <p className="text-muted-foreground">Unlock unique postal stamps as you exchange letters. Build your personal collection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-serif font-bold text-foreground">Ready to Write?</h2>
          <p className="text-lg text-muted-foreground">
            Start your letter-writing journey today. It only takes a minute to create an account.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block px-10 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-serif font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ThemeLogo className="[&_img]:h-8 [&_img]:w-14" />
            </div>
            <p className="text-sm text-muted-foreground">Mindful letter exchange platform.</p>
          </div>
          
          <div>
            <h4 className="font-serif font-bold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground transition">Stamps</Link></li>
              <li><Link href="#" className="hover:text-foreground transition">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-bold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Yuubin. Crafted with care for thoughtful souls.</p>
        </div>
      </footer>
    </main>
  );
}
