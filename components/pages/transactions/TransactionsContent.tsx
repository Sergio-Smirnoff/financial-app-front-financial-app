'use client'

import { useState, useMemo } from 'react'
import { useTransactions, useDeleteTransaction } from '@/lib/hooks/useTransactions'
import { useCategories } from '@/lib/hooks/useCategories'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TransactionForm } from './TransactionForm'
import { TransferDialog } from './TransferDialog'
import { useBanks } from '@/lib/hooks/useBanks'
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
import { Plus, Pencil, Trash2, ArrowRightLeft } from 'lucide-react'
import { formatCurrency, CURRENCIES } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import type { Transaction, TransactionFilters } from '@/types/finances'

import { Surface } from '@/components/shared/Surface'
import { QueryBoundary } from '@/components/shared/QueryBoundary'

export function TransactionsContent() {
  const { openConfirmDelete } = useUiStore()
  const { banks } = useBanks()
  const [currencyFilter, setCurrencyFilter] = useState<string | undefined>(undefined)
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: 20 })
  const [formOpen, setFormOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { data, isLoading, isError, error, refetch } = useTransactions({ ...filters, currency: currencyFilter })
  const deleteMutation = useDeleteTransaction()

  const allAccounts = useMemo(() => {
    return banks?.flatMap(bank => bank.accounts) ?? []
  }, [banks])

  const getAccountName = (accountId: number | null) => {
    if (!accountId) return 'Cash'
    const account = allAccounts.find(a => a.id === accountId)
    return account ? account.name : 'Unknown Account'
  }

  const handleDelete = (tx: Transaction) => {
    openConfirmDelete({
      title: 'Delete transaction',
      description: `Delete "${tx.description}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteMutation.mutate(tx.id, {
          onSuccess: () => { toast.success('Transaction deleted'); refetch(); },
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
          <SelectTrigger className="w-32 h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currencyFilter ?? 'ALL'}
          onValueChange={(v) => {
            setCurrencyFilter(v === 'ALL' ? undefined : v)
            setFilters((f) => ({ ...f, page: 0 }))
          }}
        >
          <SelectTrigger className="w-36 h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All currencies</SelectItem>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.accountId?.toString() ?? 'ALL'}
          onValueChange={(v) => setFilters((f) => ({ ...f, accountId: v === 'ALL' ? undefined : (v === 'CASH' ? 0 : Number(v)), page: 0 }))}
        >
          <SelectTrigger className="w-40 h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All accounts</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            {allAccounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id.toString()} className="text-xs">
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-border" onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft className="mr-1 h-4 w-4" />
            Transfer
          </Button>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New transaction
          </Button>
        </div>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
        {data && (
          <>
            <Surface className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.content.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{formatDate(tx.date)}</TableCell>
                        <TableCell className="text-sm">{tx.description}</TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          {getAccountName(tx.accountId)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.categoryName ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'INCOME' ? 'default' : 'destructive'} className="text-xs">
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-border">{tx.currency}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                            {formatCurrency(tx.amount, tx.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(tx)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(tx)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Surface>

            {/* Pagination */}
            {!data.last && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
                  className="border-border"
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </QueryBoundary>

      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="sm:max-w-md bg-popover border-border">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit transaction' : 'New transaction'}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            defaultValues={editing ?? undefined}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onSuccess={() => { setTransferOpen(false); refetch(); }}
      />

      <ConfirmDialog />
    </div>
  )
}
