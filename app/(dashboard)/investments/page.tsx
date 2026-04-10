import { Header } from '@/components/layout/Header'
import { InvestmentsLayout } from '@/components/pages/investments/InvestmentsLayout'

export default function InvestmentsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Investments" />
      <main className="flex-1 overflow-hidden p-4">
        <InvestmentsLayout />
      </main>
    </div>
  )
}
