import { format, formatDistanceStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  if (!iso) return ''
  try {
    const date = parseISO(iso)
    if (isNaN(date.getTime())) return iso
    if (style === 'long') {
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
    }
    return format(date, 'dd/MM/yyyy', { locale: es })
  } catch {
    return iso
  }
}

export function formatRelative(iso: string, now?: Date): string {
  if (!iso) return ''
  try {
    const date = parseISO(iso)
    if (isNaN(date.getTime())) return iso
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
      .replace('días', 'd')
      .replace('día', 'd')
  } catch {
    return iso
  }
}
