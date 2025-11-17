'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  ShieldBan, 
  Clock, 
  Settings, 
  CreditCard,
  Bell,
  BarChart3,
  Chrome
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profiles', href: '/dashboard/profiles', icon: Users },
  { name: 'Blocklists', href: '/dashboard/blocklists', icon: ShieldBan },
  { name: 'Timeline', href: '/dashboard/timeline', icon: Clock },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Browsers', href: '/dashboard/browsers', icon: Chrome },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col pt-16">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-6">
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                          'group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-colors'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400',
                            'h-5 w-5 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}

