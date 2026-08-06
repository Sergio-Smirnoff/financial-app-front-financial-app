export interface MoneyView {
  amount: string
  currency: string
  secondary: MoneyView | null
}

export function formatMoney(
  value: MoneyView | string | number,
  opts?: { decimals?: number; currency?: string },
): string {
  const decimals = opts?.decimals ?? 2

  if (typeof value === 'object' && value !== null && 'amount' in value) {
    const primaryStr = formatSingleMoney(value.amount, value.currency, decimals)
    if (value.secondary) {
      const secStr = formatSingleMoney(value.secondary.amount, value.secondary.currency, decimals)
      return `${primaryStr} · ${secStr}`
    }
    return primaryStr
  }

  const amountStr = typeof value === 'number' ? String(value) : value
  const currency = opts?.currency ?? 'ARS'
  return formatSingleMoney(amountStr, currency, decimals)
}

function formatSingleMoney(amountStr: string, currency: string, decimals: number): string {
  const num = Number(amountStr)
  if (isNaN(num)) return amountStr
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return formatMoney(amount, { currency })
}

export function formatAmount(amount: number): string {
  const num = Number(amount)
  if (isNaN(num)) return String(amount)
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export const CURRENCIES = ['ARS', 'USD'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]
