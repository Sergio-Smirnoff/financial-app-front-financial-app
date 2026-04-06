'use client'

import { useState } from 'react'
import { useCardExpenses, useDeleteCardExpense, usePayCardInstallment } from '@/lib/hooks/useCardExpenses'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CardExpenseForm } from './CardExpenseForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency, CURRENCIES } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import type { CardExpense } from '@/types/finances'

export function CardExpensesContent() {
  const { openConfirmDelete } = useUiStore()
  const [currencyFilter, setCurrencyFilter] = useState<string | undefined>(undefined)
  const { data: expenses, isLoading, isError } = useCardExpenses({ currency: currencyFilter })
  const deleteExpense = useDeleteCardExpense()
  const payInstallment = usePayCardInstallment()
  const [formOpen, setFormOpen] = useState(false)

  const handleDelete = (expense: CardExpense) => {
    openConfirmDelete({
      title: 'Delete card expense',
      description: `Delete "${expense.description}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteExpense.mutate(expense.id, {
          onSuccess: () => toast.success('Card expense deleted'),
          onError: () => toast.error('Failed to delete card expense'),
        })
      },
    })
  }

  const handlePay = (expense: CardExpense) => {
    payInstallment.mutate(expense.id, {
      onSuccess: () => toast.success('Installment paid'),
      onError: () => toast.error('Failed to pay installment'),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load card expenses." />

  const active = expenses?.filter((e) => e.active) ?? []
  const inactive = expenses?.filter((e) => !e.active) ?? []

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Select
          value={currencyFilter ?? 'ALL'}
          onValueChange={(v) => setCurrencyFilter(v === 'ALL' ? undefined : v)}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All currencies</SelectItem>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New card expense
        </Button>
      </div>

      {expenses?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No card expenses yet.</p>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Active</h2>
          <div className="space-y-3">
            {active.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onDelete={() => handleDelete(exp)}
                onPay={() => handlePay(exp)}
                payPending={payInstallment.isPending}
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Completed</h2>
          <div className="space-y-3">
            {inactive.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onDelete={() => handleDelete(exp)}
                onPay={() => handlePay(exp)}
                payPending={payInstallment.isPending}
              />
            ))}
          </div>
        </section>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New card expense</DialogTitle></DialogHeader>
          <CardExpenseForm onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  )
}

function ExpenseCard({
  expense,
  onDelete,
  onPay,
  payPending,
}: {
  expense: CardExpense
  onDelete: () => void
  onPay: () => void
  payPending: boolean
}) {
  const paidInstallments = expense.totalInstallments - expense.remainingInstallments
  const progress = expense.totalInstallments > 0
    ? (paidInstallments / expense.totalInstallments) * 100
    : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-medium">{expense.description}</CardTitle>
              <Badge variant={expense.active ? 'default' : 'secondary'} className="text-xs">
                {expense.active ? 'Active' : 'Paid'}
              </Badge>
              <Badge variant="outline" className="text-[10px]">{expense.currency}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(expense.totalAmount, expense.currency)} · {expense.totalInstallments} installments · Card {expense.cardId}
            </p>
            <p className="text-xs text-muted-foreground">
              Next due {formatDate(expense.nextDueDate)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {expense.active && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                disabled={payPending}
                onClick={onPay}
              >
                Pay installment
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{paidInstallments} / {expense.totalInstallments} paid</span>
            <span>{formatCurrency(expense.installmentAmount, expense.currency)} / installment</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardHeader>
    </Card>
  )
}
