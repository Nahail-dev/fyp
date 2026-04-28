'use client';

import { useState } from 'react';
import { Send, X, Stamp as StampIcon, Save, Eye } from 'lucide-react';

interface Letter {
  recipient: string;
  subject: string;
  content: string;
  stamp: string;
}

const stamps = [
  { id: 'wildflower', name: 'Wildflower', emoji: '🌸' },
  { id: 'mountain', name: 'Mountain Peak', emoji: '🏔️' },
  { id: 'ocean', name: 'Ocean Wave', emoji: '🌊' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'sunset', name: 'Sunset', emoji: '🌅' },
  { id: 'stars', name: 'Starry Night', emoji: '⭐' },
  { id: 'heartbeat', name: 'Heartbeat', emoji: '💓' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋' },
  { id: 'feather', name: 'Feather', emoji: '🪶' },
  { id: 'candlelight', name: 'Candlelight', emoji: '🕯️' },
];

export default function ComposePage() {
  const [letterData, setLetterData] = useState<Letter>({
    recipient: '',
    subject: '',
    content: '',
    stamp: 'wildflower',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showStampPicker, setShowStampPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      setLetterData({ recipient: '', subject: '', content: '', stamp: 'wildflower' });
    }, 1500);
  };

  const currentStamp = stamps.find((s) => s.id === letterData.stamp);

  return (
    <div className="p-8 space-y-8">
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
            {/* Recipient */}
            <div className="postal-card p-6 space-y-3">
              <label className="block text-sm font-serif font-bold text-foreground">
                Recipient
              </label>
              <input
                type="text"
                placeholder="Who would you like to write to?"
                value={letterData.recipient}
                onChange={(e) =>
                  setLetterData({ ...letterData, recipient: e.target.value })
                }
                className="w-full px-4 py-3 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif"
                required
              />
            </div>

            {/* Subject */}
            <div className="postal-card p-6 space-y-3">
              <label className="block text-sm font-serif font-bold text-foreground">
                Subject
              </label>
              <input
                type="text"
                placeholder="What's your letter about?"
                value={letterData.subject}
                onChange={(e) =>
                  setLetterData({ ...letterData, subject: e.target.value })
                }
                className="w-full px-4 py-3 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif text-lg"
                required
              />
            </div>

            {/* Content */}
            <div className="postal-card p-6 space-y-3">
              <label className="block text-sm font-serif font-bold text-foreground">
                Letter Content
              </label>
              <textarea
                placeholder="Dear Friend,&#10;&#10;I wanted to share..."
                value={letterData.content}
                onChange={(e) =>
                  setLetterData({ ...letterData, content: e.target.value })
                }
                className="w-full px-4 py-3 border border-border rounded-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif min-h-96 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                {letterData.content.length} characters
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
                className="px-6 py-3 border border-border rounded-sm text-foreground hover:bg-muted font-serif font-bold transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Draft
              </button>

              <button
                type="submit"
                disabled={isSending || !letterData.recipient || !letterData.subject || !letterData.content}
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
                <div className="text-6xl animate-stamp-spin">
                  {currentStamp?.emoji}
                </div>
                <p className="font-serif font-bold text-foreground text-sm">
                  {currentStamp?.name}
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
                {stamps.map((stamp) => (
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
                    <div className="text-2xl">{stamp.emoji}</div>
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
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-sm transition-colors"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Stamp in Preview */}
            <div className="absolute top-6 right-6 w-20 h-24 border-2 border-primary/30 rounded-sm bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <div className="text-center text-xs font-serif font-bold text-primary">
                <div>STAMP</div>
                <div className="text-xl mt-1">{currentStamp?.emoji}</div>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-4 border-b border-border pb-6">
              <h2 className="text-3xl font-serif font-bold text-foreground">
                {letterData.subject || 'Untitled Letter'}
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>To: {letterData.recipient || 'Recipient'}</p>
                <p>Date: Today</p>
              </div>
            </div>

            {/* Content */}
            <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap">
              {letterData.content || 'Your letter content will appear here...'}
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
