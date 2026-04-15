'use client'

import { cn } from '@/utils/cn'
import {
  Bell,
  BookOpen,
  Car,
  Compass,
  Home,
  Mail,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/types/database'
import { signOut } from '@/app/auth/actions'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: Mail },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/garage', label: 'My Garage', icon: Car },
]

interface SidebarProps {
  profile: Profile | null
  unreadNotifications?: number
  unreadMessages?: number
}

export function Sidebar({ profile, unreadNotifications = 0, unreadMessages = 0 }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-neutral-100 bg-white px-3 py-4">
      {/* Logo */}
      <Link href="/feed" className="mb-6 flex items-center gap-2 px-3 py-2">
        <BookOpen className="h-6 w-6 text-black" />
        <span className="text-xl font-bold tracking-tight">Logbook</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const count =
            href === '/notifications' ? unreadNotifications : href === '/messages' ? unreadMessages : 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-neutral-100 text-black'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Profile + Settings */}
      {profile && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <Link
            href={`/${profile.moniker}`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-neutral-50"
          >
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.moniker}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-black">
                {profile.display_name ?? profile.moniker}
              </p>
              <p className="truncate text-xs text-neutral-500">@{profile.moniker}</p>
            </div>
          </Link>
          <div className="mt-1 flex gap-1">
            <Link
              href="/settings/profile"
              className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-xl px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-black"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  )
}
