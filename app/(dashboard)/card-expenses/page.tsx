import { Header } from '@/components/layout/Header'
import { CardExpensesContent } from '@/components/pages/card-expenses/CardExpensesContent'

export default function CardExpensesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Card Expenses" />
      <main className="flex-1 overflow-hidden p-4">
        <CardExpensesContent />
      </main>
    </div>
  )
}
