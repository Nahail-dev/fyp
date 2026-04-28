'use client';

import Link from 'next/link';
import { FileText, Calendar, Edit2, Trash2 } from 'lucide-react';

const mockDrafts = [
  {
    id: 1,
    title: 'Untitled - Letter to Alex',
    lastEdited: '2024-04-22',
    preview: 'Dear Alex, I wanted to write to you about...',
  },
  {
    id: 2,
    title: 'Thoughts on moving to the city',
    lastEdited: '2024-04-20',
    preview: 'I&apos;ve been thinking a lot about what it means to start fresh...',
  },
  {
    id: 3,
    title: 'Recipe letter - Grandma&apos;s cookies',
    lastEdited: '2024-04-18',
    preview: 'Do you remember those amazing chocolate chip cookies...',
  },
  {
    id: 4,
    title: 'Response to Jamie',
    lastEdited: '2024-04-15',
    preview: 'Thank you for your letter! I loved reading about your...',
  },
];

export default function DraftsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Drafts</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {mockDrafts.length} drafts
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/app/compose"
          className="px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
        >
          New Letter
        </Link>
      </div>

      {/* Drafts List */}
      <div className="grid gap-4">
        {mockDrafts.map(draft => (
          <div key={draft.id} className="postal-card p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-serif font-bold text-foreground">{draft.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{draft.preview}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Last edited: {draft.lastEdited}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/app/compose?draft=${draft.id}`}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition flex items-center gap-2"
                  title="Continue editing"
                >
                  <Edit2 className="w-5 h-5 text-primary" />
                </Link>
                <button className="p-2 rounded-lg border border-border hover:bg-destructive/10 transition">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockDrafts.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-lg font-serif text-muted-foreground">No drafts yet</p>
          <p className="text-sm text-muted-foreground">Start writing a new letter to save as draft</p>
          <Link
            href="/app/compose"
            className="inline-block px-6 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium mt-4"
          >
            Start Writing
          </Link>
        </div>
      )}
    </div>
  );
}
