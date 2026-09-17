'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBanks } from '@/lib/hooks/useBanks'
import { useCreateLoan } from '@/lib/hooks/useLoans'

export interface CreateLoanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLoanDialog({ open, onOpenChange }: CreateLoanDialogProps) {
  const t = useTranslations('loans')
  const tc = useTranslations('common')
  const { banks, isLoading: banksLoading } = useBanks()
  const createLoan = useCreateLoan()

  const accounts = React.useMemo(() => {
    return banks.flatMap((b) =>
      (b.accounts ?? []).map((acc) => ({
        ...acc,
        bankName: b.name,
      }))
    )
  }, [banks])

  const [destinationCbu, setDestinationCbu] = React.useState('')
  const [name, setName] = React.useState('')
  const [principal, setPrincipal] = React.useState('')
  const [interestRate, setInterestRate] = React.useState('')
  const [totalInstallments, setTotalInstallments] = React.useState('12')
  const [startDate, setStartDate] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setName('')
      setPrincipal('')
      setInterestRate('')
      setTotalInstallments('12')
      setStartDate(new Date().toISOString().split('T')[0])
      if (accounts.length > 0 && !destinationCbu) {
        setDestinationCbu(accounts[0].cbu)
      }
    }
  }, [open, accounts, destinationCbu])

  // Select first account when accounts load if none selected
  React.useEffect(() => {
    if (accounts.length > 0 && !destinationCbu) {
      setDestinationCbu(accounts[0].cbu)
    }
  }, [accounts, destinationCbu])

  const isValid =
    destinationCbu.length > 0 &&
    name.trim().length > 0 &&
    Number(principal) > 0 &&
    Number(interestRate) >= 0 &&
    Number(totalInstallments) >= 1 &&
    Boolean(startDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    const account = accounts.find((a) => a.cbu === destinationCbu)
    if (!account) return

    const bankNumber = account.bankNumber || account.cbu.slice(0, 3)

    try {
      await createLoan.mutateAsync({
        bankNumber,
        destinationAccountCbu: account.cbu,
        name: name.trim(),
        principal: Number(principal).toFixed(2),
        interestRate: Number(interestRate).toFixed(2),
        totalInstallments: Number(totalInstallments),
        startDate,
      })
      toast.success(t('createDialog.success'))
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || t('createDialog.error'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Destination Account */}
          <div className="space-y-1.5">
            <Label htmlFor="destination-account">{t('createDialog.account')}</Label>
            {banksLoading ? (
              <div className="h-10 rounded-md bg-muted animate-pulse" />
            ) : accounts.length === 0 ? (
              <p className="text-sm text-destructive">{t('createDialog.noAccounts')}</p>
            ) : (
              <Select value={destinationCbu} onValueChange={setDestinationCbu}>
                <SelectTrigger id="destination-account">
                  <SelectValue placeholder={t('createDialog.accountPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.cbu} value={acc.cbu}>
                      {acc.bankName} — {acc.alias ?? acc.name} ({acc.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Loan Name */}
          <div className="space-y-1.5">
            <Label htmlFor="loan-name">{t('createDialog.name')}</Label>
            <Input
              id="loan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('createDialog.namePlaceholder')}
              required
            />
          </div>

          {/* Principal & Interest Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="loan-principal">{t('createDialog.principal')}</Label>
              <Input
                id="loan-principal"
                type="number"
                step="0.01"
                min="1"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder={t('createDialog.principalPlaceholder')}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loan-interest-rate">{t('createDialog.interestRate')}</Label>
              <Input
                id="loan-interest-rate"
                type="number"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder={t('createDialog.interestRatePlaceholder')}
                required
              />
            </div>
          </div>

          {/* Installments & Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="loan-installments">{t('createDialog.installments')}</Label>
              <Input
                id="loan-installments"
                type="number"
                min="1"
                max="120"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                placeholder={t('createDialog.installmentsPlaceholder')}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loan-start-date">{t('createDialog.startDate')}</Label>
              <Input
                id="loan-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createLoan.isPending}
            >
              {createLoan.isPending ? t('createDialog.submitting') : t('createDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
