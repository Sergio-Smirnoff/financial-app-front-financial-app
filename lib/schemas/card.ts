import { z } from "zod";

export const cardSchema = z.object({
  displayName: z.string().min(1, 'Required'),
  brand: z.enum(['VISA', 'MASTERCARD', 'AMEX']),
  cardType: z.enum(['STANDARD', 'SILVER', 'GOLD', 'BLACK', 'PLATINUM']),
  behavior: z.enum(['INSTANT_PAYMENT', 'INSTALLMENTS']),
  last4Digits: z.string().regex(/^\d{4}$/, 'Must be 4 digits'),
  expiringDate: z.string().min(1, 'Required'),
  closingDay: z.number().int().min(1).max(28),
  dueDay: z.number().int().min(1).max(28),
});

export type CardFormValues = z.infer<typeof cardSchema>;
