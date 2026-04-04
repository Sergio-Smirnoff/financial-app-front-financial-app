const LOCALES: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  ARS: 'es-AR',
  BRL: 'pt-BR',
  GBP: 'en-GB',
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const locale = LOCALES[currency] ?? 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const CURRENCIES = ['USD', 'EUR', 'ARS', 'BRL', 'GBP'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]
