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
import { useTranslations } from 'next-intl'

export type RecordMode = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: RecordMode
  initialMode?: RecordMode
  account?: AccountResponse | null
}

const TITLE_KEYS: Record<RecordMode, string> = {
  DEPOSIT: 'dialogs.record.title.DEPOSIT',
  WITHDRAW: 'dialogs.record.title.WITHDRAW',
  TRANSFER: 'dialogs.record.title.TRANSFER',
}

const SUCCESS_KEYS: Record<RecordMode, string> = {
  DEPOSIT: 'dialogs.record.success.DEPOSIT',
  WITHDRAW: 'dialogs.record.success.WITHDRAW',
  TRANSFER: 'dialogs.record.success.TRANSFER',
}

export function RecordTransactionDialog({ open, onOpenChange, mode: propMode, initialMode, account }: Props) {
  const t = useTranslations('banks')
  const tc = useTranslations('common')
  const { banks } = useBanks()
  const { data: categories } = useCategories()
  const record = useRecordTransaction()

  const allAccounts = useMemo(() => {
    const flat: AccountResponse[] = []
    for (const b of banks) for (const a of b.accounts) flat.push(a)
    return flat
  }, [banks])

  const [mode, setMode] = useState<RecordMode>(propMode || initialMode || 'TRANSFER')
  const [selectedCbu, setSelectedCbu] = useState<string>(account?.cbu || '')

  const activeAccount = useMemo(() => {
    if (account) return account
    return allAccounts.find((a) => a.cbu === selectedCbu) || allAccounts[0]
  }, [account, allAccounts, selectedCbu])

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
    if (!activeAccount) return []
    return allAccounts.filter((a) => a.cbu !== activeAccount.cbu && a.currency === activeAccount.currency)
  }, [allAccounts, activeAccount])

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
    if (!account && allAccounts.length > 0 && !selectedCbu) {
      setSelectedCbu(allAccounts[0].cbu)
    }
  }, [account, allAccounts, selectedCbu])

  useEffect(() => {
    if (!open) return
    if (propMode) setMode(propMode)
    if (account?.cbu) {
      setSelectedCbu(account.cbu)
    } else if (allAccounts.length > 0) {
      setSelectedCbu(allAccounts[0].cbu)
    }
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().slice(0, 10))
    setParentCategoryId(undefined)
    setCategoryId(undefined)
    setCounterpartMode('OWN')
    setOwnCbu('')
    setExternalCbu('')
  }, [open, propMode, account, allAccounts])

  const resolveCounterpartCbu = (): string | null => {
    if (counterpartMode === 'OWN') return ownCbu || null
    if (!externalCbu || externalCbu.trim() === '') {
      return '0000000000000000000000'
    }
    return /^\d{22}$/.test(externalCbu) ? externalCbu : null
  }

  const handleSubmit = () => {
    if (!activeAccount) {
      toast.error(t('dialogs.record.errorSelectCounterpart'))
      return
    }
    const counterpart = resolveCounterpartCbu()
    if (!counterpart) {
      toast.error(counterpartMode === 'OWN' ? t('dialogs.record.errorSelectCounterpart') : t('dialogs.record.errorCounterpartCbu'))
      return
    }
    if (!amount || Number(amount) <= 0) { toast.error(t('dialogs.record.errorAmountPositive')); return }
    if (!categoryId) { toast.error(t('dialogs.record.errorCategoryRequired')); return }

    const fromCbu = mode === 'DEPOSIT' ? counterpart : activeAccount.cbu
    const toCbu = mode === 'DEPOSIT' ? activeAccount.cbu : counterpart

    record.mutate(
      { fromCbu, toCbu, amount, currency: activeAccount.currency, categoryId, description: description || undefined, date },
      {
        onSuccess: () => {
          toast.success(t(SUCCESS_KEYS[mode]))
          onOpenChange(false)
        },
        onError: (e: any) => toast.error(e.message || t('dialogs.record.errorRecord')),
      },
    )
  }

  const counterpartLabel = mode === 'DEPOSIT' ? t('dialogs.record.counterpartSource') : t('dialogs.record.counterpartDestination')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{t(TITLE_KEYS[mode])}{activeAccount ? ` · ${activeAccount.name}` : ''}</DialogTitle>
          <DialogDescription>{t('dialogs.record.description')}</DialogDescription>
        </DialogHeader>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('DEPOSIT')}
            className={`py-1.5 rounded-lg transition-colors ${mode === 'DEPOSIT' ? 'bg-card text-emerald-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('dialogs.record.title.DEPOSIT')}
          </button>
          <button
            type="button"
            onClick={() => setMode('WITHDRAW')}
            className={`py-1.5 rounded-lg transition-colors ${mode === 'WITHDRAW' ? 'bg-card text-rose-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('dialogs.record.title.WITHDRAW')}
          </button>
          <button
            type="button"
            onClick={() => setMode('TRANSFER')}
            className={`py-1.5 rounded-lg transition-colors ${mode === 'TRANSFER' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('dialogs.record.title.TRANSFER')}
          </button>
        </div>

        <div className="space-y-4 py-2">
          {/* Account selector when not locked to a specific account */}
          {!account && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('accounts.fallbackName')}</Label>
              <Select value={selectedCbu} onValueChange={setSelectedCbu}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t('dialogs.record.selectAccountPlaceholder')} /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {allAccounts.map((a) => (
                    <SelectItem key={a.cbu} value={a.cbu}>
                      {a.name} ({a.currency}) · ••••{a.cbu.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tc('amount')}</Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('dialogs.shared.fieldCurrency')}</Label>
              <Input value={activeAccount?.currency ?? 'ARS'} disabled className="bg-background border-border" />
            </div>
          </div>

          {/* Counterpart */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">{counterpartLabel}</Label>
            {allowExternal && (
              <Select value={counterpartMode} onValueChange={(v) => setCounterpartMode(v as 'OWN' | 'EXTERNAL')}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="OWN">{t('dialogs.record.counterpartOwn')}</SelectItem>
                  <SelectItem value="EXTERNAL">{t('dialogs.record.counterpartExternal')}</SelectItem>
                </SelectContent>
              </Select>
            )}
            {counterpartMode === 'OWN' ? (
              <Select value={ownCbu} onValueChange={setOwnCbu}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t('dialogs.record.selectAccountPlaceholder')} /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ownAccounts.length === 0 ? (
                    <SelectItem value="__none" disabled>{t('dialogs.record.noMatchingAccounts')}</SelectItem>
                  ) : (
                    ownAccounts.map((a) => (
                      <SelectItem key={a.cbu} value={a.cbu}>{a.name} · ••••{a.cbu.slice(-4)}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Input inputMode="numeric" maxLength={22} value={externalCbu} onChange={(e) => setExternalCbu(e.target.value)} placeholder={t('dialogs.record.cbuPlaceholder')} className="bg-background border-border tracking-widest" />
            )}
          </div>

          {/* Category + subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tc('category')}</Label>
              <Select
                value={parentCategoryId?.toString() ?? ''}
                onValueChange={(v) => {
                  const pId = v ? Number(v) : undefined
                  setParentCategoryId(pId)
                  setCategoryId(pId)
                }}
              >
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t('dialogs.record.selectPlaceholder')} /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {parentCategories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('dialogs.record.fieldSubcategory')}</Label>
              <Select
                value={categoryId && categoryId !== parentCategoryId ? categoryId.toString() : ''}
                onValueChange={(v) => setCategoryId(v ? Number(v) : parentCategoryId)}
                disabled={!parentCategoryId || subcategories.length === 0}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue
                    placeholder={
                      !parentCategoryId
                        ? t('dialogs.record.categoryFirst')
                        : subcategories.length === 0
                        ? '—'
                        : t('dialogs.record.selectPlaceholder')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[300px]">
                  {subcategories.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">{t('dialogs.shared.fieldDescription')}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('dialogs.record.reasonPlaceholder')} className="bg-background border-border" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">{t('dialogs.record.fieldDate')}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">{tc('cancel')}</Button>
          <Button type="button" onClick={handleSubmit} disabled={record.isPending}>{record.isPending ? t('dialogs.record.processing') : t('dialogs.record.recordAction')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
