import { Mail } from 'lucide-react';

type AppScreenLoaderProps = {
  title: string;
  message: string;
};

export function AppScreenLoader({ title, message }: AppScreenLoaderProps) {
  return (
    <div className="flex min-h-[calc(100vh-192px)] items-center justify-center">
      <div className="postal-card flex w-full max-w-sm flex-col items-center gap-5 p-8 text-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-accent border-t-primary" />
          <div className="absolute inset-3 flex items-center justify-center rounded-full border border-primary/25 bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
