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
    <div className="flex shrink-0 items-center gap-2" aria-label={t('accessibility')}>
      <button
        type="button"
        onClick={cycleTextScale}
        className="flex h-11 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-muted/50"
        title={`${t('textSize')}: ${scaleLabel[textScale]}`}
        aria-label={`${t('textSize')}: ${scaleLabel[textScale]}`}
      >
        <ALargeSmall className="h-4 w-4 text-primary" />
        <span>{scaleLabel[textScale]}</span>
      </button>

      <button
        type="button"
        onClick={toggleLanguage}
        className="flex h-11 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-muted/50"
        title={t('language')}
        aria-label={t('language')}
      >
        <Languages className="h-4 w-4 text-primary" />
        <span>{language === 'ur' ? 'EN' : 'اردو'}</span>
      </button>
    </div>
  );
}
