import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MM/dd/yyyy')
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMMM yyyy')
}

export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function currentMonthRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: toIsoDate(startOfMonth(now)),
    to: toIsoDate(endOfMonth(now)),
  }
}

export function currentYearRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: toIsoDate(startOfYear(now)),
    to: toIsoDate(endOfYear(now)),
  }
}

export function prevMonthRange(monthsBack: number = 1): { from: string; to: string } {
  const target = subMonths(new Date(), monthsBack)
  return {
    from: toIsoDate(startOfMonth(target)),
    to: toIsoDate(endOfMonth(target)),
  }
}
