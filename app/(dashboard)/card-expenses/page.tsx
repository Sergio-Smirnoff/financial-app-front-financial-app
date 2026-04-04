import { Header } from '@/components/layout/Header'
import { CardExpensesContent } from '@/components/pages/card-expenses/CardExpensesContent'

export default function CardExpensesPage() {
  return (
    <>
      <Header title="Card Expenses" />
      <main className="flex-1 overflow-auto p-4">
        <CardExpensesContent />
      </main>
    </>
  )
}
