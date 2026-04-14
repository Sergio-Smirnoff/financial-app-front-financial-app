'use client'

import { Bell, CreditCard, Landmark, TrendingUp, Calendar, Check, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLatestNotifications, useMarkAsRead } from '@/lib/hooks/useNotifications'
import type { NotificationType } from '@/types/notifications'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  PAYMENT_DUE: CreditCard,
  LOAN_REMINDER: Landmark,
  INSTALLMENT_REMINDER: Calendar,
  INVESTMENT_THRESHOLD: TrendingUp,
  USER_REGISTERED: Check,
  MONTHLY_SUMMARY: Info,
}

const TYPE_LABELS: Record<NotificationType, string> = {
  PAYMENT_DUE: 'Pago pendiente',
  LOAN_REMINDER: 'Recordatorio de préstamo',
  INSTALLMENT_REMINDER: 'Cuota pendiente',
  INVESTMENT_THRESHOLD: 'Alerta de inversión',
  USER_REGISTERED: 'Bienvenido',
  MONTHLY_SUMMARY: 'Resumen mensual',
}

interface NotificationDropdownProps {
  onOpenDialog: () => void
  onClose: () => void
}

export function NotificationDropdown({ onOpenDialog, onClose }: NotificationDropdownProps) {
  const { data: notifications, isLoading } = useLatestNotifications()
  const markAsRead = useMarkAsRead()

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id)
  }

  return (
    <div
      className="absolute right-0 top-full w-80 rounded-lg border bg-popover shadow-lg z-50"
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">Notificaciones</span>
        <Button variant="ghost" size="sm" onClick={onOpenDialog}>
          Ver todas
        </Button>
      </div>
      <ScrollArea className="h-64">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Cargando...
          </div>
        ) : notifications?.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          <div className="divide-y">
            {notifications?.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] ?? Bell
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                    !notif.read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
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
    </div>
  )
}
