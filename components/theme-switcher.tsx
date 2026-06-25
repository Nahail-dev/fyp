'use client';

import { useTheme } from './theme-context';
import { Moon, Sun, Archive } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
      <button
        onClick={() => setTheme('modern')}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
          theme === 'modern'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modern theme"
      >
        <Sun className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium hidden xl:inline">Modern</span>
      </button>

      <button
        onClick={() => setTheme('night')}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
          theme === 'night'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Night theme"
      >
        <Moon className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium hidden xl:inline">Night</span>
      </button>

      <button
        onClick={() => setTheme('vintage')}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
          theme === 'vintage'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Vintage theme"
      >
        <Archive className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium hidden xl:inline">Vintage</span>
      </button>
    </div>
  );
}
