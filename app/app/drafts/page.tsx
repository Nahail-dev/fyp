'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Edit2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { AppScreenLoader } from '@/components/app-screen-loader';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

type DraftLetter = {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDrafts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const response = await authenticatedFetch(`/api/letters?userId=${user.id}&type=drafts`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load drafts');
      }

      setDrafts(data.letters || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const deleteDraft = async (draftId: string) => {
    if (!userId) return;
    setDeletingId(draftId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/letters/${draftId}`, {
        method: 'DELETE',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to delete draft');
      }

      setDrafts((current) => current.filter((draft) => draft.id !== draftId));
      toast.success('Draft deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete draft');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <AppScreenLoader title="Drafts" message="Loading your drafts..." />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Drafts</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {drafts.length} drafts
        </div>
      </div>

      <div className="grid gap-4">
        {drafts.map((draft) => {
          const preview = draft.content?.trim() || 'No content yet';
          const lastEdited = new Date(draft.updated_at || draft.created_at).toLocaleString();

          return (
            <div key={draft.id} className="postal-card p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-serif font-bold text-foreground">
                    {draft.title || 'Untitled Draft'}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{preview}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Calendar className="w-3 h-3" />
                    <span>Last edited: {lastEdited}</span>
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
                  <button
                    type="button"
                    onClick={() => deleteDraft(draft.id)}
                    disabled={deletingId === draft.id}
                    className="p-2 rounded-lg border border-border hover:bg-destructive/10 transition disabled:opacity-50"
                    title="Delete draft"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {drafts.length === 0 && (
        <div className="postal-card p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-lg font-serif text-muted-foreground">No drafts yet</p>
          <p className="text-sm text-muted-foreground">Start writing a new letter to save as draft</p>
        </div>
      )}
    </div>
  );
}
