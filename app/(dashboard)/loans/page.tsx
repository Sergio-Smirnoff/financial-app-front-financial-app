import { Header } from '@/components/layout/Header'
import { LoansContent } from '@/components/pages/loans/LoansContent'

export default function LoansPage() {
  return (
    <>
      <Header title="Loans" />
      <main className="flex-1 overflow-auto p-4">
        <LoansContent />
      </main>
    </>
  )
}
