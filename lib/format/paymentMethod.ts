const PAYMENT_METHOD_LABELS: Record<string, string> = {
  DEBIT_CARD: 'Tarjeta de débito',
  CREDIT_CARD: 'Tarjeta de crédito',
  TRANSFER: 'Transferencia',
  AUTOMATIC_DEBIT: 'Débito automático',
  DEPOSIT: 'Depósito',
  OTHER: 'Otro',
}

export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return 'Débito automático'
  return PAYMENT_METHOD_LABELS[method] ?? method
}
