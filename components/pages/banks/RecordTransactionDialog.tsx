'use client'

import { useEffect, useMemo, useState } from 'react'
import { useBanks } from '@/lib/hooks/useBanks'
import { useCategories } from '@/lib/hooks/useCategories'
import { useRecordTransaction } from '@/lib/hooks/useTransactions'
import { AccountResponse } from '@/types/banks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export type RecordMode = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: RecordMode
  account: AccountResponse
}

const TITLES: Record<RecordMode, string> = {
  DEPOSIT: 'Deposit Funds',
  WITHDRAW: 'Withdraw Funds',
  TRANSFER: 'Transfer Funds',
}

export function RecordTransactionDialog({ open, onOpenChange, mode, account }: Props) {
  const { banks } = useBanks()
  const { data: categories } = useCategories()
  const record = useRecordTransaction()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [parentCategoryId, setParentCategoryId] = useState<number | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)

  // counterpart selection
  const [counterpartMode, setCounterpartMode] = useState<'OWN' | 'EXTERNAL'>('OWN')
  const [ownCbu, setOwnCbu] = useState('')
  const [externalCbu, setExternalCbu] = useState('')

  const allowExternal = mode !== 'TRANSFER'

  // own accounts, same currency, excluding this account
  const ownAccounts = useMemo(() => {
    const flat: AccountResponse[] = []
    for (const b of banks) for (const a of b.accounts) flat.push(a)
    return flat.filter((a) => a.cbu !== account.cbu && a.currency === account.currency)
  }, [banks, account])

  const categoryFilterType = mode === 'DEPOSIT' ? 'INCOME' : mode === 'WITHDRAW' ? 'EXPENSE' : null

  // Categories are untyped server-side (no INCOME/EXPENSE/BOTH on the wire), so a
  // missing/undefined type means the category applies to any transaction direction.
  const matchesFilter = (type?: string) =>
    categoryFilterType === null || type == null || type === categoryFilterType || type === 'BOTH'

  const parentCategories = useMemo(() => {
    return (categories ?? []).filter((c) => matchesFilter(c.type))
  }, [categories, categoryFilterType])

  const subcategories = useMemo(() => {
    if (!parentCategoryId || !categories) return []
    return categories.find((c) => c.id === parentCategoryId)?.subcategories
      ?.filter((s) => matchesFilter(s.type)) ?? []
  }, [parentCategoryId, categories, categoryFilterType])

  useEffect(() => {
    if (!open) return
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().slice(0, 10))
    setParentCategoryId(undefined)
    setCategoryId(undefined)
    setCounterpartMode('OWN')
    setOwnCbu('')
    setExternalCbu('')
  }, [open, mode, account])

  const resolveCounterpartCbu = (): string | null => {
    if (counterpartMode === 'OWN') return ownCbu || null
    return /^\d{22}$/.test(externalCbu) ? externalCbu : null
  }

  const handleSubmit = () => {
    const counterpart = resolveCounterpartCbu()
    if (!counterpart) {
      toast.error(counterpartMode === 'OWN' ? 'Select a counterpart account' : 'Counterpart CBU must be 22 digits')
      return
    }
    if (!amount || Number(amount) <= 0) { toast.error('Amount must be positive'); return }
    if (!categoryId) { toast.error('Category is required'); return }

    const fromCbu = mode === 'DEPOSIT' ? counterpart : account.cbu
    const toCbu = mode === 'DEPOSIT' ? account.cbu : counterpart

    record.mutate(
      { fromCbu, toCbu, amount, currency: account.currency, categoryId, description: description || undefined, date },
      {
        onSuccess: () => {
          toast.success(`${TITLES[mode].split(' ')[0]} recorded`)
          onOpenChange(false)
        },
        onError: (e: any) => toast.error(e.message || 'Failed to record transaction'),
      },
    )
  }

  const counterpartLabel = mode === 'DEPOSIT' ? 'Source' : 'Destination'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{TITLES[mode]} · {account.name}</DialogTitle>
          <DialogDescription>Record a movement for this account.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Amount</Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Currency</Label>
              <Input value={account.currency} disabled className="bg-background border-border" />
            </div>
          </div>

          {/* Counterpart */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">{counterpartLabel}</Label>
            {allowExternal && (
              <Select value={counterpartMode} onValueChange={(v) => setCounterpartMode(v as 'OWN' | 'EXTERNAL')}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="OWN">Own account</SelectItem>
                  <SelectItem value="EXTERNAL">External CBU</SelectItem>
                </SelectContent>
              </Select>
            )}
            {counterpartMode === 'OWN' ? (
              <Select value={ownCbu} onValueChange={setOwnCbu}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ownAccounts.length === 0 ? (
                    <SelectItem value="__none" disabled>No matching accounts</SelectItem>
                  ) : (
                    ownAccounts.map((a) => (
                      <SelectItem key={a.cbu} value={a.cbu}>{a.name} · ••••{a.cbu.slice(-4)}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Input inputMode="numeric" maxLength={22} value={externalCbu} onChange={(e) => setExternalCbu(e.target.value)} placeholder="22-digit CBU" className="bg-background border-border tracking-widest" />
            )}
          </div>

          {/* Category + subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Category</Label>
              <Select
                value={parentCategoryId?.toString() ?? ''}
                onValueChange={(v) => { setParentCategoryId(v ? Number(v) : undefined); setCategoryId(undefined) }}
              >
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {parentCategories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Subcategory</Label>
              <Select value={categoryId?.toString() ?? ''} onValueChange={(v) => setCategoryId(Number(v))} disabled={!parentCategoryId}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={parentCategoryId ? 'Select' : 'Category first'} /></SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[300px]">
                  {subcategories.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Reason..." className="bg-background border-border" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={record.isPending}>{record.isPending ? 'Processing…' : 'Record'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
