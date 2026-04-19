import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logbook — The social network for UK car owners',
  description: 'Your number plate. Your identity. Join thousands of UK car enthusiasts sharing their builds, MOT history, and daily drives on Logbook.',
  openGraph: {
    title: 'Logbook — The social network for UK car owners',
    description: 'Your number plate. Your identity.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-brand-600">L</span>
          <span className="text-xl font-bold tracking-tight text-gray-900">ogbook</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-white pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Plate badge */}
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Now in beta</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.05] mb-6">
            Your number plate.
            <br />
            <span className="text-brand-600">Your identity.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            The social network built for UK car owners. Share your builds, track your MOT history, and connect with thousands of enthusiasts who get it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
            >
              Create your Logbook →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-full border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
          </div>

          {/* Plate preview */}
          <div className="mt-14 flex items-center justify-center gap-3 flex-wrap">
            {['LD73 LOG', 'BX19 CTR', 'WX07 GTI', 'SF21 RST'].map((plate) => (
              <div
                key={plate}
                className="inline-flex items-center gap-1.5 bg-[#F5C800] border-2 border-[#1a1a1a] rounded-[4px] px-3 py-1"
              >
                <div className="w-3.5 h-full bg-blue-700 rounded-sm flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full border border-yellow-300" />
                  <div className="text-[4px] font-bold text-yellow-100 leading-none">GB</div>
                </div>
                <span className="text-sm font-black tracking-widest text-gray-900 font-mono">{plate}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">Your plate becomes your profile</p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-4">
            Built for the way you actually talk about cars
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            Not another generic forum. Logbook is purpose-built for UK car culture.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔧',
                title: 'Build Logs',
                desc: 'Document every mod, service, and fix. Part numbers, costs, before/after photos — all in one place.',
              },
              {
                icon: '📋',
                title: 'MOT History',
                desc: 'Pull full MOT history instantly. See advisories, failures, and mileage trends for any UK-registered vehicle.',
              },
              {
                icon: '🏁',
                title: 'Car Community',
                desc: 'Follow people, not algorithms. Your feed is filled with real enthusiasts — track day prep, garage finds, and B-road therapy.',
              },
              {
                icon: '🔒',
                title: 'Plate Lock',
                desc: 'Register your plate so only you can post about your car. Protect your identity and your build thread.',
              },
              {
                icon: '🛒',
                title: 'Parts Marketplace',
                desc: 'Buy and sell parts with verified plate owners. No more wondering if the seller actually owns the car.',
              },
              {
                icon: '👥',
                title: 'Make & Model Groups',
                desc: "Find your people. Groups for every marque, model, and generation. Help from people who've been there.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-4">UK Car Culture, Online</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
            From daily drivers to track weapons
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {['Golf GTI', 'Type R', 'Impreza WRX', 'BMW M3', 'Lotus Elise', 'Defender 90', 'Porsche Boxster', 'Tesla Model 3'].map((car) => (
              <span key={car} className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 bg-gray-50">
                {car}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-brand-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to log your first drive?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Free to join. No subscription needed to get started.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-full bg-white px-10 py-4 text-base font-bold text-brand-600 hover:bg-orange-50 transition-colors shadow-xl"
          >
            Create your free Logbook →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-brand-600">L</span>
            <span className="font-bold text-gray-700">ogbook</span>
            <span className="text-gray-400 text-sm ml-2">© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-gray-900 transition-colors">Cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
