'use client'

import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  ArrowLeftRight,
  Tag,
  TrendingUp,
  Upload,
  Settings,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/lib/store/ui.store'
import { SideNavItem } from './SideNavItem'

const NAV_ROUTES = [
  { key: 'overview' as const, href: '/', icon: LayoutDashboard },
  { key: 'banks' as const, href: '/banks', icon: Building2 },
  { key: 'transactions' as const, href: '/transactions', icon: ArrowLeftRight },
  { key: 'categories' as const, href: '/categories', icon: Tag },
  { key: 'investments' as const, href: '/investments', icon: TrendingUp },
  { key: 'imports' as const, href: '/imports', icon: Upload },
  { key: 'settings' as const, href: '/settings', icon: Settings },
]

export interface SideNavProps {
  /** Injected in tests; falls back to `usePathname` at runtime. */
  pathname?: string
}

export function SideNav({ pathname: pathnameProp }: SideNavProps) {
  const t = useTranslations('nav')
  const routePathname = usePathname()
  const pathname = pathnameProp ?? routePathname

  return (
    <aside
      data-slot="rail"
      className="hidden md:flex md:w-60 shrink-0 flex-col border-r bg-sidebar"
    >
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-sidebar-foreground">FinanceApp</span>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Navegación principal">
        {NAV_ROUTES.map((item) => (
          <SideNavItem
            key={item.href}
            href={item.href}
            label={t(item.key)}
            icon={item.icon}
            pathname={pathname}
          />
        ))}
      </nav>
    </aside>
  )
}

export function MobileSideNav({ pathname: pathnameProp }: SideNavProps) {
  const t = useTranslations('nav')
  const routePathname = usePathname()
  const pathname = pathnameProp ?? routePathname
  const { sidebarOpen, setSidebarOpen } = useUiStore()

  if (!sidebarOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/80 md:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-sidebar md:hidden">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold text-sidebar-foreground">FinanceApp</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navegación principal">
          {NAV_ROUTES.map((item) => (
            <SideNavItem
              key={item.href}
              href={item.href}
              label={t(item.key)}
              icon={item.icon}
              pathname={pathname}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
