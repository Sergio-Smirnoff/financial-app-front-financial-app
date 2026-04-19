'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCardInstallments, useMarkInstallmentPaid } from '@/lib/hooks/useCards'
import { Badge } from '@/components/ui/badge'

interface Props { cardId: number | null; open: boolean; onOpenChange: (o: boolean) => void }

export function CardInstallmentsDialog({ cardId, open, onOpenChange }: Props) {
  const { data, isLoading } = useCardInstallments(open ? cardId : null)
  const markPaid = useMarkInstallmentPaid(cardId ?? 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-auto">
        <DialogHeader><DialogTitle>Card installments</DialogTitle></DialogHeader>
        {isLoading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No installments yet</p>
        ) : (
          <ul className="space-y-2">
            {data.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{i.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.installmentNumber}/{i.totalInstallments} — due {i.dueDate} — {i.amount.toFixed(2)} {i.currency}
                  </p>
                </div>
                {i.paid ? (
                  <Badge variant="secondary">Paid {i.paidDate}</Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={markPaid.isPending}
                    onClick={() => markPaid.mutate({ installmentId: i.id })}
                  >
                    Mark paid
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
