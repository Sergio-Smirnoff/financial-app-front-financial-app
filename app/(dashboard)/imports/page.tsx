import { Header } from '@/components/layout/Header'
import { ImportWizard } from '@/components/pages/imports/ImportWizard'
import { ImportHistory } from '@/components/pages/imports/ImportHistory'

export default function ImportsPage() {
  return (
    <>
      <Header title="Imports" />
      <main className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="bg-card border rounded-xl p-6">
            <ImportWizard />
          </div>
          <div className="bg-card border rounded-xl p-4">
            <ImportHistory />
          </div>
        </div>
      </main>
    </>
  )
}
