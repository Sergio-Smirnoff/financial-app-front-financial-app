import { Header } from '@/components/layout/Header'
import { InvestmentsLayout } from '@/components/pages/investments/InvestmentsLayout'

export default function InvestmentsPage() {
  return (
    <>
      <Header title="Investments" />
      <main className="flex-1 overflow-auto p-4">
        <InvestmentsLayout />
      </main>
    </>
  )
}
