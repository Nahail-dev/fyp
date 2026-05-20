import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-context'
import { PostalBgDecoration } from '@/components/postal-bg-decoration'
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
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
