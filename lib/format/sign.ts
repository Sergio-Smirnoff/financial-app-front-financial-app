export const MINUS = '−'

export function withTrueMinus(formatted: string): string {
  return formatted.startsWith('-') ? `${MINUS}${formatted.slice(1).trimStart()}` : formatted
}
