'use client';

import Image from 'next/image';
import { useTheme } from './theme-context';

const logoByTheme = {
  modern: '/logos/logo-moderen.png',
  night: '/logos/logo-dark.png',
  vintage: '/logos/logo-vintage.png',
} as const;

interface ThemeLogoProps {
  className?: string;
  iconOnly?: boolean;
  textClassName?: string;
}

export function ThemeLogo({ className = '', iconOnly = false, textClassName = 'hidden sm:inline-block' }: ThemeLogoProps) {
  const { theme } = useTheme();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={logoByTheme[theme]}
        alt="Yuubin"
        width={160}
        height={48}
        priority
        className={iconOnly ? 'h-9 w-9 object-contain' : 'h-10 w-[4.5rem] shrink-0 object-contain'}
      />
      {!iconOnly && (
        <span
          className={`font-serif text-2xl font-bold leading-none text-primary ${textClassName}`}
        >
          Yuubin
        </span>
      )}
    </span>
  );
}
