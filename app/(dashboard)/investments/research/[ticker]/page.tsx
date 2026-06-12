'use client'

import { useParams, useRouter } from 'next/navigation'
import { TickerChartPanel } from '@/components/pages/investments/TickerChartPanel'
import { Button } from '@/components/ui/button'

export default function TickerResearchPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const router = useRouter()
  const decodedTicker = decodeURIComponent(ticker)
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button type="button" variant="ghost" onClick={() => router.back()}>&larr; Back</Button>
      <TickerChartPanel ticker={decodedTicker} />
      {/* TODO: InvestmentsLayout should read ?add= to auto-open the New Holding dialog (future task) */}
      <Button type="button" onClick={() => router.push(`/investments?add=${encodeURIComponent(decodedTicker)}`)}>
        Add holding for {decodedTicker}
      </Button>
    </div>
  )
}
