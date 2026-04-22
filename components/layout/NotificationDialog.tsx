'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, CreditCard, Landmark, TrendingUp, Calendar, Check, Info, CheckCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/lib/hooks/useNotifications'
import type { NotificationType } from '@/types/notifications'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  PAYMENT_DUE: CreditCard,
  LOAN_REMINDER: Landmark,
  INSTALLMENT_REMINDER: Calendar,
  INVESTMENT_THRESHOLD: TrendingUp,
  USER_REGISTERED: Check,
  MONTHLY_SUMMARY: Info,
}

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDialog({ open, onOpenChange }: NotificationDialogProps) {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useNotifications(page)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              className="gap-2 border-border"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="divide-y border-border">
              {notifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type] ?? Bell
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer border-border ${
                      !notif.read ? 'bg-muted/20' : ''
                    }`}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  >
                    <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{notif.title}</span>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notif.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
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
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="border-border"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="border-border"
            >
              Siguiente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
