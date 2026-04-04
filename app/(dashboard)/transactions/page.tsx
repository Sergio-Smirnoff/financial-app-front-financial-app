import { Header } from '@/components/layout/Header'
import { TransactionsContent } from '@/components/pages/transactions/TransactionsContent'

export default function TransactionsPage() {
  return (
    <>
      <Header title="Transactions" />
      <main className="flex-1 overflow-auto p-4">
        <TransactionsContent />
      </main>
    </>
  )
}
