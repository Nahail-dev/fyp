import type { Metadata } from 'next'
import { Geist, Geist_Mono, Merriweather } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-context'
import { PostalBgDecoration } from '@/components/postal-bg-decoration'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _merriweather = Merriweather({ subsets: ["latin"], weight: ['300', '400', '700', '900'] });

export const metadata: Metadata = {
  title: 'Yuubin - Mindful Letter Exchange',
  description: 'Exchange thoughtful letters with the world. A platform for meaningful, mindful correspondence with authentic postal vibes.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
