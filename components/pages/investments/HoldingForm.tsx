'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
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
import { formatCurrency } from '@/lib/utils/currency'
import type { HoldingWithPrice } from '@/types/investments'

const ASSET_TYPES = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'CEDEAR', label: 'CEDEAR' },
  { value: 'BOND', label: 'Bond' },
  { value: 'FCI', label: 'FCI (Mutual Fund)' },
]

const CURRENCIES = ['ARS', 'USD'] as const

const schema = z.object({
  bankId: z.number().positive('Required'),
  bankAccountId: z.number().positive('Required'),
  fundingAccountId: z.number().positive('Required for transaction'),
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
  const { banks } = useBanks()
  const createHolding = useCreateHolding()
  const updateHolding = useUpdateHolding()
  const isEditing = !!holding

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankId: holding?.bankId ?? undefined,
      bankAccountId: holding?.bankAccountId ?? undefined,
      fundingAccountId: undefined,
      ticker: holding?.ticker ?? '',
      name: holding?.name ?? '',
      assetType: holding?.assetType ?? 'STOCK',
      quantity: holding?.quantity ?? undefined,
      avgPurchasePrice: holding?.avgPurchasePrice ?? undefined,
      currency: (holding?.currency?.toUpperCase() as 'ARS' | 'USD') ?? 'ARS',
      notifyGainThresholdPct: holding?.notifyGainThresholdPct ?? null,
      notifyLossThresholdPct: holding?.notifyLossThresholdPct ?? null,
    },
  })

  const selectedBankId = form.watch('bankId')
  const selectedCurrency = form.watch('currency')

  const currentBank = useMemo(() => banks.find(b => b.id === selectedBankId), [banks, selectedBankId])

  const investmentAccounts = useMemo(() => {
    if (!currentBank) return []
    return currentBank.accounts.filter(a => a.type === 'INVESTMENT' && a.currency.toUpperCase() === selectedCurrency.toUpperCase()) || []
  }, [currentBank, selectedCurrency])

  const fundingAccounts = useMemo(() => {
    if (!currentBank) return []
    return currentBank.accounts.filter(a => a.type !== 'INVESTMENT' && a.currency.toUpperCase() === selectedCurrency.toUpperCase()) || []
  }, [currentBank, selectedCurrency])

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      ticker: values.ticker.toUpperCase(),
      notifyGainThresholdPct: values.notifyGainThresholdPct ?? undefined,
      notifyLossThresholdPct: values.notifyLossThresholdPct ?? undefined,
    }

    if (isEditing) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Currency</FormLabel>
                    <Select value={field.value} onValueChange={(v) => {
                        field.onChange(v);
                        // Force refresh of accounts by resetting values, but keep bank
                        form.setValue('bankAccountId', undefined as any);
                        form.setValue('fundingAccountId', undefined as any);
                    }}>
                        <FormControl><SelectTrigger className="rounded-xl h-11 w-full"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                            {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="bankId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">Bank</FormLabel>
                        <Select 
                            value={field.value?.toString()} 
                            onValueChange={(v) => {
                                const id = parseInt(v);
                                field.onChange(id);
                                form.setValue('bankAccountId', undefined as any);
                                form.setValue('fundingAccountId', undefined as any);
                            }}
                        >
                            <FormControl><SelectTrigger className="rounded-xl h-11 w-full"><SelectValue placeholder="Select Bank" /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-xl">
                                {banks.map((b) => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="bankAccountId"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Investment Account</FormLabel>
                <Select 
                    value={field.value?.toString()} 
                    onValueChange={(v) => field.onChange(parseInt(v))}
                    disabled={!selectedBankId}
                >
                    <FormControl><SelectTrigger className="rounded-xl h-11 w-full"><SelectValue placeholder={selectedBankId ? "Select account" : "Pick bank first"} /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">
                    {investmentAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                        {a.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="fundingAccountId"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Funding Account</FormLabel>
                <Select 
                    value={field.value?.toString()} 
                    onValueChange={(v) => field.onChange(parseInt(v))}
                    disabled={!selectedBankId}
                >
                    <FormControl><SelectTrigger className="rounded-xl h-11 w-full"><SelectValue placeholder={selectedBankId ? "Pay from..." : "Pick bank first"} /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">
                    {fundingAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                        {a.name} ({formatCurrency(a.balance, a.currency)})
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ticker"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Ticker</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. GGAL" className="h-11 uppercase rounded-xl" />
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
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Asset Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="rounded-xl h-11 w-full"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="rounded-xl">
                    {ASSET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
              <FormLabel className="text-xs font-bold uppercase text-zinc-500">Name</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Grupo Financiero Galicia" className="h-11 rounded-xl" /></FormControl>
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
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000001"
                    min="0"
                    className="h-11 rounded-xl"
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
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Avg purchase price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-11 rounded-xl"
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
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b pb-1">Notifications (optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="notifyGainThresholdPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Alert on gain %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-10 rounded-xl"
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
                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Alert on loss %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-10 rounded-xl"
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

        <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg" disabled={isPending}>
          {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update holding' : 'Create holding')}
        </Button>
      </form>
    </Form>
  )
}
