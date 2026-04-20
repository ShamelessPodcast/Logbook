'use client'

import { cn } from '@/lib/utils'
import { Bell, Car, Compass, Home, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/feed',          icon: Home,    label: 'Home' },
  { href: '/explore',       icon: Compass, label: 'Explore' },
  { href: '/notifications', icon: Bell,    label: 'Alerts' },
  { href: '/messages',      icon: Mail,    label: 'Messages' },
  { href: '/garage',        icon: Car,     label: 'Garage' },
]

interface MobileTabBarProps {
  unreadNotifications?: number
  unreadMessages?: number
}

export function MobileTabBar({ unreadNotifications = 0, unreadMessages = 0 }: MobileTabBarProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-white/95 backdrop-blur-sm pb-safe lg:hidden">
      <div className="flex">
        {tabs.map(({ href, icon: Icon, label }) => {
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
                'tab-item flex flex-1 flex-col items-center gap-0.5 px-2 py-3',
                active ? 'tab-item--active' : 'text-[--ink-muted]'
              )}
              aria-label={label}
            >
              <span className="relative">
                <Icon
                  className={cn('h-[1.375rem] w-[1.375rem]', active ? 'text-brand-600' : 'text-[--ink-muted]')}
                  strokeWidth={active ? 2.5 : 2}
                />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
              <span className={cn('text-[10px] font-medium', active && 'font-bold text-brand-600')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
