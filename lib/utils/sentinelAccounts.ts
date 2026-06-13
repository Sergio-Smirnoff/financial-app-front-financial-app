const BROKER_SENTINEL_CBUS: Record<string, string> = {
  '9990009000000000000001': 'Investment Broker (ARS)',
  '9990009000000000000002': 'Investment Broker (USD)',
  '9990009000000000000003': 'Investment Broker (EUR)',
}

export function sentinelAccountName(cbu: string): string | null {
  return BROKER_SENTINEL_CBUS[cbu] ?? null
}
