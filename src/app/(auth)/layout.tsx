import { LogbookLogo } from '@/components/ui/LogbookLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <LogbookLogo size="lg" />
          <p className="text-sm text-neutral-500">Your licence plate is your identity</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
