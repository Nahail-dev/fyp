import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-context'
import { AccessibilityProvider } from '@/components/accessibility-context'
import { PostalBgDecoration } from '@/components/postal-bg-decoration'
import { CookieConsent } from '@/components/cookie-consent'
import { TanStackQueryProvider } from '@/components/tanstack-query-provider'
import './globals.css'
import { Toaster } from 'sonner'
import { Pinyon_Script, Dancing_Script, Delius, Reenie_Beanie, Noto_Nastaliq_Urdu } from 'next/font/google'

const pinyon = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pinyon',
  display: 'swap',
})

const dancing = Dancing_Script({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
})

const delius = Delius({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-delius',
  display: 'swap',
})

const reenie = Reenie_Beanie({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-reenie',
  display: 'swap',
})

const notoUrdu = Noto_Nastaliq_Urdu({
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-noto-urdu',
  display: 'swap',
})

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
    <html lang="en" className={`bg-background modern ${pinyon.variable} ${dancing.variable} ${delius.variable} ${reenie.variable} ${notoUrdu.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <PostalBgDecoration />
        <ThemeProvider>
          <AccessibilityProvider>
            <TanStackQueryProvider>
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
            </TanStackQueryProvider>
          </AccessibilityProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
