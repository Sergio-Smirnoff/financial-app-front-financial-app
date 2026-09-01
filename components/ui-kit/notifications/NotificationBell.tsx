'use client'

import { useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useUnreadCount } from '@/lib/hooks/useNotifications'
import { NotificationList } from './NotificationList'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const t = useTranslations('common')
  const [panelOpen, setPanelOpen] = useState(false)
  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.count ?? 0

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('notifications')}
        className="relative"
        onClick={() => setPanelOpen((o) => !o)}
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span
            role="status"
            aria-label={t('unreadNotifications', { count: unreadCount })}
            className={cn(
              'absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-medium',
              'flex items-center justify-center',
              'bg-destructive text-destructive-foreground',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {panelOpen && (
        <div className="absolute right-0 top-full z-50 w-80 rounded-lg border bg-card elev-md">
          <NotificationList onClose={() => setPanelOpen(false)} />
        </div>
      )}
    </div>
  )
}
