'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { useBank } from '@/lib/hooks/useBanks'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Surface } from '@/components/shared/Surface'
import { QueryBoundary } from '@/components/shared/QueryBoundary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import Link from 'next/link'
import type { TransactionFilters } from '@/types/finances'

interface Props { bankId: number }

export function BankTransactionsContent({ bankId }: Props) {
  const { data: bank } = useBank(bankId)
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: 50 })
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL')
  
  const bankAccountIds = useMemo(() => {
    return bank?.accounts.map(a => a.id) || []
  }, [bank])

  const currentAccountIds = useMemo(() => {
    if (selectedAccountId === 'ALL') return bankAccountIds
    return [Number(selectedAccountId)]
  }, [selectedAccountId, bankAccountIds])

  const { data, isLoading, isError, error } = useTransactions({
    ...filters,
    accountIds: currentAccountIds.length > 0 ? currentAccountIds : undefined
  })

  const getAccountName = (id: number | null) => {
    return bank?.accounts.find(a => a.id === id)?.name || 'Unknown'
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
            <Link href={`/banks/${bankId}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border bg-background shadow-sm hover:bg-muted">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-black tracking-tight">{bank?.name}</h1>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Transaction History</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[180px] h-9 text-xs font-bold bg-background border-border">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="ALL">All Accounts</SelectItem>
              {bank?.accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.type || 'ALL'} 
            onValueChange={(v) => setFilters(f => ({ ...f, type: v === 'ALL' ? undefined : v as any }))}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs font-bold bg-background border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 h-9">
            <Input 
                type="date" 
                className="border-0 bg-transparent h-7 text-[10px] w-[110px] p-0 focus-visible:ring-0" 
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined }))}
            />
            <span className="text-muted-foreground text-[10px] font-bold px-1">to</span>
            <Input 
                type="date" 
                className="border-0 bg-transparent h-7 text-[10px] w-[110px] p-0 focus-visible:ring-0"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value || undefined }))}
            />
          </div>
        </div>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
        <Surface className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Account</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.content || data.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic text-sm">
                    No transactions found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data.content.map((tx) => (
                  <TableRow key={tx.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3">
                      <span className="text-xs font-bold">{getAccountName(tx.accountId)}</span>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-tighter opacity-70 ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(tx.date)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium truncate max-w-[250px]">{tx.description || tx.categoryName}</span>
                        {tx.transferGroupId && (
                            <Badge variant="outline" className="text-[8px] uppercase font-black px-1 h-3.5 border-border/50 bg-muted/20">
                                <ArrowRightLeft className="h-2 w-2 mr-1" /> Transfer
                            </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {data && !data.last && (
            <div className="p-4 border-t border-border/30 flex justify-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    onClick={() => setFilters(f => ({ ...f, page: (f.page || 0) + 1 }))}
                >
                    Load more activity
                </Button>
            </div>
          )}
        </Surface>
      </QueryBoundary>
    </div>
  )
}
