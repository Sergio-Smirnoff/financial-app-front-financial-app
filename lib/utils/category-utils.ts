const CATEGORY_ICONS: Record<string, string> = {
  comida: '🍕',
  transporte: '🚗',
  servicios: '💡',
  hogar: '🏠',
  entretenimiento: '🎮',
  salud: '💊',
  educación: '📚',
  compras: '🛒',
  viajes: '✈️',
  finanzas: '💰',
  regalos: '🎁',
 default: '📁',
}

export function getCategoryIcon(name: string): string {
  const lowerName = name.toLowerCase()
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerName.includes(key)) {
      return icon
    }
  }
  return CATEGORY_ICONS.default
}
