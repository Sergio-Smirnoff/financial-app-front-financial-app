import { Header } from '@/components/layout/Header'
import { CategoriesContent } from '@/components/pages/categories/CategoriesContent'

export default function CategoriesPage() {
  return (
    <>
      <Header title="Categories" />
      <main className="flex-1 overflow-auto p-4">
        <CategoriesContent />
      </main>
    </>
  )
}
