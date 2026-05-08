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
import { useCreateCard, useUpdateCard } from '@/lib/hooks/useCards'
import { cardSchema, CardFormValues } from '@/lib/schemas/card'
import type { Card } from '@/types/cards'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankId: number
  card?: Card | null
}

export function CardFormDialog({ open, onOpenChange, bankId, card }: Props) {
  const isEditing = !!card
  const createMutation = useCreateCard()
  const updateMutation = useUpdateCard()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      displayName: '',
      brand: 'VISA',
      cardType: 'STANDARD',
      behavior: 'INSTANT_PAYMENT',
      last4Digits: '',
      expiringDate: '',
      closingDay: 20,
      dueDay: 10,
    },
  })

  useEffect(() => {
    if (open) {
      if (card) {
        form.reset({
          displayName: card.displayName,
          brand: card.brand,
          cardType: card.cardType,
          behavior: card.behavior,
          last4Digits: card.last4Digits,
          expiringDate: card.expiringDate.slice(0, 10),
          closingDay: card.closingDay,
          dueDay: card.dueDay,
        })
      } else {
        form.reset({
          displayName: '',
          brand: 'VISA',
          cardType: 'STANDARD',
          behavior: 'INSTANT_PAYMENT',
          last4Digits: '',
          expiringDate: '',
          closingDay: 20,
          dueDay: 10,
        })
      }
    }
  }, [open, card, form])

  const onFormSubmit = async (values: CardFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: card!.id, body: { bankId, ...values } })
      } else {
        await createMutation.mutateAsync({ bankId, ...values })
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit card form:", error)
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
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Card Name (e.g. My VISA)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Personal VISA" className="bg-background border-border" />
                  </FormControl>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="INSTANT_PAYMENT">Instant payment</SelectItem>
                        <SelectItem value="INSTALLMENTS">Installments</SelectItem>
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
                name="last4Digits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Last 4 digits</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        inputMode="numeric" 
                        maxLength={4} 
                        className="bg-background border-border"
                      />
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
                    <FormLabel className="text-muted-foreground">Expiring date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="date" 
                        className="bg-background border-border"
                      />
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
                      <Input 
                        {...field}
                        type="number" 
                        min={1} 
                        max={28} 
                        className="bg-background border-border"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
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
                      <Input 
                        {...field}
                        type="number" 
                        min={1} 
                        max={28} 
                        className="bg-background border-border"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : (isEditing ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
