import { Header } from '@/components/layout/Header'
import { DashboardContent } from '@/components/pages/dashboard/DashboardContent'

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-auto p-4">
        <DashboardContent />
      </main>
    </>
  )
}
