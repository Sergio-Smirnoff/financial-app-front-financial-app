'use client'

import { useEffect } from 'react'
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
  ChevronLeft,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  const tCommon = useTranslations('common')
  const routePathname = usePathname()
  const pathname = pathnameProp ?? routePathname
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)

  useEffect(() => {
    void useUiStore.persist.rehydrate()
  }, [])

  const toggleLabel = collapsed ? tCommon('expandMenu') : tCommon('collapseMenu')

  return (
    <aside
      data-slot="rail"
      data-collapsed={collapsed}
      className={cn(
        'hidden shrink-0 flex-col border-r bg-sidebar transition-[width] duration-180 ease-out motion-reduce:transition-none md:flex',
        collapsed ? 'md:w-16' : 'md:w-[clamp(176px,11vw,240px)]',
      )}
    >
      <div className={cn('flex h-14 items-center border-b', collapsed ? 'justify-center px-2' : 'px-4')}>
        <span className="flex min-w-0 items-center gap-2 font-semibold text-sidebar-foreground" title="FinanceApp">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sm text-sidebar-primary-foreground"
          >
            $
          </span>
          <span className={cn('truncate', collapsed && 'sr-only')}>FinanceApp</span>
        </span>
      </div>
      <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-3')} aria-label={tCommon('mainNavigation')}>
        {NAV_ROUTES.map((item) => (
          <SideNavItem
            key={item.href}
            href={item.href}
            label={t(item.key)}
            icon={item.icon}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>
      <div className={cn('border-t', collapsed ? 'p-2' : 'p-3')}>
        <button
          type="button"
          data-testid="rail-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          title={toggleLabel}
          className={cn(
            'flex w-full items-center gap-3 rounded-md py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'justify-center px-0' : 'px-3',
          )}
        >
          <ChevronLeft
            aria-hidden="true"
            className={cn('h-4 w-4 shrink-0 transition-transform duration-180 motion-reduce:transition-none', collapsed && 'rotate-180')}
          />
          {!collapsed && <span className="min-w-0 truncate">{toggleLabel}</span>}
        </button>
      </div>
    </aside>
  )
}

export function MobileSideNav({ pathname: pathnameProp }: SideNavProps) {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
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
            aria-label={tCommon('closeMenu')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label={tCommon('mainNavigation')}>
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
