'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api/client'
import { useCreateCard, useUpdateCard } from '@/lib/hooks/useCards'
import { useAvailableBanks } from '@/lib/hooks/useBanks'
import { cardSchema, CardFormValues } from '@/lib/schemas/card'
import type { Card } from '@/types/cards'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankNumber?: string
  card?: Card | null
}

const DEFAULTS: CardFormValues = {
  bankNumber: '',
  brand: 'VISA',
  cardType: 'STANDARD',
  behavior: 'INSTANT_PAYMENT',
  cardNumber: '',
  expiringDate: '',
  closingDay: 20,
  dueDay: 10,
}

export function CardFormDialog({ open, onOpenChange, bankNumber, card }: Props) {
  const isEditing = !!card
  const { data: availableBanks } = useAvailableBanks()
  const createMutation = useCreateCard()
  const updateMutation = useUpdateCard()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { ...DEFAULTS, bankNumber: bankNumber ?? '' },
  })

  useEffect(() => {
    if (!open) return
    if (card) {
      form.reset({
        bankNumber: card.bankNumber,
        brand: card.brand,
        cardType: card.cardType,
        behavior: card.behavior,
        cardNumber: card.cardNumber,
        expiringDate: card.expiringDate,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
      })
    } else {
      form.reset({ ...DEFAULTS, bankNumber: bankNumber ?? '' })
    }
  }, [open, card, bankNumber, form])

  const onFormSubmit = async (values: CardFormValues) => {
    try {
      if (isEditing && card) {
        await updateMutation.mutateAsync({
          cardNumber: card.cardNumber,
          body: { expiringDate: values.expiringDate, closingDay: values.closingDay, dueDay: values.dueDay },
        })
      } else {
        await createMutation.mutateAsync(values)
      }
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save card'
      if (
        error instanceof ApiError &&
        (error.code === 'invalid_card_number' || error.code === 'invalid_card_check_digit')
      ) {
        form.setError('cardNumber', { message })
      }
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Card' : 'New Card'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="bankNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Bank</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                    <FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select bank" /></SelectTrigger></FormControl>
                    <SelectContent className="bg-popover border-border">
                      {(availableBanks ?? []).map((b) => (
                        <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.bankNumber} — {b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Brand</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="VISA">Visa</SelectItem>
                        <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                        <SelectItem value="AMEX">Amex</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="SILVER">Silver</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="BLACK">Black</SelectItem>
                        <SelectItem value="PLATINUM">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="behavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Behavior</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="INSTANT_PAYMENT">Instant payment</SelectItem>
                        <SelectItem value="CREDIT">Credit (installments)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Card number (16 digits, or 15 to auto-complete)</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" maxLength={16} disabled={isEditing} className="bg-background border-border tracking-widest" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiringDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Expiry (MM/YY)</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={5} placeholder="08/30" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="closingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Closing day</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} max={31} className="bg-background border-border" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Due day</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} max={31} className="bg-background border-border" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : (isEditing ? 'Update' : 'Create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
