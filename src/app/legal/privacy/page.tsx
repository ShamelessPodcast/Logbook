import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Logbook',
  description: 'How Logbook collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p>Logbook (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal data when you use our platform.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Who we are</h2>
      <p>Logbook is a social platform for UK car owners. Our registered address and data controller contact can be reached at <a href="mailto:privacy@logbook.app" className="text-brand-600 hover:underline">privacy@logbook.app</a>.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. What data we collect</h2>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li><strong>Account data:</strong> email address, password (hashed, never stored in plain text), username (moniker)</li>
        <li><strong>Profile data:</strong> display name, bio, location, profile photo</li>
        <li><strong>Vehicle data:</strong> UK registration plates, make, model, year, and MOT history</li>
        <li><strong>Content:</strong> posts, comments, build logs, marketplace listings, and photos you upload</li>
        <li><strong>Usage data:</strong> pages visited, features used, device type, browser, and IP address</li>
        <li><strong>Communications:</strong> messages sent via the platform, bug reports, and support requests</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. How we use your data</h2>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li>To provide and improve the Logbook service</li>
        <li>To verify vehicle ownership via UK DVLA and DVSA records</li>
        <li>To send important service notifications and, where you have opted in, marketing emails</li>
        <li>To detect and prevent fraud, abuse, and spam</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Legal basis for processing</h2>
      <p>We process your data under the following lawful bases (UK GDPR Article 6):</p>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li><strong>Contract:</strong> to deliver the service you have signed up for</li>
        <li><strong>Legitimate interests:</strong> to improve the platform, prevent fraud, and keep the community safe</li>
        <li><strong>Consent:</strong> for optional features such as marketing emails and analytics cookies</li>
        <li><strong>Legal obligation:</strong> to comply with UK law</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Sharing your data</h2>
      <p>We do not sell your personal data. We may share data with:</p>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li><strong>Supabase</strong> — our database and authentication provider (EU data centres)</li>
        <li><strong>Vercel</strong> — our hosting platform (EU data centres)</li>
        <li><strong>DVLA/DVSA</strong> — to look up vehicle information via official UK government APIs</li>
        <li><strong>Stripe</strong> — to process payments for premium features</li>
        <li><strong>Resend</strong> — to send transactional emails</li>
        <li>Authorities, if required by law</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li>Access the personal data we hold about you</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data ("right to be forgotten")</li>
        <li>Restrict or object to processing</li>
        <li>Data portability</li>
        <li>Withdraw consent at any time</li>
      </ul>
      <p className="mt-4">To exercise any of these rights, email <a href="mailto:privacy@logbook.app" className="text-brand-600 hover:underline">privacy@logbook.app</a>. We will respond within 30 days.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. Cookies</h2>
      <p>We use essential cookies to keep you logged in, and optional analytics cookies to understand how the platform is used. See our <a href="/legal/cookies" className="text-brand-600 hover:underline">Cookie Policy</a> for full details.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. Data retention</h2>
      <p>We retain your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are required by law to retain it longer.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">9. Changes to this policy</h2>
      <p>We may update this policy from time to time. We will notify you of significant changes by email or in-app notification.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">10. Contact us</h2>
      <p>For privacy enquiries: <a href="mailto:privacy@logbook.app" className="text-brand-600 hover:underline">privacy@logbook.app</a></p>
      <p>To make a complaint to the UK data regulator: <a href="https://ico.org.uk" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a></p>
    </article>
  )
}
