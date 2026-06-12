'use client'

import { useParams, useRouter } from 'next/navigation'
import { TickerChartPanel } from '@/components/pages/investments/TickerChartPanel'
import { Button } from '@/components/ui/button'

export default function TickerResearchPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const router = useRouter()
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>&larr; Back</Button>
      <TickerChartPanel ticker={decodeURIComponent(ticker)} />
      <Button onClick={() => router.push(`/investments?add=${encodeURIComponent(ticker)}`)}>
        Add holding for {decodeURIComponent(ticker)}
      </Button>
    </div>
  )
}
