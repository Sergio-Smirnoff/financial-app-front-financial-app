export const INVESTMENTS_TABS = ['resumen', 'cartera', 'mercados', 'operaciones'] as const

export type InvestmentsTab = (typeof INVESTMENTS_TABS)[number]

const LEGACY_TABS: Readonly<Record<string, InvestmentsTab>> = {
  portfolio: 'cartera',
  markets: 'mercados',
  operations: 'operaciones',
}

function isInvestmentsTab(raw: string): raw is InvestmentsTab {
  return (INVESTMENTS_TABS as readonly string[]).includes(raw)
}

export function resolveInvestmentsTab(raw: string | null): InvestmentsTab {
  if (!raw) return 'resumen'
  if (isInvestmentsTab(raw)) return raw
  return Object.hasOwn(LEGACY_TABS, raw) ? LEGACY_TABS[raw] : 'resumen'
}
