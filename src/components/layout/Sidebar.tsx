'use client'

import { cn } from '@/lib/utils'
import {
  Bell,
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
  { href: '/feed',          label: 'Home',         icon: Home },
  { href: '/explore',       label: 'Explore',       icon: Compass },
  { href: '/search',        label: 'Search',        icon: Search },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages',      label: 'Messages',      icon: Mail },
  { href: '/groups',        label: 'Groups',        icon: Users },
  { href: '/marketplace',   label: 'Marketplace',   icon: ShoppingBag },
  { href: '/garage',        label: 'My Garage',     icon: Car },
]

interface SidebarProps {
  profile: Profile | null
  unreadNotifications?: number
  unreadMessages?: number
}

export function Sidebar({ profile, unreadNotifications = 0, unreadMessages = 0 }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-[--border] bg-white px-3 py-4">
      {/* Logo */}
      <Link
        href="/feed"
        className="mb-4 flex items-center gap-2.5 px-3 py-2 group"
      >
        {/* L-plate logo */}
        <img src="/l-plate.svg" alt="Logbook" className="h-8 w-8 rounded-sm select-none" />
        <span className="text-[1.25rem] font-black tracking-tight text-[--ink]">
          Logbook
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const count =
            href === '/notifications'
              ? unreadNotifications
              : href === '/messages'
                ? unreadMessages
                : 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'nav-item',
                active && 'nav-item--active'
              )}
            >
              <span className="relative">
                <Icon className={cn('h-[1.375rem] w-[1.375rem]', active ? 'text-brand-600' : 'text-[--ink]')} strokeWidth={active ? 2.5 : 2} />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
              <span className={cn(active ? 'font-bold text-brand-600' : 'text-[--ink]')}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Post button */}
      <Link
        href="/feed"
        className="mx-3 mt-3 mb-4 flex items-center justify-center rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors"
      >
        Post
      </Link>

      {/* Profile + Settings */}
      {profile && (
        <div className="border-t border-[--border] pt-3">
          <Link
            href={`/${profile.moniker}`}
            className="flex items-center gap-3 rounded-full px-3 py-2.5 transition-colors hover:bg-[--surface-raised]"
          >
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.moniker}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[--ink]">
                {profile.display_name ?? profile.moniker}
              </p>
              <p className="truncate text-xs text-[--ink-subtle]">@{profile.moniker}</p>
            </div>
            <Settings className="h-4 w-4 shrink-0 text-[--ink-muted]" />
          </Link>
          <div className="mt-1 flex gap-1 px-1">
            <Link
              href="/settings/profile"
              className="flex flex-1 items-center gap-2 rounded-full px-3 py-2 text-sm text-[--ink-subtle] transition-colors hover:bg-[--surface-raised] hover:text-[--ink]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-sm text-[--ink-subtle] hover:bg-[--surface-raised] hover:text-[--ink] transition-colors"
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
