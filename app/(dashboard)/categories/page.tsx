import { Header } from '@/components/layout/Header'
import { CategoriesContent } from '@/components/pages/categories/CategoriesContent'

export default function CategoriesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Categories" />
      <main className="flex-1 overflow-hidden p-4">
        <CategoriesContent />
      </main>
    </div>
  )
}
