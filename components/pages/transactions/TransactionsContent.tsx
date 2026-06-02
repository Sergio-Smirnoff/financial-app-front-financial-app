'use client'

import { useState, useMemo } from 'react'
import { useTransactions, useDeleteTransaction } from '@/lib/hooks/useTransactions'
import { useUiStore } from '@/lib/store/ui.store'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
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
import { Trash2 } from 'lucide-react'
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
  const [accountCbu, setAccountCbu] = useState<string | undefined>(undefined)
  const [filters] = useState<TransactionFilters>({})

  const { data, isLoading, isError, error, refetch } = useTransactions({
    ...filters,
    currency: currencyFilter,
    accountCbu,
  })
  const deleteMutation = useDeleteTransaction()

  const allAccounts = useMemo(() => banks?.flatMap((bank) => bank.accounts) ?? [], [banks])

  const accountName = (cbu: string | null) => {
    if (!cbu) return '—'
    const account = allAccounts.find((a) => a.cbu === cbu)
    return account ? account.name : `••••${cbu.slice(-4)}`
  }

  const handleDelete = (tx: Transaction) => {
    openConfirmDelete({
      title: 'Delete transaction',
      description: `Delete "${tx.description ?? 'transaction'}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteMutation.mutate(tx.id, {
          onSuccess: () => { toast.success('Transaction deleted'); refetch() },
          onError: () => toast.error('Failed to delete transaction'),
        })
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={currencyFilter ?? 'ALL'}
          onValueChange={(v) => setCurrencyFilter(v === 'ALL' ? undefined : v)}
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
          value={accountCbu ?? 'ALL'}
          onValueChange={(v) => setAccountCbu(v === 'ALL' ? undefined : v)}
        >
          <SelectTrigger className="w-48 h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All accounts</SelectItem>
            {allAccounts.map((acc) => (
              <SelectItem key={acc.cbu} value={acc.cbu} className="text-xs">
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
        {data && (
          <Surface className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{formatDate(tx.date)}</TableCell>
                      <TableCell className="text-sm">{tx.description ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{accountName(tx.fromCbu)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{accountName(tx.toCbu)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.categoryName ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'INCOME' ? 'default' : tx.type === 'EXPENSE' ? 'destructive' : 'secondary'} className="text-xs">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-border">{tx.currency}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : tx.type === 'EXPENSE' ? 'text-destructive' : ''}>
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
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
        )}
      </QueryBoundary>

      <ConfirmDialog />
    </div>
  )
}
