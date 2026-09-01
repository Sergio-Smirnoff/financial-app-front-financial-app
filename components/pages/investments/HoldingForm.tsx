'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { useCreateHolding, useUpdateHolding } from '@/lib/hooks/useInvestments'
import { useBanks } from '@/lib/hooks/useBanks'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import type { HoldingWithPrice } from '@/types/investments'

const ASSET_TYPE_OPTIONS = [
  { value: 'STOCK', labelKey: 'holdings.assetType.STOCK' },
  { value: 'CEDEAR', labelKey: 'holdings.assetType.CEDEAR' },
  { value: 'BOND', labelKey: 'holdings.assetType.BOND' },
  { value: 'FCI', labelKey: 'holdings.assetType.FCI' },
] as const

const CURRENCIES = ['ARS', 'USD'] as const

type InvestmentsTranslator = ReturnType<typeof useTranslations<'investments'>>

function makeHoldingSchema(t: InvestmentsTranslator) {
  const required = t('holdings.validation.required')
  const mustBePositive = t('holdings.validation.mustBePositive')

  return z.object({
    bankNumber: z.string().regex(/^\d{3}$/, required),
    fundingCbu: z
      .string()
      .regex(/^\d{22}$/, t('holdings.validation.requiredForTransaction'))
      .optional()
      .nullable(),
    ticker: z.string().min(1, required).max(20),
    name: z.string().min(1, required).max(100),
    assetType: z.enum(['STOCK', 'BOND', 'CEDEAR', 'FCI']),
    quantity: z.number({ error: required }).positive(mustBePositive),
    avgPurchasePrice: z
      .number({ error: required })
      .min(0, t('holdings.validation.mustBeZeroOrPositive')),
    currency: z.enum(CURRENCIES),
    notifyGainThresholdPct: z.number().positive(mustBePositive).max(1000).optional().nullable(),
    notifyLossThresholdPct: z.number().positive(mustBePositive).max(1000).optional().nullable(),
  })
}

type FormValues = z.infer<ReturnType<typeof makeHoldingSchema>>

interface HoldingFormProps {
  holding?: HoldingWithPrice | null
  onSuccess: () => void
}

export function HoldingForm({ holding, onSuccess }: HoldingFormProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { banks, isLoading: banksLoading } = useBanks()
  const createHolding = useCreateHolding()
  const updateHolding = useUpdateHolding()
  const isEditing = !!holding

  const schema = useMemo(() => makeHoldingSchema(t), [t])

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankNumber: holding?.bankNumber || '',
      fundingCbu: null,
      ticker: holding?.ticker || '',
      name: holding?.name || '',
      assetType: (holding?.assetType as any) || 'STOCK',
      quantity: holding?.quantity ?? undefined,
      avgPurchasePrice: holding?.avgPurchasePrice ?? undefined,
      currency: (holding?.currency?.toUpperCase() as any) || 'ARS',
      notifyGainThresholdPct: holding?.notifyGainThresholdPct || null,
      notifyLossThresholdPct: holding?.notifyLossThresholdPct || null,
    },
  })

  const selectedCurrency = form.watch('currency')
  const selectedBankNumber = form.watch('bankNumber')

  const currentBank = useMemo(
    () => banks.find((bank) => bank.bankNumber === selectedBankNumber) ?? null,
    [banks, selectedBankNumber],
  )

  const fundingAccounts = useMemo(
    () =>
      (currentBank?.accounts ?? []).filter(
        (account) => account.currency.toUpperCase() === selectedCurrency.toUpperCase(),
      ),
    [currentBank, selectedCurrency],
  )

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      ticker: values.ticker.toUpperCase(),
      fundingCbu: values.fundingCbu ?? undefined,
      notifyGainThresholdPct: values.notifyGainThresholdPct ?? undefined,
      notifyLossThresholdPct: values.notifyLossThresholdPct ?? undefined,
    }

    if (isEditing && holding) {
      updateHolding.mutate(
        { id: holding.id, data },
        {
          onSuccess: () => { toast.success(t('holdings.toastUpdated')); onSuccess() },
          onError: (e: any) => { toast.error(e.message || t('holdings.toastUpdateFailed')) },
        },
      )
    } else {
      createHolding.mutate(data, {
        onSuccess: () => { toast.success(t('holdings.toastCreated')); onSuccess() },
        onError: (e: any) => { toast.error(e.message || t('holdings.toastCreateFailed')) },
      })
    }
  }

  const isPending = createHolding.isPending || updateHolding.isPending

  if (banksLoading || (isEditing && !holding)) {
    return (
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-11 rounded-xl bg-muted animate-pulse" />
          <div className="h-11 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="h-11 rounded-xl bg-muted animate-pulse" />
        <div className="h-11 rounded-xl bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-12 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{t('holdings.fieldCurrency')}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(currency) => { field.onChange(currency); form.setValue('fundingCbu', null) }}
                  disabled={isEditing}
                >
                  <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
                    {CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{t('holdings.fieldBank')}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(bankNumber) => { field.onChange(bankNumber); form.setValue('fundingCbu', null) }}
                  disabled={isEditing}
                >
                  <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue placeholder={t('holdings.selectBankPlaceholder')} /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
                    {banks.map((bank) => <SelectItem key={bank.bankNumber} value={bank.bankNumber}>{bank.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fundingCbu"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{t('holdings.fieldFundingAccount')}</FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={!selectedBankNumber}
              >
                <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue placeholder={selectedBankNumber ? t('holdings.fundingPlaceholder') : t('holdings.pickBankFirst')} /></SelectTrigger></FormControl>
                <SelectContent className="bg-popover border-border">
                  {fundingAccounts.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      {t('holdings.noAccountInBank', { currency: selectedCurrency })}
                    </SelectItem>
                  ) : (
                    fundingAccounts.map((account) => (
                      <SelectItem key={account.cbu} value={account.cbu}>
                        {account.name} ({formatCurrency(Number(account.balance), account.currency)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ticker"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{tc('ticker')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={tc('tickerPlaceholder')} className="h-11 uppercase rounded-xl bg-background border-border placeholder:text-muted-foreground/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assetType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{t('holdings.fieldAssetType')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
                    {ASSET_TYPE_OPTIONS.map((assetType) => (
                      <SelectItem key={assetType.value} value={assetType.value}>{t(assetType.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{t('holdings.colName')}</FormLabel>
              <FormControl><Input {...field} placeholder={t('holdings.namePlaceholder')} className="h-11 rounded-xl bg-background border-border placeholder:text-muted-foreground/50" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{tc('quantity')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000001"
                    min="0"
                    className="h-11 rounded-xl bg-background border-border"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avgPurchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">{t('holdings.fieldAvgPurchasePrice')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-11 rounded-xl bg-background border-border"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 border-b border-border pb-1">{t('holdings.notificationsSection')}</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="notifyGainThresholdPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">{t('alerts.onGain')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-10 rounded-xl bg-background border-border placeholder:text-muted-foreground/30"
                      placeholder={t('holdings.thresholdPlaceholder')}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notifyLossThresholdPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">{t('alerts.onLoss')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-10 rounded-xl bg-background border-border placeholder:text-muted-foreground/30"
                      placeholder={t('holdings.thresholdPlaceholder')}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-none bg-primary text-primary-foreground hover:opacity-90" disabled={isPending}>
          {isPending
            ? isEditing ? t('holdings.updating') : t('holdings.creating')
            : isEditing ? t('holdings.update') : t('holdings.create')}
        </Button>
      </form>
    </Form>
  )
}
