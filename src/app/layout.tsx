import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { SITE_URL } from '@/lib/site-routes'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// metadataBase alone emits nothing — it only resolves relative urls inside other
// metadata fields, so the openGraph block is what actually advertises og:url.
// Don't remove it as redundant; before it landed this host served no canonical
// metadata at all. No `images` key: this repo ships no OG image.
export const metadata: Metadata = {
  title: 'Instrument Tuner',
  description: 'Real-time chromatic instrument tuner',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Instrument Tuner',
    description: 'Real-time chromatic instrument tuner',
    url: '/',
    siteName: 'Instrument Tuner',
    type: 'website',
  },
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Analytics />
        {ADSENSE_CLIENT ? (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  )
}
