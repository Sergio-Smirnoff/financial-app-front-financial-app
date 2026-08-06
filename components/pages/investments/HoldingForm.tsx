'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const ASSET_TYPES = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'CEDEAR', label: 'CEDEAR' },
  { value: 'BOND', label: 'Bond' },
  { value: 'FCI', label: 'FCI (Mutual Fund)' },
]

const CURRENCIES = ['ARS', 'USD'] as const

const schema = z.object({
  bankNumber: z.string().regex(/^\d{3}$/, 'Required'),
  fundingCbu: z.string().regex(/^\d{22}$/, 'Required for transaction').optional().nullable(),
  ticker: z.string().min(1, 'Required').max(20),
  name: z.string().min(1, 'Required').max(100),
  assetType: z.enum(['STOCK', 'BOND', 'CEDEAR', 'FCI']),
  quantity: z.number({ error: 'Required' }).positive('Must be positive'),
  avgPurchasePrice: z.number({ error: 'Required' }).min(0, 'Must be zero or positive'),
  currency: z.enum(CURRENCIES),
  notifyGainThresholdPct: z.number().positive('Must be positive').max(1000).optional().nullable(),
  notifyLossThresholdPct: z.number().positive('Must be positive').max(1000).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface HoldingFormProps {
  holding?: HoldingWithPrice | null
  onSuccess: () => void
}

export function HoldingForm({ holding, onSuccess }: HoldingFormProps) {
  const { banks, isLoading: banksLoading } = useBanks()
  const createHolding = useCreateHolding()
  const updateHolding = useUpdateHolding()
  const isEditing = !!holding

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
          onSuccess: () => { toast.success('Holding updated'); onSuccess() },
          onError: (e: any) => { toast.error(e.message || 'Failed to update holding') },
        },
      )
    } else {
      createHolding.mutate(data, {
        onSuccess: () => { toast.success('Holding created'); onSuccess() },
        onError: (e: any) => { toast.error(e.message || 'Failed to create holding') },
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
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Currency</FormLabel>
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
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Bank</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(bankNumber) => { field.onChange(bankNumber); form.setValue('fundingCbu', null) }}
                  disabled={isEditing}
                >
                  <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue placeholder="Select Bank" /></SelectTrigger></FormControl>
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
              <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Funding Account</FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={!selectedBankNumber}
              >
                <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue placeholder={selectedBankNumber ? 'Pay from...' : 'Pick bank first'} /></SelectTrigger></FormControl>
                <SelectContent className="bg-popover border-border">
                  {fundingAccounts.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No {selectedCurrency} account in this bank
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
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Ticker</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. GGAL" className="h-11 uppercase rounded-xl bg-background border-border placeholder:text-muted-foreground/50" />
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
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Asset Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="rounded-xl h-11 w-full bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
                    {ASSET_TYPES.map((assetType) => (
                      <SelectItem key={assetType.value} value={assetType.value}>{assetType.label}</SelectItem>
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
              <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Name</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Grupo Financiero Galicia" className="h-11 rounded-xl bg-background border-border placeholder:text-muted-foreground/50" /></FormControl>
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
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Quantity</FormLabel>
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
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Avg purchase price</FormLabel>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 border-b border-border pb-1">Notifications (optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="notifyGainThresholdPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Alert on gain %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-10 rounded-xl bg-background border-border placeholder:text-muted-foreground/30"
                      placeholder="e.g. 10"
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
                  <FormLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Alert on loss %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-10 rounded-xl bg-background border-border placeholder:text-muted-foreground/30"
                      placeholder="e.g. 10"
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
          {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update holding' : 'Create holding')}
        </Button>
      </form>
    </Form>
  )
}
