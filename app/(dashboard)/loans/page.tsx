import { Header } from '@/components/layout/Header'
import { LoansContent } from '@/components/pages/loans/LoansContent'

export default function LoansPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Loans" />
      <main className="flex-1 overflow-hidden p-4">
        <LoansContent />
      </main>
    </div>
  )
}
