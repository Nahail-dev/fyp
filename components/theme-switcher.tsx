'use client';

import { useTheme } from './theme-context';
import { Moon, Sun, Archive } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <button
        onClick={() => setTheme('modern')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          theme === 'modern'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modern theme"
      >
        <Sun className="w-4 h-4" />
        <span className="text-xs font-medium">Modern</span>
      </button>

      <button
        onClick={() => setTheme('night')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          theme === 'night'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Night theme"
      >
        <Moon className="w-4 h-4" />
        <span className="text-xs font-medium">Night</span>
      </button>

      <button
        onClick={() => setTheme('vintage')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          theme === 'vintage'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Vintage theme"
      >
        <Archive className="w-4 h-4" />
        <span className="text-xs font-medium">Vintage</span>
      </button>
    </div>
  );
}
