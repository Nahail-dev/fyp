import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ParsedLetterContent {
  text: string;
  font: string;
  color: string;
}

export function parseLetterContent(content: string): ParsedLetterContent {
  const match = (content || '').match(/^<!-- yuubin:(\{.*?\}) -->([\s\S]*)$/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      return {
        text: match[2],
        font: meta.font || 'font-serif',
        color: meta.color || 'text-foreground',
      };
    } catch (e) {
      // JSON parse fallback
    }
  }
  return {
    text: content || '',
    font: 'font-serif',
    color: 'text-foreground',
  };
}

export function stringifyLetterContent(text: string, font: string, color: string): string {
  if (font === 'font-serif' && color === 'text-foreground') {
    return text;
  }
  return `<!-- yuubin:${JSON.stringify({ font, color })} -->${text}`;
}
