import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-context'
import { AccessibilityProvider } from '@/components/accessibility-context'
import { PostalBgDecoration } from '@/components/postal-bg-decoration'
import { CookieConsent } from '@/components/cookie-consent'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Yuubin - Mindful Letter Exchange',
  description: 'Exchange thoughtful letters with the world. A platform for meaningful, mindful correspondence with authentic postal vibes.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logos/favicon/favicon-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logos/favicon/favicon-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logos/favicon/favicon.ico',
        type: 'image/x-icon',
      },
    ],
    apple: '/logos/favicon/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background modern">
      <body className="font-sans antialiased bg-background text-foreground">
        <PostalBgDecoration />
        <ThemeProvider>
          <AccessibilityProvider>
            {children}
            <CookieConsent />
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast:
                    'yuubin-toast border border-border bg-card text-foreground shadow-xl font-sans',
                  title: 'yuubin-toast-title font-serif',
                  description: 'yuubin-toast-description text-muted-foreground',
                  icon: 'yuubin-toast-icon',
                  actionButton:
                    'bg-primary text-primary-foreground border border-primary',
                  cancelButton:
                    'bg-muted text-muted-foreground border border-border',
                  closeButton:
                    'bg-card text-foreground border border-border hover:bg-muted',
                  success: 'yuubin-toast-success',
                  error: 'yuubin-toast-error',
                  warning: 'yuubin-toast-warning',
                  info: 'yuubin-toast-info',
                },
              }}
            />
          </AccessibilityProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
