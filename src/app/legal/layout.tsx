import { LogbookLogo } from '@/components/ui/LogbookLogo'
import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <LogbookLogo href="/" size="sm" />
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-gray-900 transition-colors">Cookies</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        {children}
      </main>
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Logbook. All rights reserved.
      </footer>
    </div>
  )
}
