import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Unread counts
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      {/* Left sidebar — desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          profile={profile}
          unreadNotifications={unreadNotifications ?? 0}
        />
      </div>

      {/* Main content */}
      <main className="flex min-h-screen flex-1 flex-col border-x border-neutral-100 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Right sidebar — xl+ only */}
      <RightSidebar />

      {/* Mobile tab bar */}
      <MobileTabBar unreadNotifications={unreadNotifications ?? 0} />
    </div>
  )
}
