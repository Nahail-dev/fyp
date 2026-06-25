'use client';

import { ALargeSmall, Languages } from 'lucide-react';
import { useAccessibility } from '@/components/accessibility-context';

const scaleLabel = {
  normal: 'A',
  large: 'A+',
  extra: 'A++',
};

export function AccessibilityControls() {
  const { cycleTextScale, language, textScale, t, toggleLanguage } = useAccessibility();

  return (
    <div className="flex w-full shrink-0 items-center gap-2" aria-label={t('accessibility')}>
      <button
        type="button"
        onClick={cycleTextScale}
        className="flex-1 flex h-11 items-center justify-center gap-2 rounded-sm border border-border bg-card px-2.5 sm:px-3 text-sm font-semibold text-foreground transition hover:bg-muted/50 cursor-pointer"
        title={`${t('textSize')}: ${scaleLabel[textScale]}`}
        aria-label={`${t('textSize')}: ${scaleLabel[textScale]}`}
      >
        <ALargeSmall className="h-4 w-4 text-primary shrink-0" />
        <span className="hidden md:inline">{scaleLabel[textScale]}</span>
      </button>

      <button
        type="button"
        onClick={toggleLanguage}
        className="flex-1 flex h-11 items-center justify-center gap-2 rounded-sm border border-border bg-card px-2.5 sm:px-3 text-sm font-semibold text-foreground transition hover:bg-muted/50 cursor-pointer"
        title={t('language')}
        aria-label={t('language')}
      >
        <Languages className="h-4 w-4 text-primary shrink-0" />
        <span className="hidden md:inline">{language === 'ur' ? 'EN' : 'اردو'}</span>
      </button>
    </div>
  );
}
