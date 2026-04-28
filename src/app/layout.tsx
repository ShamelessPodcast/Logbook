import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { CookieBanner } from '@/components/ui/CookieBanner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Logbook',
    template: '%s — Logbook',
  },
  description: 'The social network for UK car owners. Your licence plate is your identity.',
  keywords: ['cars', 'UK', 'number plate', 'social network', 'car owners', 'MOT'],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple:    [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Logbook',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
        <CookieBanner />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
