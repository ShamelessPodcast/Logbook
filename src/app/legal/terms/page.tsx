import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Logbook',
  description: 'The terms and conditions governing your use of Logbook.',
}

export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p>These Terms of Service (&quot;Terms&quot;) govern your use of Logbook. By creating an account you agree to these Terms. Please read them carefully.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. The service</h2>
      <p>Logbook is a social platform for UK car owners. We provide tools for sharing content, tracking vehicle history, and connecting with other enthusiasts. The platform is currently in beta.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Eligibility</h2>
      <p>You must be at least 16 years old to use Logbook. By registering, you confirm you meet this requirement. If you are under 18, you should review these Terms with a parent or guardian.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Your account</h2>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li>You are responsible for keeping your account credentials secure</li>
        <li>Your moniker (username) must not impersonate another person or brand</li>
        <li>You may only register one account per person</li>
        <li>You must provide accurate information when registering</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Acceptable use</h2>
      <p>You agree not to use Logbook to:</p>
      <ul className="space-y-2 text-gray-600 list-disc pl-6">
        <li>Post content that is illegal, harmful, threatening, abusive, or defamatory</li>
        <li>Harass, bully, or intimidate other users</li>
        <li>Post false vehicle information or misrepresent ownership</li>
        <li>Scrape, crawl, or otherwise extract data from the platform in bulk</li>
        <li>Distribute spam, malware, or unsolicited commercial messages</li>
        <li>Attempt to gain unauthorised access to our systems or other users&apos; accounts</li>
        <li>Use the platform for any unlawful purpose</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Content you post</h2>
      <p>You retain ownership of the content you post. By posting on Logbook, you grant us a non-exclusive, royalty-free, worldwide licence to display, distribute, and use that content within the platform and in our marketing materials.</p>
      <p className="mt-3">You are responsible for ensuring your content does not infringe third-party intellectual property rights or violate any laws.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Vehicle data and plate lock</h2>
      <p>We pull vehicle information from official UK government databases (DVLA/DVSA). This information is provided &quot;as is&quot; — we cannot guarantee its accuracy or completeness.</p>
      <p className="mt-3">The Plate Lock feature allows you to claim a registration. By doing so, you confirm you are the registered keeper or have the right to represent that vehicle on Logbook. We reserve the right to remove fraudulent plate claims.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. Paid features</h2>
      <p>Some features (such as Plate Lock) require a one-time payment processed by Stripe. All prices include VAT where applicable. Payments are non-refundable unless required by UK consumer law.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. Moderation and termination</h2>
      <p>We reserve the right to remove content, suspend, or terminate accounts that violate these Terms, at our sole discretion. Where reasonably possible we will notify you of the reason.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">9. Disclaimers and limitation of liability</h2>
      <p>Logbook is provided &quot;as is&quot; without warranties of any kind. To the fullest extent permitted by UK law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
      <p className="mt-3">Nothing in these Terms limits our liability for death or personal injury caused by negligence, or for fraud or fraudulent misrepresentation.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">10. Governing law</h2>
      <p>These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">11. Changes to these Terms</h2>
      <p>We may update these Terms. We will give you at least 14 days notice of material changes via email or in-app notification. Continued use of Logbook after the effective date constitutes acceptance of the updated Terms.</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">12. Contact</h2>
      <p>Questions about these Terms: <a href="mailto:legal@logbook.app" className="text-brand-600 hover:underline">legal@logbook.app</a></p>
    </article>
  )
}
