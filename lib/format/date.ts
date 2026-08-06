import { format, formatDistanceStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  if (!iso) return ''
  const date = parseISO(iso)
  if (style === 'long') {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
  }
  return format(date, 'dd/MM/yyyy', { locale: es })
}

export function formatRelative(iso: string, now?: Date): string {
  if (!iso) return ''
  const date = parseISO(iso)
  const distance = formatDistanceStrict(date, now ?? new Date(), {
    addSuffix: true,
    locale: es,
  })
  return distance
    .replace('segundos', 's')
    .replace('segundo', 's')
    .replace('minutos', 'm')
    .replace('minuto', 'm')
    .replace('horas', 'h')
    .replace('hora', 'h')
}
