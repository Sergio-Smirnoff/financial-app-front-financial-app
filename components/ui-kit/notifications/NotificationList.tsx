'use client'

import { useState } from 'react'
import { Bell, CreditCard, Landmark, TrendingUp, Calendar, Check, Info, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, useLatestNotifications, useMarkAsRead, useMarkAllAsRead } from '@/lib/hooks/useNotifications'
import type { NotificationType } from '@/types/notifications'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  PAYMENT_DUE: CreditCard,
  LOAN_REMINDER: Landmark,
  INSTALLMENT_REMINDER: Calendar,
  INVESTMENT_THRESHOLD: TrendingUp,
  USER_REGISTERED: Check,
  MONTHLY_SUMMARY: Info,
}

interface NotificationListProps {
  /** Called when the user navigates away or closes the panel. */
  onClose?: () => void
  /** Render in full-page mode (paginated) vs. dropdown mode (latest only). */
  mode?: 'dropdown' | 'full'
}

export function NotificationList({ onClose, mode = 'dropdown' }: NotificationListProps) {
  const t = useTranslations('common')
  const [page, setPage] = useState(0)
  const { data: latest } = useLatestNotifications()
  const { data: paged, isLoading } = useNotifications(page)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = mode === 'full' ? (paged?.content ?? []) : (latest ?? [])
  const totalPages = paged?.totalPages ?? 0

  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">{t('notifications')}</span>
        <div className="flex items-center gap-1">
          {mode === 'full' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              className="gap-1 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t('markAll')}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              {t('close')}
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className={mode === 'full' ? 'h-[400px]' : 'h-64'}>
        {isLoading && mode === 'full' ? (
          <div className="p-4 text-center text-sm text-muted-foreground">{t('loading')}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('noNotifications')}
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] ?? Bell
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                    !notif.read ? 'bg-muted/20' : ''
                  }`}
                  onClick={() => !notif.read && markAsRead.mutate(notif.id)}
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{notif.title}</span>
                      {!notif.read && (
                        <span
                          className="status-dot status-dot-warn shrink-0"
                          aria-label={t('unread')}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {mode === 'full' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {t('previous')}
          </Button>
          <span className="text-xs text-muted-foreground">
            {t('pageOf', { page: page + 1, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            {t('next')}
          </Button>
        </div>
      )}
    </div>
  )
}
