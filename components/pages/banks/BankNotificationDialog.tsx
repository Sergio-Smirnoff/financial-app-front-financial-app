'use client'

import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, CreditCard, Landmark, TrendingUp, Calendar, Check, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

interface BankNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankId: number
  bankName: string
}

export function BankNotificationDialog({ open, onOpenChange, bankId, bankName }: BankNotificationDialogProps) {
  const { data: allNotifications, isLoading } = useLatestNotifications(bankId)
  const markAsRead = useMarkAsRead()

  const bankNotifications = useMemo(() => {
    if (!allNotifications) return []
    return allNotifications.filter(n => {
      try {
        const metadata = n.metadata ? JSON.parse(n.metadata) : {}
        return metadata.bankId === bankId
      } catch (e) {
        return false
      }
    })
  }, [allNotifications, bankId])

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones - {bankName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando...
            </div>
          ) : bankNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay notificaciones recientes para este banco
            </div>
          ) : (
            <div className="divide-y">
              {bankNotifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type] ?? Bell
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer ${
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
      </DialogContent>
    </Dialog>
  )
}
