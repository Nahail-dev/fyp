'use client';

import { useEffect, useState } from 'react';
import { Send, X, Stamp as StampIcon, Save, Eye, User, Languages } from 'lucide-react';
import Image from 'next/image';
import { transliterateRomanUrdu } from '@/lib/urduTransliteration';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { DEFAULT_STAMP_ID, STAMPS, getStampById } from '@/lib/stamps';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

interface Letter {
  recipient: string;
  subject: string;
  content: string;
  stamp: string;
  language: 'en' | 'ur';
}

interface RecipientUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

export default function ComposePage() {
  const supabase = createClient();
  const [letterData, setLetterData] = useState<Letter>({
    recipient: '',
    subject: '',
    content: '',
    stamp: DEFAULT_STAMP_ID,
    language: 'en',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showStampPicker, setShowStampPicker] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientUser | null>(null);
  const [recipientResults, setRecipientResults] = useState<RecipientUser[]>([]);
  const [isSearchingRecipients, setIsSearchingRecipients] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [urduInputMode, setUrduInputMode] = useState<'roman' | 'native'>('roman');

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadDraft = async () => {
      const draftParam = new URLSearchParams(window.location.search).get('draft');
      if (!draftParam) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(`/api/letters/${draftParam}`, {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
          credentials: 'include',
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Draft not found');
        }

        const draft = data.letter;

        if (!user || draft.sender_id !== user.id || draft.status !== 'draft') {
          throw new Error('Draft not available');
        }

        setDraftId(draft.id);
        setLetterData({
          recipient: draft.recipient?.username || '',
          subject: draft.title || '',
          content: draft.content || '',
          stamp: draft.stamp_id || DEFAULT_STAMP_ID,
          language: draft.language === 'ur' ? 'ur' : 'en',
        });
        if (draft.recipient) {
          setSelectedRecipient({
            id: draft.recipient.id,
            username: draft.recipient.username,
            full_name: draft.recipient.full_name || draft.recipient.username,
            avatar_url: draft.recipient.avatar_url,
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load draft');
      }
    };

    loadDraft();
  }, []);

  useEffect(() => {
    const recipientParam = new URLSearchParams(window.location.search).get('recipient');
    if (!recipientParam || selectedRecipient || !currentUserId || draftId) return;

    const loadRecipient = async () => {
      try {
        const params = new URLSearchParams({
          search: recipientParam,
          userId: currentUserId,
        });
        const response = await authenticatedFetch(`/api/users?${params.toString()}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) return;

        const recipient = (data.users || []).find(
          (user: RecipientUser) =>
            user.username.toLowerCase() === recipientParam.toLowerCase(),
        );

        if (recipient) {
          setSelectedRecipient({
            id: recipient.id,
            username: recipient.username,
            full_name: recipient.full_name,
            avatar_url: recipient.avatar_url,
          });
          setLetterData((current) => ({
            ...current,
            recipient: recipient.username,
          }));
        }
      } catch (error) {
        console.log('[compose] Explore recipient preload failed:', error);
      }
    };

    loadRecipient();
  }, [currentUserId, draftId, selectedRecipient]);

  useEffect(() => {
    if (selectedRecipient || letterData.recipient.trim().length < 2) {
      setRecipientResults([]);
      setIsSearchingRecipients(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsSearchingRecipients(true);

      try {
        const params = new URLSearchParams({
          search: letterData.recipient.trim(),
        });
        if (currentUserId) {
          params.set('userId', currentUserId);
        }

        const response = await authenticatedFetch(
          `/api/users?${params.toString()}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setRecipientResults([]);
          return;
        }

        setRecipientResults(
          (data.users || []).map((user: RecipientUser) => ({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
          })).filter((user: RecipientUser) => user.id !== currentUserId),
        );
      } catch (error) {
        console.log('[compose] Recipient search failed:', error);
        setRecipientResults([]);
      } finally {
        setIsSearchingRecipients(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [currentUserId, letterData.recipient, selectedRecipient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient) return;
    setIsSending(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error('Please sign in before sending a letter');
        return;
      }

      if (selectedRecipient.id === user.id) {
        toast.error('You cannot send a letter to yourself');
        clearRecipient();
        return;
      }

      const response = await authenticatedFetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: selectedRecipient.id,
          title: letterData.subject,
          content: letterData.content,
          status: 'sent',
          language: letterData.language,
          stampId: letterData.stamp,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to send letter',
        );
      }

      const estimatedDelivery = data.letter?.estimated_delivery_at
        ? new Date(data.letter.estimated_delivery_at).toLocaleString()
        : null;

      toast.success(
        estimatedDelivery
          ? `Letter sent. Estimated delivery: ${estimatedDelivery}`
          : 'Letter sent successfully',
      );
      if (draftId) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await fetch(`/api/letters/${draftId}`, {
          method: 'DELETE',
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
          credentials: 'include',
        });
        setDraftId(null);
        window.history.replaceState(null, '', '/app/compose');
      }
      setIsSending(false);
      setLetterData({ recipient: '', subject: '', content: '', stamp: DEFAULT_STAMP_ID, language: 'en' });
      setSelectedRecipient(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send letter');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error('Please sign in before saving a draft');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = {
        senderId: user.id,
        recipientId: selectedRecipient?.id ?? null,
        title: letterData.subject || 'Untitled Draft',
        content: letterData.content || '',
        status: 'draft',
        language: letterData.language,
        stampId: letterData.stamp,
      };

      const response = await authenticatedFetch(
        draftId ? `/api/letters/${draftId}` : '/api/letters',
        {
          method: draftId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          credentials: 'include',
          body: JSON.stringify(
            draftId
              ? {
                  title: payload.title,
                  content: payload.content,
                  status: 'draft',
                  language: payload.language,
                  stampId: payload.stampId,
                  recipientId: payload.recipientId,
                }
              : payload,
          ),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to save draft',
        );
      }

      const savedDraftId = data.letter?.id;
      if (savedDraftId && !draftId) {
        setDraftId(savedDraftId);
        window.history.replaceState(null, '', `/app/compose?draft=${savedDraftId}`);
      }
      toast.success('Draft saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const currentStamp = getStampById(letterData.stamp);
  const isUrdu = letterData.language === 'ur';
  const writingDirection = isUrdu ? 'rtl' : 'ltr';
  const writingAlign = isUrdu ? 'text-right' : 'text-left';
  const writingFont = isUrdu
    ? "[font-family:'Noto_Nastaliq_Urdu','Noto_Naskh_Arabic','Arial',sans-serif]"
    : 'font-serif';

  const updateTextField = (field: 'subject' | 'content', value: string) => {
    setLetterData({
      ...letterData,
      [field]: isUrdu && urduInputMode === 'roman' ? transliterateRomanUrdu(value) : value,
    });
  };

  const insertUrduSnippet = (snippet: string) => {
    setLetterData((current) => ({
      ...current,
      content: `${current.content}${current.content ? ' ' : ''}${snippet}`,
    }));
  };

  const selectRecipient = (recipient: RecipientUser) => {
    setSelectedRecipient(recipient);
    setLetterData({ ...letterData, recipient: recipient.username });
    setRecipientResults([]);
  };

  const clearRecipient = () => {
    setSelectedRecipient(null);
    setRecipientResults([]);
    setLetterData({ ...letterData, recipient: '' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Write a Letter</h2>
        <p className="text-muted-foreground">Express your thoughts and connect with the world</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language */}
            <div className="postal-card p-6 space-y-3">
              <label className="block text-sm font-serif font-bold text-foreground">
                Letter Language
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'en', label: 'English' },
                  { value: 'ur', label: 'Urdu' },
                ].map((language) => (
                  <button
                    key={language.value}
                    type="button"
                    onClick={() =>
                      setLetterData({
                        ...letterData,
                        language: language.value as Letter['language'],
                      })
                    }
                    className={`rounded-sm border px-4 py-3 font-serif font-bold transition ${
                      letterData.language === language.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div className="postal-card p-6 space-y-3 !overflow-visible">
              <label className="block text-sm font-serif font-bold text-foreground">
                Recipient Username
              </label>
              <div>
                {selectedRecipient ? (
                  <div className="flex items-center justify-between gap-3 rounded-sm border border-primary/40 bg-primary/10 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {selectedRecipient.avatar_url ? (
                        <img
                          src={selectedRecipient.avatar_url}
                          alt={selectedRecipient.full_name}
                          className="h-9 w-9 shrink-0 rounded-full border border-primary/30 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-serif font-bold text-foreground">
                          @{selectedRecipient.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {selectedRecipient.full_name}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearRecipient}
                      className="rounded-sm p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label="Remove recipient"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Search username, e.g. @nahail"
                      value={letterData.recipient}
                      onChange={(e) =>
                        setLetterData({ ...letterData, recipient: e.target.value.replace(/^@/, '') })
                      }
                      className="w-full px-4 py-3 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif"
                      required
                    />
                    {(recipientResults.length > 0 || isSearchingRecipients) && (
                      <div className="mt-2 max-h-72 overflow-y-auto rounded-sm border border-border bg-card shadow-2xl">
                        {isSearchingRecipients ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            Searching users...
                          </div>
                        ) : (
                          recipientResults.map((recipient) => (
                            <button
                              key={recipient.id}
                              type="button"
                              onClick={() => selectRecipient(recipient)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                            >
                              {recipient.avatar_url ? (
                                <img
                                  src={recipient.avatar_url}
                                  alt={recipient.full_name}
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-serif font-bold text-foreground">
                                  @{recipient.username}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {recipient.full_name}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    {letterData.recipient.trim().length >= 2 &&
                      !isSearchingRecipients &&
                      recipientResults.length === 0 && (
                        <p className="pt-2 text-xs text-muted-foreground">
                          No user selected yet. Choose a user from search results.
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>

            {/* Subject */}
            {isUrdu && (
              <div className="postal-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <h3 className="font-serif font-bold text-foreground">Urdu Editor</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: 'roman',
                      label: 'Roman Urdu Converter',
                      desc: 'Type “aap kaise hain” and Yuubin converts it.',
                    },
                    {
                      value: 'native',
                      label: 'Native Urdu Keyboard',
                      desc: 'Use your Urdu keyboard directly without conversion.',
                    },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setUrduInputMode(mode.value as typeof urduInputMode)}
                      className={`rounded-sm border p-4 text-left transition ${
                        urduInputMode === mode.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="block font-medium">{mode.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {mode.desc}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2" dir="rtl">
                  {['محترم دوست،', 'امید ہے آپ خیریت سے ہوں گے۔', 'آپ کا شکریہ۔', 'والسلام،'].map(
                    (snippet) => (
                      <button
                        key={snippet}
                        type="button"
                        onClick={() => insertUrduSnippet(snippet)}
                        className={`rounded-sm border border-border px-3 py-2 text-sm hover:bg-muted ${writingFont}`}
                      >
                        {snippet}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="postal-card p-6 space-y-3">
              <label className="block text-sm font-serif font-bold text-foreground">
                {isUrdu ? 'موضوع' : 'Subject'}
              </label>
              <input
                type="text"
                dir={writingDirection}
                placeholder={isUrdu ? 'آپ کے خط کا موضوع کیا ہے؟' : "What's your letter about?"}
                value={letterData.subject}
                onChange={(e) =>
                  updateTextField('subject', e.target.value)
                }
                className={`w-full px-4 py-3 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg ${writingAlign} ${writingFont}`}
                required
              />
            </div>

            {/* Content */}
            <div className="postal-card p-6 space-y-3">
              <label className="block text-sm font-serif font-bold text-foreground">
                {isUrdu ? 'خط کا متن' : 'Letter Content'}
              </label>
              <textarea
                dir={writingDirection}
                placeholder={
                  isUrdu
                    ? 'پیارے دوست،\n\nمیں آپ سے یہ بات شیئر کرنا چاہتا/چاہتی ہوں...'
                    : 'Dear Friend,\n\nI wanted to share...'
                }
                value={letterData.content}
                onChange={(e) =>
                  updateTextField('content', e.target.value)
                }
                className={`w-full px-4 py-3 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-96 resize-none leading-loose ${writingAlign} ${writingFont}`}
                required
              />
              <p className="text-xs text-muted-foreground">
                {letterData.content.length} characters
                {isUrdu &&
                  ` · ${
                    urduInputMode === 'roman'
                      ? 'Roman Urdu conversion is enabled'
                      : 'Native Urdu typing is enabled'
                  }`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 border border-border rounded-sm text-foreground hover:bg-muted font-serif font-bold transition-colors flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || (!letterData.subject && !letterData.content)}
                className="px-6 py-3 border border-border rounded-sm text-foreground hover:bg-muted font-serif font-bold transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSavingDraft ? 'Saving...' : draftId ? 'Update Draft' : 'Draft'}
              </button>

              <button
                type="submit"
                disabled={isSending || !selectedRecipient || !letterData.subject || !letterData.content}
                className="ml-auto px-8 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 font-serif font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send Letter
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Stamp Selector & Preview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stamp Selector */}
          <div className="postal-card p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-foreground">Choose a Stamp</h3>
            
            {/* Current Stamp Display */}
            <div className="flex justify-center p-6 border-2 border-primary/20 rounded-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center space-y-2">
                <div className="relative mx-auto h-24 w-24 animate-stamp-spin">
                  <Image
                    src={currentStamp.image}
                    alt={`${currentStamp.name} stamp`}
                    fill
                    sizes="96px"
                    className="object-contain drop-shadow-md"
                  />
                </div>
                <p className="font-serif font-bold text-foreground text-sm">
                  {currentStamp.name}
                </p>
              </div>
            </div>

            {/* Stamp Picker Toggle */}
            <button
              onClick={() => setShowStampPicker(!showStampPicker)}
              className="w-full px-4 py-2 rounded-sm border border-border hover:bg-muted transition-colors font-serif font-bold text-sm text-foreground flex items-center justify-center gap-2"
            >
              <StampIcon className="w-4 h-4" />
              {showStampPicker ? 'Hide Stamps' : 'View All Stamps'}
            </button>

            {/* Stamp Grid */}
            {showStampPicker && (
              <div className="grid grid-cols-3 gap-3">
                {STAMPS.map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => {
                      setLetterData({ ...letterData, stamp: stamp.id });
                      setShowStampPicker(false);
                    }}
                    className={`p-3 rounded-sm border-2 transition-all hover:shadow-md ${
                      letterData.stamp === stamp.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    title={stamp.name}
                  >
                    <div className="relative h-12 w-12">
                      <Image
                        src={stamp.image}
                        alt={`${stamp.name} stamp`}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="postal-card p-6 space-y-4 border-l-4 border-l-primary">
            <h3 className="font-serif font-bold text-foreground">Tips for Writing</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Be genuine and thoughtful</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Share your true feelings</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Proofread before sending</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Add a personal touch</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto postal-card p-12 relative space-y-6">
            <button
              onClick={() => setShowPreview(false)}
              className={`absolute top-4 p-2 hover:bg-muted rounded-sm transition-colors ${isUrdu ? 'right-4' : 'left-4'}`}
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Stamp in Preview */}
            <div className={`absolute top-6 w-20 h-24 border-2 border-primary/30 rounded-sm bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ${isUrdu ? 'left-6' : 'right-6'}`}>
              <div className="text-center text-xs font-serif font-bold text-primary">
                <div>STAMP</div>
                <div className="relative mx-auto mt-1 h-12 w-12">
                  <Image
                    src={currentStamp.image}
                    alt={`${currentStamp.name} stamp`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className={`space-y-4 border-b border-border pb-6 ${isUrdu ? 'pl-24 pt-16' : 'pr-24 pt-16'}`}>
              <h2
                dir={writingDirection}
                className={`w-full break-words text-3xl font-bold text-foreground ${writingAlign} ${writingFont}`}
              >
                {letterData.subject || (isUrdu ? 'بلا عنوان خط' : 'Untitled Letter')}
              </h2>
              <div
                dir={writingDirection}
                className={`space-y-1 text-sm text-muted-foreground ${writingAlign}`}
              >
                <p>{isUrdu ? 'بنام:' : 'To:'} {selectedRecipient ? `@${selectedRecipient.username}` : (isUrdu ? 'وصول کنندہ' : 'Recipient')}</p>
                <p>{isUrdu ? 'تاریخ:' : 'Date:'} {isUrdu ? 'آج' : 'Today'}</p>
              </div>
            </div>

            {/* Content */}
            <div
              dir={writingDirection}
              className={`text-lg leading-loose text-foreground whitespace-pre-wrap ${writingAlign} ${writingFont}`}
            >
              {letterData.content || (isUrdu ? 'آپ کے خط کا متن یہاں ظاہر ہوگا...' : 'Your letter content will appear here...')}
            </div>

            {/* Close Preview */}
            <button
              onClick={() => setShowPreview(false)}
              className="w-full mt-8 px-6 py-3 border border-border rounded-sm text-foreground hover:bg-muted font-serif font-bold transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
