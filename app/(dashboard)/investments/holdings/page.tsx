import { Header } from '@/components/layout/Header'
import { InvestmentsLayout } from '@/components/pages/investments/InvestmentsLayout'

export default function HoldingsPage() {
  return (
    <>
      <Header title="Investments" />
      <main className="flex-1 overflow-auto p-4">
        <InvestmentsLayout defaultTab="holdings" />
      </main>
    </>
  )
}
