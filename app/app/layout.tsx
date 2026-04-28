'use client';

import Link from 'next/link';
import { Mail, Inbox, PenTool, User, Settings, LogOut, Stamp, Send, FileText, Compass } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/app" className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              <span className="font-serif font-bold text-foreground">Yuubin</span>
            </Link>
          )}
          {!sidebarOpen && <Mail className="w-6 h-6 text-primary" />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/app"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors group"
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>

          <Link
            href="/app/inbox"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Inbox className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Inbox</span>}
          </Link>

          <Link
            href="/app/compose"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <PenTool className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Compose</span>}
          </Link>

          <Link
            href="/app/stamps"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Stamp className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Stamps</span>}
          </Link>

          <Link
            href="/app/explore"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Compass className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Explore</span>}
          </Link>

          <Link
            href="/app/sent"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Send className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sent</span>}
          </Link>

          <Link
            href="/app/drafts"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Drafts</span>}
          </Link>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border p-4 space-y-2">
          <Link
            href="/app/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Profile</span>}
          </Link>

          <Link
            href="/app/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </Link>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-muted/50 text-foreground transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mx-4 mb-4 px-4 py-2 rounded-sm border border-border hover:bg-muted text-sm text-muted-foreground transition-colors"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-foreground">Yuubin</h1>
            <div className="flex items-center gap-6">
              <ThemeSwitcher />
              <div className="text-sm text-muted-foreground">
                Welcome back!
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
