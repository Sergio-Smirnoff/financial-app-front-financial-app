'use client'

import { useParams } from 'next/navigation'
import { BankDetailContent } from '@/components/pages/banks/BankDetailContent'

export default function BankDetailPage() {
  const params = useParams()
  const bankId = parseInt(params.bankId as string)

  return (
    <div className="flex h-full w-full flex-col">
      <BankDetailContent bankId={bankId} />
    </div>
  )
}
