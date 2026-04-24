'use client'

import { useParams } from 'next/navigation'
import { BankTransactionsContent } from '@/components/pages/banks/BankTransactionsContent'

export default function BankTransactionsPage() {
  const params = useParams()
  const bankId = Number(params.bankId)

  return <BankTransactionsContent bankId={bankId} />
}
