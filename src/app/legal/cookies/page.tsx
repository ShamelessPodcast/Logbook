import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Logbook',
  description: 'How Logbook uses cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p>This policy explains what cookies are, which ones Logbook uses, and how you can control them.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What are cookies?</h2>
      <p>Cookies are small text files stored on your device by your browser. They help websites remember information about your visit — like whether you are logged in.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Cookies we use</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200 font-semibold">Name</th>
              <th className="text-left p-3 border border-gray-200 font-semibold">Type</th>
              <th className="text-left p-3 border border-gray-200 font-semibold">Purpose</th>
              <th className="text-left p-3 border border-gray-200 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-200 font-mono text-xs">sb-*</td>
              <td className="p-3 border border-gray-200">Essential</td>
              <td className="p-3 border border-gray-200">Supabase authentication session</td>
              <td className="p-3 border border-gray-200">Session / 7 days</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-3 border border-gray-200 font-mono text-xs">logbook_cookie_consent</td>
              <td className="p-3 border border-gray-200">Essential</td>
              <td className="p-3 border border-gray-200">Remembers your cookie preferences</td>
              <td className="p-3 border border-gray-200">1 year</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-mono text-xs">_vercel_*</td>
              <td className="p-3 border border-gray-200">Essential</td>
              <td className="p-3 border border-gray-200">Vercel edge routing and performance</td>
              <td className="p-3 border border-gray-200">Session</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">We currently use only essential cookies. We do not use third-party advertising or tracking cookies.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to control cookies</h2>
      <p>You can manage cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in to Logbook.</p>
      <ul className="space-y-1 text-gray-600 list-disc pl-6 text-sm">
        <li><a href="https://support.google.com/chrome/answer/95647" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">Firefox</a></li>
        <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Changes to this policy</h2>
      <p>We will update this policy if we introduce new cookies. Any analytics or advertising cookies will require your explicit consent.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Contact</h2>
      <p>Questions about cookies: <a href="mailto:privacy@logbook.app" className="text-brand-600 hover:underline">privacy@logbook.app</a></p>
    </article>
  )
}
