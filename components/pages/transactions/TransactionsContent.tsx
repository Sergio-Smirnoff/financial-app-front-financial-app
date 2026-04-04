'use client'

import { useState } from 'react'
import { useTransactions, useDeleteTransaction } from '@/lib/hooks/useTransactions'
import { useCategories } from '@/lib/hooks/useCategories'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TransactionForm } from './TransactionForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import type { Transaction, TransactionFilters } from '@/types/finances'

export function TransactionsContent() {
  const { currency, openConfirmDelete } = useUiStore()
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: 20, currency })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { data, isLoading, isError } = useTransactions({ ...filters, currency })
  const deleteMutation = useDeleteTransaction()

  const handleDelete = (tx: Transaction) => {
    openConfirmDelete({
      title: 'Delete transaction',
      description: `Delete "${tx.description}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteMutation.mutate(tx.id, {
          onSuccess: () => toast.success('Transaction deleted'),
          onError: () => toast.error('Failed to delete transaction'),
        })
      },
    })
  }

  const handleEdit = (tx: Transaction) => {
    setEditing(tx)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setEditing(null)
    setFormOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.type ?? 'ALL'}
          onValueChange={(v) => setFilters((f) => ({ ...f, type: v === 'ALL' ? undefined : (v as 'INCOME' | 'EXPENSE'), page: 0 }))}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New transaction
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message="Failed to load transactions." />}

      {data && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.content.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{formatDate(tx.date)}</TableCell>
                      <TableCell className="text-sm">{tx.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.categoryName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'INCOME' ? 'default' : 'destructive'} className="text-xs">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(tx)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(tx)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!data.last && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit transaction' : 'New transaction'}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            defaultValues={editing ?? undefined}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  )
}
