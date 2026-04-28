'use client';

export function PostalBgDecoration() {
  return (
    <>
      {/* Top Left Corner - Postmark */}
      <div className="fixed top-8 left-8 w-16 h-16 border-2 border-primary/20 rounded-full flex items-center justify-center opacity-30 pointer-events-none hidden md:flex">
        <div className="text-xs font-bold text-primary/40 text-center">
          <div>YUUBIN</div>
          <div className="text-[8px]">JAPAN</div>
        </div>
      </div>

      {/* Top Right Corner - Stamp */}
      <div className="fixed top-12 right-12 w-12 h-14 opacity-20 pointer-events-none hidden md:block transform -rotate-12">
        <svg viewBox="0 0 100 140" className="w-full h-full">
          <rect x="5" y="5" width="90" height="130" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" />
          <path d="M 50 20 Q 45 30 50 40 T 50 60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Bottom Left Corner - Letter Stack */}
      <div className="fixed bottom-12 left-8 opacity-15 pointer-events-none hidden md:block">
        <div className="space-y-1">
          <div className="w-20 h-14 border-2 border-primary/40 bg-card/20" style={{ transform: 'rotate(-8deg)' }} />
          <div className="w-20 h-14 border-2 border-primary/40 bg-card/20 -mt-3" style={{ transform: 'rotate(4deg)' }} />
          <div className="w-20 h-14 border-2 border-primary/40 bg-card/20 -mt-3" style={{ transform: 'rotate(-4deg)' }} />
        </div>
      </div>

      {/* Bottom Right Corner - Mail Icon */}
      <div className="fixed bottom-16 right-12 opacity-15 pointer-events-none hidden md:block">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4h20v12H2z" />
          <path d="M2 4l10 7 10-7" />
        </svg>
      </div>

      {/* Floating postal marks - animated subtle elements */}
      <div className="fixed top-1/4 right-1/4 w-8 h-8 border border-primary/10 rounded-full opacity-40 pointer-events-none hidden lg:block animate-delivery-pulse" />
      <div className="fixed top-3/4 left-1/3 w-6 h-6 border border-accent/10 rounded-full opacity-30 pointer-events-none hidden lg:block animate-delivery-pulse" style={{ animationDelay: '0.5s' }} />
    </>
  );
}
