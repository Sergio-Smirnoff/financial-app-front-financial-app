'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  Landmark,
  CreditCard,
  TrendingUp,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/lib/store/ui.store'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Categories', href: '/categories', icon: Tag },
  { label: 'Loans', href: '/loans', icon: Landmark },
  { label: 'Card Expenses', href: '/card-expenses', icon: CreditCard },
  { label: 'Investments', href: '/investments', icon: TrendingUp },
]

function NavLink({ item, onClick }: { item: (typeof NAV_ITEMS)[number]; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-sidebar-foreground">FinanceApp</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  )
}

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()

  if (!sidebarOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-sidebar md:hidden">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold text-sidebar-foreground">FinanceApp</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>
      </aside>
    </>
  )
}
