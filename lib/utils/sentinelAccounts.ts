const SENTINEL_CBU_LABELS: Record<string, string> = {
  '9990009000000000000001': 'Brokerage',
  '9990009000000000000002': 'Brokerage',
  '9990009000000000000003': 'Brokerage',
  '0000000000000000000000': 'External',
}

export function sentinelAccountName(cbu: string): string | null {
  return SENTINEL_CBU_LABELS[cbu] ?? null
}
